import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import {
  IncrementalEvaluationGraph,
  type EvalGraphStats,
} from '@/modules/illustrator/lib/sequence/evaluation/incremental-eval-graph'
import { PlaybackClock } from '@/modules/illustrator/lib/sequence/time/playback-clock'
import type { SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'

export type SchedulerOptions = {
  graph: IncrementalEvaluationGraph
  assetManager: AssetManager
  getState: () => Readonly<SequenceState>
  onFrame?: (timeMs: number) => void
}

/** Sits above IncrementalEvaluationGraph — drives playback + eval on rAF. */
export class SequenceScheduler {
  private graph: IncrementalEvaluationGraph
  private getState: () => Readonly<SequenceState>
  private onFrame?: (timeMs: number) => void
  readonly clock = new PlaybackClock()
  private rafId: number | null = null
  private scrubRafId: number | null = null
  private pendingScrubMs: number | null = null

  constructor(options: SchedulerOptions) {
    this.graph = options.graph
    this.getState = options.getState
    this.onFrame = options.onFrame
  }

  getGraph(): IncrementalEvaluationGraph {
    return this.graph
  }

  getEvalStats(): EvalGraphStats {
    return this.graph.getEvalStats()
  }

  evaluateAt(timeMs: number): void {
    const state = this.getState()
    const sequenceId = state.activeSequenceId
    const seq = state.sequences[sequenceId]
    if (!seq) return
    this.graph.evaluate(timeMs, state, sequenceId)
    this.onFrame?.(timeMs)
  }

  /** Coalesce rapid scrub seeks to one eval per animation frame (FT-040). */
  seekScrub(timeMs: number): void {
    this.pendingScrubMs = timeMs
    if (this.scrubRafId != null) return
    this.scrubRafId = requestAnimationFrame(() => {
      this.scrubRafId = null
      const target = this.pendingScrubMs
      this.pendingScrubMs = null
      if (target == null) return
      this.clock.seek(target)
      this.evaluateAt(target)
    })
  }

  seek(timeMs: number): void {
    this.clock.seek(timeMs)
    this.evaluateAt(timeMs)
  }

  play(): void {
    this.clock.play()
    this.startLoop()
  }

  pause(): void {
    this.clock.pause()
    this.stopLoop()
  }

  markDirty(nodeId: string): void {
    this.graph.markDirty(nodeId)
  }

  warmupCompositeCache(startMs: number, endMs: number, stepMs = 33): void {
    const state = this.getState()
    const sequenceId = state.activeSequenceId
    for (let t = startMs; t <= endMs; t += stepMs) {
      this.graph.evaluate(t, state, sequenceId)
    }
  }

  private startLoop(): void {
    if (this.rafId != null) return
    const loop = (now: number) => {
      const state = this.getState()
      const seq = state.sequences[state.activeSequenceId]
      if (!seq) {
        this.stopLoop()
        return
      }
      const timeMs = this.clock.tick(now, seq.metadata.durationMs, state.settings.playbackMode)
      this.evaluateAt(timeMs)
      if (this.clock.getState().playing) {
        this.rafId = requestAnimationFrame(loop)
      } else {
        this.rafId = null
      }
    }
    this.rafId = requestAnimationFrame(loop)
  }

  private stopLoop(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.scrubRafId != null) {
      cancelAnimationFrame(this.scrubRafId)
      this.scrubRafId = null
    }
  }

  dispose(): void {
    this.stopLoop()
  }
}
