export type MediaAttachKind = 'image' | 'video' | 'audio'
export type MediaAttachMode = MediaAttachKind | 'photo-video'

export function acceptForKind(kind: MediaAttachMode): string {
  if (kind === 'photo-video') {
    return 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/webm,audio/ogg,audio/mp4'
  }
  switch (kind) {
    case 'image':
      return 'image/jpeg,image/png,image/gif,image/webp'
    case 'video':
      return 'video/mp4,video/webm,video/quicktime'
    case 'audio':
      return 'audio/mpeg,audio/wav,audio/webm,audio/ogg,audio/mp4'
  }
}

export function kindFromFile(file: File): MediaAttachKind | null {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return null
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export async function loadMediaDuration(blob: Blob, kind: 'video' | 'audio'): Promise<number> {
  const element = document.createElement(kind)
  element.preload = 'metadata'
  const url = URL.createObjectURL(blob)
  element.src = url

  try {
    await new Promise<void>((resolve, reject) => {
      element.onloadedmetadata = () => resolve()
      element.onerror = () => reject(new Error('Could not read media duration'))
    })
    return Number.isFinite(element.duration) ? element.duration : 0
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function captureVideoPoster(blob: Blob): Promise<Blob | null> {
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  const url = URL.createObjectURL(blob)
  video.src = url

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error('Could not load video'))
    })
    video.currentTime = Math.min(0.1, video.duration || 0.1)
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve()
    })

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 360
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.85)
    })
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function pickRecorderMime(kind: 'video' | 'audio'): string {
  const candidates =
    kind === 'video'
      ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']

  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? candidates[candidates.length - 1]!
}
