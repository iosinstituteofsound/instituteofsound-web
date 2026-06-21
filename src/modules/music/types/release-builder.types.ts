import type { UploadDuplicateCheck } from '@/modules/music/types/music.types'

export type ReleaseBuilderStep = 'upload' | 'details' | 'schedule' | 'review'

export type QueueItemStatus = 'pending' | 'uploading' | 'processing' | 'ready' | 'failed'

export interface QueuedUpload {
  id: string
  file: File
  title: string
  /** Song name only — formatted as "Artist - Song" on publish. */
  jobId?: string
  trackId?: string
  status: QueueItemStatus
  uploadProgress: number
  processingProgress: number
  processingStatus: string
  errorMessage?: string
  duplicateCheck?: UploadDuplicateCheck
}

export interface ReleaseBuilderState {
  step: ReleaseBuilderStep
  queue: QueuedUpload[]
  releaseTitle: string
  genre: string
  secondaryGenre: string
  language: string
  coverUrl: string
  releaseType: 'single' | 'ep' | 'album'
  releaseDate: string
  releaseTimeEnabled: boolean
  releaseHour: string
  releaseMinute: string
  releasePeriod: 'AM' | 'PM'
}

export const RELEASE_BUILDER_STEPS: { id: ReleaseBuilderStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'details', label: 'Details' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
]

export const MAX_AUDIO_UPLOAD_MB = 200
export const ACCEPTED_AUDIO_TYPES = ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/ogg', 'audio/mp4', 'audio/m4a']

export function inferReleaseType(trackCount: number): 'single' | 'ep' | 'album' {
  if (trackCount <= 1) return 'single'
  return 'ep'
}

export function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim()
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
