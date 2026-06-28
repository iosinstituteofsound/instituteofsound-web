import type { ExportFrame } from '@/modules/illustrator/lib/export/export.types'

export function encodeWebmFromFrames(
  frames: ExportFrame[],
  fps: number,
  canvasFactory: (width: number, height: number) => HTMLCanvasElement,
): Promise<Blob> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder unavailable — WebM export requires a browser environment')
  }

  const { width, height } = frames[0]
  const canvas = canvasFactory(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('WebM export: 2d context unavailable')

  const stream = canvas.captureStream(fps)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : ''
  if (!mimeType) throw new Error('WebM export: no supported MediaRecorder mime type')

  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: Blob[] = []

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onerror = () => reject(new Error('MediaRecorder failed'))
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))

    recorder.start()
    let frameIndex = 0
    const frameDelayMs = 1000 / fps

    const drawNext = () => {
      if (frameIndex >= frames.length) {
        recorder.stop()
        return
      }
      const frame = frames[frameIndex]!
      const imageData = new ImageData(new Uint8ClampedArray(frame.rgba), width, height)
      ctx.putImageData(imageData, 0, 0)
      frameIndex += 1
      window.setTimeout(drawNext, frameDelayMs)
    }

    drawNext()
  })
}
