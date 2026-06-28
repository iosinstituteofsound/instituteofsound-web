import type { ExportFrame } from '@/modules/illustrator/lib/export/export.types'

type Palette = Uint8Array

function buildPalette(frames: ExportFrame[]): { palette: Palette; indices: Uint8Array[] } {
  const colorMap = new Map<number, number>()
  const palette: number[] = []

  const indexFrames: Uint8Array[] = frames.map((frame) => {
    const indices = new Uint8Array(frame.width * frame.height)
    for (let i = 0; i < frame.width * frame.height; i += 1) {
      const r = frame.rgba[i * 4] ?? 0
      const g = frame.rgba[i * 4 + 1] ?? 0
      const b = frame.rgba[i * 4 + 2] ?? 0
      const key = (r << 16) | (g << 8) | b
      let idx = colorMap.get(key)
      if (idx == null) {
        if (palette.length / 3 >= 256) {
          idx = 0
        } else {
          idx = palette.length / 3
          colorMap.set(key, idx)
          palette.push(r, g, b)
        }
      }
      indices[i] = idx
    }
    return indices
  })

  while (palette.length < 256 * 3) palette.push(0)
  return { palette: new Uint8Array(palette.slice(0, 256 * 3)), indices: indexFrames }
}

function lzwEncode(minCodeSize: number, pixels: Uint8Array): Uint8Array {
  const clearCode = 1 << minCodeSize
  const endCode = clearCode + 1
  let codeSize = minCodeSize + 1
  let nextCode = endCode + 1

  const table = new Map<number, number>()
  for (let i = 0; i < clearCode; i += 1) table.set(i, i)

  const codes: number[] = [clearCode]

  if (pixels.length === 0) {
    codes.push(endCode)
  } else {
    let prefix = pixels[0] ?? 0
    for (let i = 1; i < pixels.length; i += 1) {
      const next = pixels[i] ?? 0
      const key = prefix * 256 + next
      if (table.has(key)) {
        prefix = table.get(key)!
      } else {
        codes.push(prefix)
        table.set(key, nextCode)
        nextCode += 1
        if (nextCode === 1 << codeSize && codeSize < 12) codeSize += 1
        prefix = next
      }
    }
    codes.push(prefix)
    codes.push(endCode)
  }

  const packed: number[] = []
  let bitBuffer = 0
  let bitCount = 0

  for (const code of codes) {
    bitBuffer |= code << bitCount
    bitCount += codeSize
    while (bitCount >= 8) {
      packed.push(bitBuffer & 0xff)
      bitBuffer >>= 8
      bitCount -= 8
    }
    if (nextCode === 1 << codeSize && codeSize < 12) {
      // code size increases after adding a code that hits the limit
    }
  }
  if (bitCount > 0) packed.push(bitBuffer & 0xff)

  return new Uint8Array(packed)
}

function writeSubBlocks(data: Uint8Array): Uint8Array {
  const chunks: number[] = []
  for (let i = 0; i < data.length; i += 255) {
    const slice = data.subarray(i, Math.min(i + 255, data.length))
    chunks.push(slice.length, ...slice)
  }
  chunks.push(0)
  return new Uint8Array(chunks)
}

export function encodeAnimatedGif(frames: ExportFrame[], delaysMs: number[], loop = true): Blob {
  if (frames.length === 0) throw new Error('encodeAnimatedGif: no frames')

  const { width, height } = frames[0]
  const { palette, indices } = buildPalette(frames)
  const minCodeSize = 8
  const bytes: number[] = []

  const pushStr = (s: string) => {
    for (let i = 0; i < s.length; i += 1) bytes.push(s.charCodeAt(i))
  }
  const push16 = (n: number) => {
    bytes.push(n & 0xff, (n >> 8) & 0xff)
  }

  pushStr('GIF89a')
  push16(width)
  push16(height)
  bytes.push(0xf7, 0, 0)
  bytes.push(...palette)

  if (loop) {
    bytes.push(0x21, 0xff, 0x0b)
    pushStr('NETSCAPE2.0')
    bytes.push(0x03, 0x01, 0x00, 0x00, 0x00)
  }

  frames.forEach((frame, index) => {
    const delay = Math.max(2, Math.round((delaysMs[index] ?? 100) / 10))
    bytes.push(0x21, 0xf9, 0x04, 0x00)
    push16(delay)
    bytes.push(0x00, 0x00)
    bytes.push(0x2c, 0, 0, 0, 0)
    push16(frame.width)
    push16(frame.height)
    bytes.push(0x00)
    const lzw = lzwEncode(minCodeSize, indices[index] ?? new Uint8Array())
    bytes.push(minCodeSize)
    bytes.push(...writeSubBlocks(lzw))
  })

  bytes.push(0x3b)
  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' })
}
