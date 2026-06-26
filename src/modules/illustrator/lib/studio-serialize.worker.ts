type EncodeLayerMessage = {
  type: 'encode-layers'
  id: number
  buffers: ArrayBuffer[]
}

type EncodeLayerResult = {
  type: 'encoded-layers'
  id: number
  dataBase64: string[]
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

self.onmessage = (event: MessageEvent<EncodeLayerMessage>) => {
  if (event.data.type !== 'encode-layers') return
  const { id, buffers } = event.data
  const dataBase64 = buffers.map((buffer) => bytesToBase64(new Uint8Array(buffer)))
  const result: EncodeLayerResult = { type: 'encoded-layers', id, dataBase64 }
  self.postMessage(result)
}
