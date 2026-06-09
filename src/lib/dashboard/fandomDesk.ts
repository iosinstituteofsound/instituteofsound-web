import type { MemberActivityItem } from '@/lib/community/memberProfileService'
import { formatRelativeTime } from '@/lib/community/relativeTime'
import type { FandomDiscoverArtistRow, MyFandomArtistRow } from '@/lib/fandom/types'
import type { SceneEvent } from '@/lib/events/types'

export const FANDOM_PHOTO_VARIANTS = ['a', 'b', 'c', 'd', 'e'] as const

export type FandomTotals = {
  spins: number
  drops: number
  reactions: number
  comments: number
  shares: number
  support: number
}

export function aggregateFandomTotals(artists: MyFandomArtistRow[]): FandomTotals {
  return artists.reduce(
    (acc, row) => ({
      spins: acc.spins + row.spins,
      drops: acc.drops + row.drops,
      reactions: acc.reactions + row.reactions,
      comments: acc.comments + row.comments,
      shares: acc.shares + row.shares,
      support: acc.support + row.supportScore,
    }),
    { spins: 0, drops: 0, reactions: 0, comments: 0, shares: 0, support: 0 },
  )
}

export function supportMixPercents(totals: FandomTotals) {
  const pool = totals.spins + totals.drops + totals.reactions + totals.shares
  if (pool <= 0) {
    return { plays: 0, likes: 0, saves: 0, shares: 0 }
  }
  return {
    plays: Math.round((totals.spins / pool) * 100),
    likes: Math.round((totals.reactions / pool) * 100),
    saves: Math.round((totals.drops / pool) * 100),
    shares: Math.round((totals.shares / pool) * 100),
  }
}

export function formatSupportDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function trackedReleaseCards(artists: MyFandomArtistRow[]) {
  return [...artists]
    .sort(
      (a, b) =>
        new Date(b.lastSupportAt ?? 0).getTime() - new Date(a.lastSupportAt ?? 0).getTime(),
    )
    .slice(0, 5)
    .map((row, i) => ({
      key: row.artistProfileId,
      title: row.spins > 0 ? `${row.spins} spin${row.spins === 1 ? '' : 's'}` : 'Artist support',
      artist: row.displayName,
      date: formatSupportDate(row.lastSupportAt),
      tone: (i % 5) + 1,
      slug: row.slug,
    }))
}

export function rsvpEvents(events: SceneEvent[]) {
  return events
    .filter((e) => e.viewerRsvped)
    .slice(0, 6)
    .map((event) => {
      const when = new Date(event.startsAt)
      return {
        id: event.id,
        month: when.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
        day: when.toLocaleDateString(undefined, { day: '2-digit' }),
        title: event.title,
        place: event.sceneCity,
        going: event.rsvpCount,
      }
    })
}

export function suggestedArtists(rows: FandomDiscoverArtistRow[]) {
  return rows.slice(0, 4).map((row, i) => ({
    name: row.displayName,
    slug: row.slug,
    tone: (i % 4) + 1,
    reason: row.reasonLabel,
  }))
}

export function activityHistoryItems(activity: MemberActivityItem[]) {
  return activity.slice(0, 12).map((item) => ({
    key: `${item.kind}-${item.createdAt}-${item.label}`,
    action: item.kind === 'db' ? 'Signal' : 'Activity',
    target: item.detail || item.label,
    time: formatRelativeTime(item.createdAt),
  }))
}

export function interactionGenreBars(totals: FandomTotals) {
  const mix = supportMixPercents(totals)
  const entries = [
    { name: 'Spins', pct: mix.plays },
    { name: 'Reactions', pct: mix.likes },
    { name: 'Drops', pct: mix.saves },
    { name: 'Shares', pct: mix.shares },
  ].filter((g) => g.pct > 0)
  if (entries.length === 0) {
    return [{ name: 'Open the feed', pct: 100 }]
  }
  return entries
}

export function fandomStatStrip(
  artists: MyFandomArtistRow[],
  totals: FandomTotals,
  followingCount: number | null,
  rsvpCount: number,
) {
  return [
    {
      icon: 'users',
      value: (followingCount ?? artists.length).toLocaleString(),
      label: followingCount != null ? 'Network follows' : 'Artists supported',
    },
    {
      icon: 'wave',
      value: totals.spins.toLocaleString(),
      label: 'Tracked spins',
    },
    {
      icon: 'playlist',
      value: totals.drops.toLocaleString(),
      label: 'Drops logged',
    },
    {
      icon: 'ticket',
      value: String(rsvpCount),
      label: 'Events going',
    },
    {
      icon: 'star',
      value: totals.support.toLocaleString(),
      label: 'Support score',
    },
  ] as const
}
