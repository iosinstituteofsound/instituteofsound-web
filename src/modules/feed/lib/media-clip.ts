function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1
  const bitDepth = 16
  const samples = buffer.length
  const blockAlign = (numChannels * bitDepth) / 8
  const byteRate = sampleRate * blockAlign
  const dataSize = samples * blockAlign
  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < samples; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i] ?? 0))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export async function trimAudioBlob(blob: Blob, startSec: number, endSec: number): Promise<Blob> {
  if (endSec <= startSec) {
    throw new Error('Invalid trim range')
  }

  const arrayBuffer = await blob.arrayBuffer()
  const audioCtx = new AudioContext()

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0))
    const sampleRate = audioBuffer.sampleRate
    const startSample = Math.floor(startSec * sampleRate)
    const endSample = Math.floor(endSec * sampleRate)
    const length = Math.max(0, endSample - startSample)

    if (length === 0) {
      throw new Error('Invalid trim range')
    }

    const trimmed = audioCtx.createBuffer(audioBuffer.numberOfChannels, length, sampleRate)
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      trimmed.getChannelData(channel).set(audioBuffer.getChannelData(channel).subarray(startSample, endSample))
    }

    return audioBufferToWav(trimmed)
  } finally {
    await audioCtx.close()
  }
}

export async function trimVideoBlob(blob: Blob, startSec: number, endSec: number): Promise<Blob> {
  if (endSec <= startSec) {
    throw new Error('Invalid trim range')
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    const objectUrl = URL.createObjectURL(blob)
    video.src = objectUrl

    video.onloadedmetadata = () => {
      const clipDuration = Math.min(endSec, video.duration) - startSec
      if (clipDuration <= 0) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Invalid trim range'))
        return
      }

      let stream: MediaStream
      try {
        const videoWithCapture = video as HTMLVideoElement & { captureStream?: () => MediaStream }
        if (!videoWithCapture.captureStream) {
          throw new Error('captureStream unavailable')
        }
        stream = videoWithCapture.captureStream()
      } catch {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Clip not supported in this browser'))
        return
      }

      const mimeCandidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      const mimeType = mimeCandidates.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? 'video/webm'
      const chunks: BlobPart[] = []
      const recorder = new MediaRecorder(stream, { mimeType })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      recorder.onstop = () => {
        URL.revokeObjectURL(objectUrl)
        resolve(new Blob(chunks, { type: mimeType.split(';')[0] }))
      }
      recorder.onerror = () => reject(new Error('Could not clip video'))

      recorder.start(100)
      video.currentTime = startSec
      video.onseeked = () => {
        void video.play().catch(reject)
        window.setTimeout(() => {
          video.pause()
          recorder.stop()
        }, clipDuration * 1000 + 150)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load video'))
    }
  })
}
