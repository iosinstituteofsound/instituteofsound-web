import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'

let worker: Worker | null = null
let requestId = 0

function getWorker() {
  if (typeof Worker === 'undefined') return null
  if (!worker) {
    worker = new Worker(new URL('./studio-serialize.worker.ts', import.meta.url), { type: 'module' })
  }
  return worker
}

export function encodeLayerBuffersAsync(buffers: ArrayBuffer[]): Promise<string[]> {
  const instance = getWorker()
  if (!instance) {
    return Promise.resolve(
      buffers.map((buffer) => {
        const bytes = new Uint8Array(buffer)
        const chunk = 0x8000
        let binary = ''
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
        }
        return btoa(binary)
      }),
    )
  }

  const id = ++requestId
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<{ type: string; id: number; dataBase64: string[] }>) => {
      if (event.data.type !== 'encoded-layers' || event.data.id !== id) return
      instance.removeEventListener('message', onMessage)
      instance.removeEventListener('error', onError)
      resolve(event.data.dataBase64)
    }
    const onError = (error: ErrorEvent) => {
      instance.removeEventListener('message', onMessage)
      instance.removeEventListener('error', onError)
      reject(error.error ?? new Error('Layer encode worker failed'))
    }
    instance.addEventListener('message', onMessage)
    instance.addEventListener('error', onError)
    instance.postMessage({ type: 'encode-layers', id, buffers }, buffers)
  })
}

export type LayerPixelPayload = {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  width: number
  height: number
  buffer: ArrayBuffer
}

export function extractLayerPixelPayloads(layers: PaintLayer[]): LayerPixelPayload[] {
  return layers.map((layer) => {
    const { width, height } = layer.canvas
    const ctx = layer.canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      return {
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        locked: layer.locked,
        opacity: layer.opacity,
        width,
        height,
        buffer: new ArrayBuffer(0),
      }
    }
    const imageData = ctx.getImageData(0, 0, width, height)
    const bytes = imageData.data
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    return {
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: layer.locked,
      opacity: layer.opacity,
      width,
      height,
      buffer,
    }
  })
}
