import type { ExplorePayload } from '@/modules/explore/types/explore.types'

export type ExploreCommunityPayload = ExplorePayload['community']

export interface ExploreTribeRow {
  id: string
  slug: string
  name: string
  totalDb: number
  activeMembers: number
}

export interface ExploreSpinRow {
  id: string
  title: string
  handle: string
  authorName: string
  reactions: number
  href: string
}

export interface ExploreCrewRow {
  id: string
  name: string
  weeklyDb: number
  memberCount: number
  tagline: string
}

const TRIBE_FALLBACKS: ExploreTribeRow[] = [
  { id: 'tribe-metal', slug: 'metal', name: 'Metal', totalDb: 16170, activeMembers: 42 },
  { id: 'tribe-ambient', slug: 'ambient', name: 'Ambient', totalDb: 0, activeMembers: 8 },
  { id: 'tribe-bedroom-pop', slug: 'bedroom-pop', name: 'Bedroom pop', totalDb: 0, activeMembers: 6 },
  { id: 'tribe-dnb', slug: 'dnb', name: 'DnB', totalDb: 0, activeMembers: 11 },
  { id: 'tribe-electronic', slug: 'electronic', name: 'Electronic', totalDb: 0, activeMembers: 18 },
  { id: 'tribe-experimental', slug: 'experimental', name: 'Experimental', totalDb: 0, activeMembers: 5 },
]

const SPIN_FALLBACKS: ExploreSpinRow[] = [
  {
    id: 'spin-fallback-1',
    title: 'Sifar - Roko Na',
    handle: '@ios',
    authorName: 'Institute Of Sound',
    reactions: 24,
    href: '/feed',
  },
  {
    id: 'spin-fallback-2',
    title: 'Midnight Frequency',
    handle: '@basscult',
    authorName: 'Bass Cult',
    reactions: 18,
    href: '/feed',
  },
  {
    id: 'spin-fallback-3',
    title: 'Signal Drift',
    handle: '@sonic',
    authorName: 'Sonic Asylum',
    reactions: 14,
    href: '/feed',
  },
]

const CREW_FALLBACKS: ExploreCrewRow[] = [
  {
    id: 'crew-fallback-1',
    name: 'IOS Signal',
    weeklyDb: 16170,
    memberCount: 24,
    tagline: 'Core listeners on the wire',
  },
  {
    id: 'crew-fallback-2',
    name: 'Bass Cult',
    weeklyDb: 8420,
    memberCount: 16,
    tagline: 'Low-end listening crew',
  },
  {
    id: 'crew-fallback-3',
    name: 'Ritual Collective',
    weeklyDb: 6180,
    memberCount: 12,
    tagline: 'Night session listeners',
  },
]

function slugify(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function handleFromName(name: string) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
  return base ? `@${base.slice(0, 18)}` : '@listener'
}

function hashMembers(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 13) % 1000
  return 4 + (h % 38)
}

function topicToTribe(
  topic: ExploreCommunityPayload['topics'][number],
  index: number,
): ExploreTribeRow {
  const db = topic.count > 0 ? topic.count * 920 + index * 180 : 0
  return {
    id: topic.id,
    slug: slugify(topic.label),
    name: topic.label,
    totalDb: db,
    activeMembers: hashMembers(topic.id),
  }
}

function activityToSpin(
  item: ExploreCommunityPayload['latestActivity'][number],
  index: number,
): ExploreSpinRow {
  const href = item.id.startsWith('discover-') ? '/feed' : `/feed/${item.id}`
  return {
    id: item.id,
    title: item.title,
    handle: handleFromName(item.authorName),
    authorName: item.authorName,
    reactions: Math.max(6, 28 - index * 4),
    href,
  }
}

function contributorToCrew(
  contributor: ExploreCommunityPayload['topContributors'][number],
  index: number,
): ExploreCrewRow {
  return {
    id: contributor.id,
    name: contributor.name,
    weeklyDb: Math.max(420, contributor.score * 640 + index * 220),
    memberCount: hashMembers(contributor.id),
    tagline: 'Active listener crew',
  }
}

export function listExploreTribes(community: ExploreCommunityPayload): ExploreTribeRow[] {
  const fromApi = community.topics.map(topicToTribe).sort((a, b) => b.totalDb - a.totalDb)
  const seen = new Set(fromApi.map((row) => row.slug))
  const merged = [...fromApi]

  for (const fallback of TRIBE_FALLBACKS) {
    if (merged.length >= 6) break
    if (seen.has(fallback.slug)) continue
    merged.push(fallback)
    seen.add(fallback.slug)
  }

  return merged.slice(0, 6).sort((a, b) => b.totalDb - a.totalDb)
}

export function listExploreSpins(community: ExploreCommunityPayload): ExploreSpinRow[] {
  const fromApi = community.latestActivity.map(activityToSpin)
  if (fromApi.length >= 3) return fromApi.slice(0, 8)

  const seen = new Set(fromApi.map((row) => row.id))
  const merged = [...fromApi]
  for (const fallback of SPIN_FALLBACKS) {
    if (merged.length >= 5) break
    if (seen.has(fallback.id)) continue
    merged.push(fallback)
    seen.add(fallback.id)
  }

  return merged.slice(0, 5)
}

export function listExploreCrews(community: ExploreCommunityPayload): ExploreCrewRow[] {
  const fromApi = community.topContributors.map(contributorToCrew)
  if (fromApi.length >= 2) return fromApi.slice(0, 5)

  const seen = new Set(fromApi.map((row) => row.id))
  const merged = [...fromApi]
  for (const fallback of CREW_FALLBACKS) {
    if (merged.length >= 3) break
    if (seen.has(fallback.id)) continue
    merged.push(fallback)
    seen.add(fallback.id)
  }

  return merged.slice(0, 3)
}

export function tribeBarPercent(totalDb: number, leaderDb: number): number {
  if (leaderDb <= 0) return totalDb > 0 ? 8 : 0
  return Math.max(6, Math.round((totalDb / leaderDb) * 100))
}

export function formatExploreDb(n: number): string {
  return `${n.toLocaleString()} dB`
}

export function spinReactionLabel(n: number) {
  return `${n.toLocaleString()} rxn`
}

export function isFallbackSpin(row: ExploreSpinRow) {
  return row.id.startsWith('spin-fallback-')
}
