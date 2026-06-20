import type { ReleaseDto, WirePickItem } from '@/modules/explore/types/explore.types'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { releasePlaysFormatted, releaseTypeLabel } from '@/modules/explore/lib/release-meta'

export type WireReleaseMeta = Pick<
  ReleaseDto,
  'id' | 'title' | 'artistName' | 'coverUrl' | 'streamUrl' | 'type' | 'genre' | 'playCount' | 'isFeatured'
>

export interface ResolvedWirePick {
  key: string
  title: string
  subtitle: string
  coverUrl?: string
  streamUrl?: string
  badges: string[]
}

export interface WirePickDragIds {
  lineupDropId: string
  candidateReleaseDragId: (releaseId: string) => string
  candidateFeedDragId: (feedId: string) => string
  lineupDragId: (item: WirePickItem) => string
  parseLineupDragId: (dragId: string) => string | null
  isCandidateReleaseDragId: (dragId: string) => boolean
  isCandidateFeedDragId: (dragId: string) => boolean
  isLineupDragId: (dragId: string) => boolean
  parseCandidateReleaseDragId: (dragId: string) => string | null
  parseCandidateFeedDragId: (dragId: string) => string | null
}

export function createWirePickDragIds(instanceId: string): WirePickDragIds {
  const lineupDropId = `${instanceId}-wire-lineup-drop`
  const lineupPrefix = `${instanceId}-lineup-`
  const releasePrefix = `${instanceId}-candidate-release-`
  const feedPrefix = `${instanceId}-candidate-feed-`

  return {
    lineupDropId,
    candidateReleaseDragId: (releaseId) => `${releasePrefix}${releaseId}`,
    candidateFeedDragId: (feedId) => `${feedPrefix}${feedId}`,
    lineupDragId: (item) => `${lineupPrefix}${wirePickItemId(item)}`,
    parseLineupDragId: (dragId) => (dragId.startsWith(lineupPrefix) ? dragId.slice(lineupPrefix.length) : null),
    isCandidateReleaseDragId: (dragId) => dragId.startsWith(releasePrefix),
    isCandidateFeedDragId: (dragId) => dragId.startsWith(feedPrefix),
    isLineupDragId: (dragId) => dragId.startsWith(lineupPrefix),
    parseCandidateReleaseDragId: (dragId) =>
      dragId.startsWith(releasePrefix) ? dragId.slice(releasePrefix.length) : null,
    parseCandidateFeedDragId: (dragId) =>
      dragId.startsWith(feedPrefix) ? dragId.slice(feedPrefix.length) : null,
  }
}

export function wirePickKey(item: WirePickItem): string {
  return `${item.sortOrder}-${item.feedItemId ?? item.releaseId ?? item.articleId ?? 'pick'}`
}

export function wirePickItemId(item: WirePickItem): string {
  return item.feedItemId ?? item.releaseId ?? item.articleId ?? wirePickKey(item)
}

export function isWirePickAlreadySelected(
  items: WirePickItem[],
  ids: { releaseId?: string; feedItemId?: string },
) {
  return items.some(
    (entry) =>
      (ids.releaseId && entry.releaseId === ids.releaseId) ||
      (ids.feedItemId && entry.feedItemId === ids.feedItemId),
  )
}

export function insertWirePickAt(
  items: WirePickItem[],
  pick: Omit<WirePickItem, 'sortOrder'>,
  index: number,
): WirePickItem[] {
  const next = [...items]
  next.splice(index, 0, { ...pick, sortOrder: index })
  return next.map((entry, sortOrder) => ({ ...entry, sortOrder }))
}

export function removeWirePickAt(items: WirePickItem[], item: WirePickItem): WirePickItem[] {
  return items.filter((entry) => entry !== item).map((entry, sortOrder) => ({ ...entry, sortOrder }))
}

export function feedItemTitle(feed: FeedItemDto): string {
  const payload = feed.payload ?? {}
  const trackTitle = typeof payload.trackTitle === 'string' ? payload.trackTitle : undefined
  return feed.title ?? trackTitle ?? feed.body?.slice(0, 80) ?? 'Community spin'
}

export function feedItemArtist(feed: FeedItemDto): string {
  const payload = feed.payload ?? {}
  const artistName = typeof payload.artistName === 'string' ? payload.artistName : undefined
  return artistName ?? feed.author.name
}

export function feedItemStreamUrl(feed: FeedItemDto): string | undefined {
  const payload = feed.payload ?? {}
  const audioUrl = typeof payload.audioUrl === 'string' ? payload.audioUrl : undefined
  return audioUrl?.trim() || undefined
}

export function buildWireReleaseMap(
  releases: WireReleaseMeta[],
  pageReleases: ReleaseDto[],
): Map<string, WireReleaseMeta> {
  const map = new Map<string, WireReleaseMeta>()
  for (const release of releases) map.set(release.id, release)
  for (const release of pageReleases) map.set(release.id, release)
  return map
}

export function buildWireFeedMap(feedItems: FeedItemDto[]): Map<string, FeedItemDto> {
  const map = new Map<string, FeedItemDto>()
  for (const feed of feedItems) map.set(feed.id, feed)
  return map
}

export function resolveWirePick(
  item: WirePickItem,
  releaseMap: Map<string, WireReleaseMeta>,
  feedMap: Map<string, FeedItemDto>,
): ResolvedWirePick {
  if (item.releaseId) {
    const release = releaseMap.get(item.releaseId)
    return {
      key: wirePickKey(item),
      title: release?.title ?? item.label ?? 'Release pick',
      subtitle: release?.artistName ?? 'Unknown artist',
      coverUrl: release?.coverUrl,
      streamUrl: release?.streamUrl,
      badges: [
        releaseTypeLabel(release?.type),
        release?.isFeatured ? 'Trending' : null,
        releasePlaysFormatted(release ?? { id: item.releaseId, title: '' }) ?? null,
      ].filter(Boolean) as string[],
    }
  }

  if (item.feedItemId) {
    const feed = feedMap.get(item.feedItemId)
    const reactions = feed?.engagement?.reactionTotal
    return {
      key: wirePickKey(item),
      title: feed ? feedItemTitle(feed) : item.label ?? 'Community pick',
      subtitle: feed ? `${feedItemArtist(feed)} · community` : 'Community',
      coverUrl: undefined,
      streamUrl: feed ? feedItemStreamUrl(feed) : undefined,
      badges: reactions ? [`${reactions} reactions`] : ['Community'],
    }
  }

  return {
    key: wirePickKey(item),
    title: item.label ?? 'Wire pick',
    subtitle: 'Editorial',
    badges: ['Pick'],
  }
}

export function createReleaseWirePick(release: ReleaseDto): Omit<WirePickItem, 'sortOrder'> {
  return {
    releaseId: release.id,
    label: `${release.title}${release.artistName ? ` · ${release.artistName}` : ''}`,
  }
}

export function createFeedWirePick(feed: FeedItemDto): Omit<WirePickItem, 'sortOrder'> {
  return {
    feedItemId: feed.id,
    label: feedItemTitle(feed),
  }
}
