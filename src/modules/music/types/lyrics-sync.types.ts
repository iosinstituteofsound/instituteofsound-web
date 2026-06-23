export type SyncedLyricsStatus = 'none' | 'draft' | 'pending_review' | 'approved'

export interface SyncedLyricLine {
  id: string
  text: string
  timeMs: number | null
}

export interface SyncedLyricLineDto {
  text: string
  timeMs: number
}
