import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { EvalNode } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'
import { IncrementalEvaluationGraph } from '@/modules/illustrator/lib/sequence/evaluation/incremental-eval-graph'
import { AudioEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/audio-eval-node'
import { CameraEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/camera-eval-node'
import { ConstraintsEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/constraints-eval-node'
import { FXEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/fx-eval-node'
import { createSequenceEvalNodes } from '@/modules/illustrator/lib/sequence/evaluation/nodes/sequence-eval-node'
import { RuntimeDependencyGraph } from '@/modules/illustrator/lib/sequence/evaluation/runtime-dependency-graph'
import type { AnimationTrack } from '@/modules/illustrator/lib/sequence/sequence.types'
import { globalPluginRegistry, type PluginRegistry } from '@/modules/illustrator/lib/plugins/plugin-registry'
import { registerBuiltinPlugins } from '@/modules/illustrator/lib/plugins/register-builtin-plugins'

export type EvalGraphBuildInput = {
  assetManager: AssetManager
  tracks: AnimationTrack[]
  pluginRegistry?: PluginRegistry
}

export type EvalGraphBuildResult = {
  graph: IncrementalEvaluationGraph
  runtimeGraph: RuntimeDependencyGraph
}

function createStubNode(
  registry: PluginRegistry,
  id: string,
  fallback: () => EvalNode,
): EvalNode {
  return registry.createEvalNode(id) ?? fallback()
}

export function buildEvalGraph(input: EvalGraphBuildInput): EvalGraphBuildResult {
  const registry = input.pluginRegistry ?? registerBuiltinPlugins(globalPluginRegistry)
  const runtimeGraph = new RuntimeDependencyGraph()
  const nodes: EvalNode[] = []

  const sequenceNodes = createSequenceEvalNodes(input.assetManager, input.tracks)
  nodes.push(...sequenceNodes)
  for (const node of sequenceNodes) {
    runtimeGraph.addNode({ id: node.id, kind: 'track' })
  }

  const constraints = createStubNode(registry, 'eval:constraints', () => new ConstraintsEvalNode())
  const fx = createStubNode(registry, 'eval:fx', () => new FXEvalNode())
  const audio = createStubNode(registry, 'eval:audio', () => new AudioEvalNode())

  runtimeGraph.addNode({ id: constraints.id, kind: 'constraint' })
  runtimeGraph.addNode({ id: fx.id, kind: 'fx' })
  runtimeGraph.addNode({ id: audio.id, kind: 'audio' })
  nodes.push(constraints, fx, audio)

  for (const trackNode of sequenceNodes) {
    runtimeGraph.addEdge({ from: trackNode.id, to: constraints.id, kind: 'dependsOn' })
  }
  runtimeGraph.addEdge({ from: constraints.id, to: fx.id, kind: 'dependsOn' })

  if (input.tracks.some((track) => track.kind === 'camera')) {
    const cameraNode = new CameraEvalNode()
    nodes.push(cameraNode)
    runtimeGraph.addNode({ id: cameraNode.id, kind: 'camera' })
    for (const trackNode of sequenceNodes) {
      runtimeGraph.addEdge({ from: trackNode.id, to: cameraNode.id, kind: 'dependsOn' })
    }
    runtimeGraph.addEdge({ from: fx.id, to: cameraNode.id, kind: 'dependsOn' })
  }

  const graph = new IncrementalEvaluationGraph({
    nodes,
    runtimeGraph,
    assetManager: input.assetManager,
  })

  return { graph, runtimeGraph }
}
