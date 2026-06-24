import type { ReleaseDetailDto } from '@/modules/music/types/music.types'
import type { SubmissionBoostOption, SubmissionDestination } from '@/modules/submissions/types/submission-wizard.types'
import type { EvaluationMetric } from '@/modules/submissions/types/submission-wizard.types'

export function buildSubmissionDescription(
  destinations: SubmissionDestination[],
  boosts: SubmissionBoostOption[],
  baseDescription = '',
): string {
  const parts: string[] = []
  if (baseDescription.trim()) parts.push(baseDescription.trim())
  if (boosts.length > 0) {
    parts.push(`Boost (preview): ${boosts.map((b) => b.title).join(', ')}`)
  }
  return parts.join('\n\n')
}

export function mapReleaseToSubmissionPayload(
  release: ReleaseDetailDto,
  destinations: SubmissionDestination[],
  boosts: SubmissionBoostOption[],
) {
  const track = release.tracks[0]
  const streamUrl = release.streamUrl ?? track?.audioUrl
  if (!streamUrl) {
    throw new Error('Selected release needs a playable stream URL before submission.')
  }

  return {
    releaseId: release.id,
    projectName: release.title,
    genre: release.genre?.trim() || 'Unknown',
    trackTitle: track?.title?.trim() || release.title,
    artistNote: buildSubmissionDescription(destinations, boosts),
    destinationIds: destinations.map((d) => d.id),
    streamUrl,
    coverUrl: release.coverUrl,
  }
}

function scoreField(present: boolean): string {
  return present ? 'Good' : '--'
}

export function computeEvaluationMetrics(release: ReleaseDetailDto | null): EvaluationMetric[] {
  if (!release) {
    return [
      { label: 'Artwork Quality', score: '--' },
      { label: 'Metadata', score: '--' },
      { label: 'Audio Quality', score: '--' },
      { label: 'Storytelling', score: '--' },
    ]
  }

  const track = release.tracks[0]
  const hasArtwork = Boolean(release.coverUrl)
  const hasMetadata = Boolean(release.genre && release.releaseDate)
  const hasAudio = Boolean(release.streamUrl || track?.audioUrl) && (track?.durationSec ?? 0) > 0
  const hasStory = Boolean(track?.lyrics?.trim())

  return [
    { label: 'Artwork Quality', score: scoreField(hasArtwork) },
    { label: 'Metadata', score: scoreField(hasMetadata) },
    { label: 'Audio Quality', score: scoreField(hasAudio) },
    { label: 'Storytelling', score: scoreField(hasStory) },
  ]
}

export function computeEvaluationPercent(metrics: EvaluationMetric[]): number {
  const scored = metrics.filter((m) => m.score !== '--').length
  return Math.round((scored / metrics.length) * 100)
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
