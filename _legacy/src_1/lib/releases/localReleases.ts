import type { ArtistRelease, ReleaseMilestone, UpsertReleaseInput } from '@/lib/releases/types'
import { slugifyArtistName } from '@/lib/artist-profile/slug'

const KEY = 'ios_artist_releases'
const MILESTONE_KEY = 'ios_release_milestones'

function read(): ArtistRelease[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ArtistRelease[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: ArtistRelease[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

function readMilestones(): ReleaseMilestone[] {
  try {
    const raw = localStorage.getItem(MILESTONE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ReleaseMilestone[]
  } catch {
    return []
  }
}

function writeMilestones(items: ReleaseMilestone[]) {
  localStorage.setItem(MILESTONE_KEY, JSON.stringify(items))
}

export function localAllReleaseSlugs(): string[] {
  return read().map((r) => r.slug)
}

export function localListReleasesForProfile(profileId: string): ArtistRelease[] {
  return read()
    .filter((r) => r.profileId === profileId)
    .sort((a, b) => b.liveAt.localeCompare(a.liveAt))
}

export function localRestoreReleasesSnapshot(releases: ArtistRelease[]): void {
  if (releases.length === 0) return
  const ids = new Set(releases.map((r) => r.id))
  write([...read().filter((r) => !ids.has(r.id)), ...releases])
}

export function localDeleteReleasesForProfile(profileId: string): void {
  const releases = read().filter((r) => r.profileId === profileId)
  const releaseIds = new Set(releases.map((r) => r.id))
  write(read().filter((r) => r.profileId !== profileId))
  writeMilestones(
    readMilestones().filter((m) => !releaseIds.has((m as StoredMilestone).releaseId)),
  )
}

export function localListReleasesForScene(cityLabel: string, genreSlug: string): ArtistRelease[] {
  return read()
    .filter(
      (r) =>
        r.status !== 'draft' &&
        r.sceneCity === cityLabel &&
        r.sceneGenreSlug === genreSlug
    )
    .sort((a, b) => b.liveAt.localeCompare(a.liveAt))
}

export function localGetReleaseBySlug(slug: string): ArtistRelease | null {
  return read().find((r) => r.slug.toLowerCase() === slug.toLowerCase()) ?? null
}

export function localUpsertRelease(
  profileId: string,
  input: UpsertReleaseInput,
  existingId?: string
): ArtistRelease {
  const items = read()
  const slug = slugifyArtistName(input.slug?.trim() || input.title)
  const liveAt = new Date(input.liveAt).toISOString()
  const now = new Date()
  const isLive = new Date(liveAt) <= now
  const status = input.status === 'draft' ? 'draft' : isLive ? 'live' : 'scheduled'

  if (existingId) {
    const idx = items.findIndex((r) => r.id === existingId)
    if (idx >= 0) {
      const updated: ArtistRelease = {
        ...items[idx],
        ...input,
        slug: items[idx].slug,
        profileId,
        liveAt,
        status,
        tracks: input.tracks ?? items[idx].tracks,
        updatedAt: now.toISOString(),
      }
      items[idx] = updated
      write(items)
      return updated
    }
  }

  const release: ArtistRelease = {
    id: crypto.randomUUID(),
    profileId,
    slug,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim(),
    story: input.story?.trim(),
    coverUrl: input.coverUrl,
    releaseType: input.releaseType,
    liveAt,
    status,
    spotifyUrl: input.spotifyUrl,
    youtubeUrl: input.youtubeUrl,
    soundcloudUrl: input.soundcloudUrl,
    sceneCity: input.sceneCity,
    sceneGenreSlug: input.sceneGenreSlug,
    tracks: input.tracks ?? [],
    spinPromoted: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  write([release, ...items])
  return release
}

type StoredMilestone = ReleaseMilestone & { releaseId: string }

export function localListMilestones(releaseId: string): ReleaseMilestone[] {
  return readMilestones()
    .filter((m) => (m as StoredMilestone).releaseId === releaseId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function localAddMilestone(
  releaseId: string,
  input: { kind: ReleaseMilestone['kind']; title: string; body?: string }
): ReleaseMilestone {
  const all = readMilestones()
  const m: StoredMilestone = {
    id: crypto.randomUUID(),
    releaseId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    sortOrder: all.filter((x) => (x as typeof m).releaseId === releaseId).length,
    createdAt: new Date().toISOString(),
  }
  writeMilestones([...all, m])
  return m
}

export function localMarkSpinPromoted(releaseId: string): void {
  write(
    read().map((r) => (r.id === releaseId ? { ...r, spinPromoted: true } : r))
  )
}
