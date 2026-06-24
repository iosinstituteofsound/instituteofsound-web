import type { LyricsGenerationStage } from '@/modules/agents/api/agents.api'

const STAGE_LABELS: Record<LyricsGenerationStage, string> = {
  queued: 'Starting AI lyrics job…',
  downloading_audio: 'Downloading track audio…',
  transcribing: 'Listening to your song (medium model — accurate but slow)…',
  formatting_lyrics: 'Converting to Hinglish & syncing timestamps…',
  saving: 'Saving lyrics to your track…',
}

export function lyricsGenerationStageLabel(
  stage?: LyricsGenerationStage,
  status?: string,
): string {
  if (stage && STAGE_LABELS[stage]) return STAGE_LABELS[stage]
  if (status === 'queued') return STAGE_LABELS.queued
  if (status === 'processing') return 'Processing lyrics…'
  return 'Generating lyrics…'
}
