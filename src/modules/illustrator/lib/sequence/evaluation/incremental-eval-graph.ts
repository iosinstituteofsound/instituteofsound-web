import {
  emptyComposite,
  mergeComposites,
  type EvalNode,
} from '@/modules/illustrator/lib/sequence/evaluation/eval-node'
import { RuntimeDependencyGraph } from '@/modules/illustrator/lib/sequence/evaluation/runtime-dependency-graph'
import { ResolveCache, type CompositeCacheStats } from '@/modules/illustrator/lib/sequence/evaluation/resolve-cache'
import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { CompositeResult, LayerComposite, SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'

export type IncrementalEvaluationGraphOptions = {
  nodes: EvalNode[]
  runtimeGraph: RuntimeDependencyGraph
  assetManager: AssetManager
}

export type EvalGraphStats = CompositeCacheStats & {
  lastEvaluatedNodeIds: string[]
}

export class IncrementalEvaluationGraph {
  private nodes: Map<string, EvalNode>
  private runtimeGraph: RuntimeDependencyGraph
  private assetManager: AssetManager
  private cache = new ResolveCache()
  private dirtySet = new Set<string>()
  private nodeOutputs = new Map<string, LayerComposite>()
  private lastEvaluatedNodeIds: string[] = []

  constructor(options: IncrementalEvaluationGraphOptions) {
    this.nodes = new Map(options.nodes.map((n) => [n.id, n]))
    this.runtimeGraph = options.runtimeGraph
    this.assetManager = options.assetManager
  }

  getCache(): ResolveCache {
    return this.cache
  }

  getEvalStats(): EvalGraphStats {
    return {
      ...this.cache.getCompositeStats(),
      lastEvaluatedNodeIds: [...this.lastEvaluatedNodeIds],
    }
  }

  markDirty(nodeId: string): void {
    const affected = this.runtimeGraph.propagateDirty(nodeId)
    for (const id of affected) {
      this.dirtySet.add(id)
      this.nodes.get(id)?.markDirty()
      this.nodeOutputs.delete(id)
    }
    this.cache.bumpGraphVersion()
  }

  propagateDirty(): string[] {
    return [...this.dirtySet]
  }

  private hasDirtyNodes(): boolean {
    if (this.dirtySet.size > 0) return true
    for (const node of this.nodes.values()) {
      if (node.isDirty()) return true
    }
    return false
  }

  evaluate(timeMs: number, state: Readonly<SequenceState>, sequenceId: string): CompositeResult {
    const cacheKey = this.cache.compositeKey(sequenceId, timeMs)
    const cachedComposite = this.cache.getComposite(cacheKey)
    if (cachedComposite && !this.hasDirtyNodes()) {
      this.lastEvaluatedNodeIds = []
      this.cache.compositeCache.setLastNodesEvaluated(0)
      return { composite: cachedComposite, graphVersion: this.cache.compositeCache.getGraphVersion() }
    }

    const order = this.runtimeGraph.evaluationOrder().filter((id) => this.nodes.has(id))
    let composite = emptyComposite()
    const evaluated: string[] = []
    const ctx = {
      timeMs,
      state,
      sequenceId,
      assetManager: this.assetManager,
      cache: this.cache,
    }

    for (const id of order) {
      const node = this.nodes.get(id)!
      const nodeDirty = this.dirtySet.has(id) || node.isDirty()
      const cachedNode = this.nodeOutputs.get(id)

      if (!nodeDirty && cachedNode) {
        composite = mergeComposites(composite, cachedNode) as typeof composite
        continue
      }

      const out = node.evaluate(ctx)
      this.nodeOutputs.set(id, out.composite)
      composite = mergeComposites(composite, out.composite) as typeof composite
      evaluated.push(id)
      node.clearDirty?.()
    }

    this.lastEvaluatedNodeIds = evaluated
    this.cache.compositeCache.setLastNodesEvaluated(evaluated.length)
    this.cache.setComposite(cacheKey, composite)
    this.dirtySet.clear()
    return { composite, graphVersion: this.cache.compositeCache.getGraphVersion() }
  }

  evaluateDirty(timeMs: number, state: Readonly<SequenceState>, sequenceId: string): CompositeResult {
    return this.evaluate(timeMs, state, sequenceId)
  }
}
