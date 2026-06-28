import type { IncrementalEvaluationGraph } from '@/modules/illustrator/lib/sequence/evaluation/incremental-eval-graph'
import type { SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'

export type TimeRange = {
  startMs: number
  endMs: number
}

export type ExportProgress = {
  frame: number
  totalFrames: number
  phase: 'sampling' | 'encoding' | 'done'
}

export type ExportFrame = {
  width: number
  height: number
  rgba: Uint8ClampedArray
}

export type SequenceExportInput = {
  graph: IncrementalEvaluationGraph
  getState: () => Readonly<SequenceState>
  sequenceId: string
  range: TimeRange
  fps: number
  width: number
  height: number
  onProgress?: (progress: ExportProgress) => void
}

export type SequenceExportResult = {
  blob: Blob
  frameCount: number
  format: 'gif' | 'webm'
}

export type ExportPlugin = {
  readonly format: 'gif' | 'webm'
  export(input: SequenceExportInput, frames: ExportFrame[]): Promise<Blob>
}
