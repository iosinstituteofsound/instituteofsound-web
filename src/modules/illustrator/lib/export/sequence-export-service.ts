import type {
  ExportFrame,
  ExportPlugin,
  SequenceExportInput,
  SequenceExportResult,
} from '@/modules/illustrator/lib/export/export.types'
import { compositeToExportFrame, solidExportFrame } from '@/modules/illustrator/lib/export/frame-sampler'
import { encodeAnimatedGif } from '@/modules/illustrator/lib/export/gif-encoder'
import { encodeWebmFromFrames } from '@/modules/illustrator/lib/export/webm-exporter'

export function sampleExportFrames(input: SequenceExportInput): ExportFrame[] {
  const { graph, getState, sequenceId, range, fps, width, height, onProgress } = input
  const frameMs = 1000 / fps
  const totalFrames = Math.max(1, Math.ceil((range.endMs - range.startMs) / frameMs))
  const frames: ExportFrame[] = []

  for (let i = 0; i < totalFrames; i += 1) {
    const timeMs = range.startMs + i * frameMs
    const state = getState()
    const result = graph.evaluate(timeMs, state, sequenceId)
    let frame = compositeToExportFrame(result.composite, width, height)

    if (result.composite.layers.size === 0) {
      const shade = 180 + (i % 3) * 20
      frame = solidExportFrame(width, height, [shade, shade, shade])
    }

    frames.push(frame)
    onProgress?.({ frame: i + 1, totalFrames, phase: 'sampling' })
  }

  return frames
}

export class GifExportPlugin implements ExportPlugin {
  readonly format = 'gif' as const

  async export(input: SequenceExportInput, frames: ExportFrame[]): Promise<Blob> {
    input.onProgress?.({ frame: 0, totalFrames: frames.length, phase: 'encoding' })
    const frameMs = 1000 / input.fps
    const blob = encodeAnimatedGif(
      frames,
      frames.map(() => frameMs),
      true,
    )
    input.onProgress?.({ frame: frames.length, totalFrames: frames.length, phase: 'done' })
    return blob
  }
}

export class WebmExportPlugin implements ExportPlugin {
  readonly format = 'webm' as const

  async export(input: SequenceExportInput, frames: ExportFrame[]): Promise<Blob> {
    input.onProgress?.({ frame: 0, totalFrames: frames.length, phase: 'encoding' })
    const blob = await encodeWebmFromFrames(frames, input.fps, (width, height) => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      return canvas
    })
    input.onProgress?.({ frame: frames.length, totalFrames: frames.length, phase: 'done' })
    return blob
  }
}

export async function exportSequenceAnimation(
  input: SequenceExportInput,
  format: 'gif' | 'webm',
  plugin?: ExportPlugin,
): Promise<SequenceExportResult> {
  const frames = sampleExportFrames(input)
  const exporter =
    plugin ??
    (format === 'gif' ? new GifExportPlugin() : new WebmExportPlugin())
  const blob = await exporter.export(input, frames)
  return { blob, frameCount: frames.length, format }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
