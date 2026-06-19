import type { LabelOverviewLabelDto, ReleaseDto } from '@/modules/explore/types/explore.types'
import { labelCity } from '@/modules/explore/lib/label-meta'
import { releaseDateLabel, releaseTrackCount, releaseTypeLabel } from '@/modules/explore/lib/release-meta'

const RELEASE_TAGLINES = [
  'A sonic journey through shadow, distance and light.',
  'Precision-engineered frequencies for the underground.',
  'Built for late-night systems and early-morning clarity.',
  'Curated pressure, controlled release.',
] as const

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 31) % 100000
  return h
}

export function labelOverviewBio(label: LabelOverviewLabelDto): string {
  if (label.bio?.trim()) return label.bio.trim()
  return `${label.displayName} is an independent imprint documenting underground sound with editorial intent and long-form release craft.`
}

export function labelOverviewBasedIn(label: LabelOverviewLabelDto): string {
  return label.basedIn?.trim() || labelCity(label)
}

export function labelOverviewFounded(label: LabelOverviewLabelDto): string {
  return label.foundedYear ? String(label.foundedYear) : '2023'
}

export function labelOverviewFounder(label: LabelOverviewLabelDto): string {
  return label.founderName?.trim() || 'Institute of Sound'
}

export function labelOverviewGenres(label: LabelOverviewLabelDto): string {
  if (label.genres.length === 0) return 'Electronic, Experimental'
  return label.genres
    .map((genre) => genre.replace(/\b\w/g, (char) => char.toUpperCase()))
    .join(', ')
}

export function labelOverviewReleaseTagline(release: ReleaseDto): string {
  if (release.genre?.trim()) {
    return `A ${release.genre.toLowerCase()} transmission from the ${releaseTypeLabel(release.type).toLowerCase()} desk.`
  }
  return RELEASE_TAGLINES[hashId(release.id) % RELEASE_TAGLINES.length]!
}

export function labelOverviewReleaseMeta(release: ReleaseDto): string {
  const parts = [releaseDateLabel(release), releaseTypeLabel(release.type), `${releaseTrackCount(release)} TRACKS`]
  return parts.join(' • ')
}

export function labelOverviewNewsDate(article: { publishedAt?: string; id?: string }): string {
  if (article.publishedAt) {
    return new Date(article.publishedAt)
      .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      .toUpperCase()
  }
  return 'JUN 01, 2024'
}

export function labelOverviewStreamsLabel(count: number): string {
  if (count >= 1_000_000) {
    const millions = count / 1_000_000
    if (millions >= 10) return `${Math.round(millions)}M`
    return `${millions.toFixed(1).replace(/\.0$/, '')}M`
  }
  if (count >= 1_000) {
    const thousands = count / 1_000
    if (thousands >= 10) return `${Math.round(thousands)}K`
    return `${thousands.toFixed(1).replace(/\.0$/, '')}K`
  }
  return String(count)
}
