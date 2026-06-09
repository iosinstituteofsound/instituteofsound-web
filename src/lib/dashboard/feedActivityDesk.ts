import type { MemberActivityItem } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { SceneEvent } from '@/lib/events/types'
import type { CollabBoardPost } from '@/lib/collab/types'
import type { LeaderboardEntry } from '@/lib/community/service'
import type { CommunityMemberStats } from '@/lib/community/service'

export type FeedActivityFilterId =
  | 'all'
  | 'following'
  | 'releases'
  | 'events'
  | 'signals'
  | 'mentions'

export type FeedDeskItem =
  | { type: 'post'; post: CommunityFeedPost }
  | { type: 'event'; event: SceneEvent }
  | { type: 'collab'; post: CollabBoardPost }

export function reactionTotal(post: CommunityFeedPost): number {
  const r = post.reactions
  return (r?.fire ?? 0) + (r?.headphones ?? 0) + (r?.bolt ?? 0)
}

export function postMentionsHandle(post: CommunityFeedPost, handle: string): boolean {
  if (!handle) return false
  const needle = `@${handle.toLowerCase()}`
  const hay = `${post.body ?? ''} ${post.trackTitle ?? ''}`.toLowerCase()
  return hay.includes(needle)
}

export function countMentions(posts: CommunityFeedPost[], handle: string): number {
  return posts.filter((p) => postMentionsHandle(p, handle)).length
}

export function engagementStreakDays(activity: MemberActivityItem[]): number {
  const days = new Set<string>()
  const weekAgo = Date.now() - 7 * 86400000
  for (const item of activity) {
    const t = new Date(item.createdAt).getTime()
    if (t >= weekAgo) days.add(new Date(item.createdAt).toDateString())
  }
  return days.size
}

export function tabSummaryCopy(
  filter: FeedActivityFilterId,
  ctx: {
    followingCount: number
    mentionCount: number
    feedCount: number
    eventCount: number
  },
): { title: string; hint: string } {
  switch (filter) {
    case 'following':
      return {
        title: 'From people you follow',
        hint: `${ctx.followingCount.toLocaleString()} creators · latest drops and moves from your circle.`,
      }
    case 'releases':
      return {
        title: 'New music & drops',
        hint: `${ctx.feedCount} spin${ctx.feedCount === 1 ? '' : 's'} on the wire.`,
      }
    case 'events':
      return {
        title: 'Gigs & sessions',
        hint: `${ctx.eventCount} upcoming event${ctx.eventCount === 1 ? '' : 's'} on IOS.`,
      }
    case 'signals':
      return {
        title: 'Network signals',
        hint: 'dB spikes, rank shifts, and momentum from your account.',
      }
    case 'mentions':
      return {
        title: 'You were tagged',
        hint:
          ctx.mentionCount > 0
            ? `${ctx.mentionCount} mention${ctx.mentionCount === 1 ? '' : 's'} on the wire.`
            : 'No @mentions yet — post on the feed to get tagged.',
      }
    default:
      return {
        title: 'Everything in your network',
        hint: 'Releases, events, playlists, and collab in one stream.',
      }
  }
}

export function buildFeedItems(
  filter: FeedActivityFilterId,
  posts: CommunityFeedPost[],
  followingPosts: CommunityFeedPost[],
  events: SceneEvent[],
  collabPosts: CollabBoardPost[],
  handle: string,
): FeedDeskItem[] {
  switch (filter) {
    case 'following':
      return followingPosts.map((post) => ({ type: 'post', post }))
    case 'releases':
      return posts.filter((p) => p.kind === 'spin').map((post) => ({ type: 'post', post }))
    case 'events':
      return events.map((event) => ({ type: 'event', event }))
    case 'mentions':
      return posts
        .filter((p) => postMentionsHandle(p, handle))
        .map((post) => ({ type: 'post', post }))
    case 'signals':
      return []
    default: {
      const merged: FeedDeskItem[] = [
        ...posts.slice(0, 12).map((post) => ({ type: 'post' as const, post })),
        ...events.slice(0, 3).map((event) => ({ type: 'event' as const, event })),
        ...collabPosts.slice(0, 3).map((post) => ({ type: 'collab' as const, post })),
      ]
      return merged.sort((a, b) => itemTime(b) - itemTime(a))
    }
  }
}

function itemTime(item: FeedDeskItem): number {
  if (item.type === 'post' || item.type === 'collab') {
    return new Date(item.post.createdAt).getTime()
  }
  return new Date(item.event.startsAt).getTime()
}

export function signalCardsFromStats(
  stats: CommunityMemberStats | null,
  activity: MemberActivityItem[],
  followerCount: number,
): { icon: string; title: string; body: string; delta: string }[] {
  if (!stats) return []
  const cards: { icon: string; title: string; body: string; delta: string }[] = []
  if (stats.weeklyDb > 0) {
    cards.push({
      icon: 'wave',
      title: 'dB momentum',
      body: `You earned ${stats.weeklyDb.toLocaleString()} dB this week on the network.`,
      delta: `+${stats.weeklyDb.toLocaleString()} dB`,
    })
  }
  if (stats.nextRank) {
    cards.push({
      icon: 'shield',
      title: 'Rank progress',
      body: `${stats.rankProgressPct}% toward ${stats.nextRank}.`,
      delta: stats.nextRank,
    })
  }
  const streak = engagementStreakDays(activity)
  if (streak > 0) {
    cards.push({
      icon: 'flame',
      title: 'Activity streak',
      body: `${streak} active day${streak === 1 ? '' : 's'} this week on IOS.`,
      delta: `${streak} days`,
    })
  }
  if (followerCount > 0) {
    cards.push({
      icon: 'users',
      title: 'Network circle',
      body: `${followerCount.toLocaleString()} followers on your public profile.`,
      delta: followerCount.toLocaleString(),
    })
  }
  return cards
}

export function spinPostsForSidebar(posts: CommunityFeedPost[], limit = 5) {
  return posts
    .filter((p) => p.kind === 'spin' && (p.trackTitle || p.body))
    .slice(0, limit)
    .map((p) => ({
      title: p.trackTitle ?? p.body?.slice(0, 40) ?? 'Spin',
      artist: p.displayName,
      plays: `${reactionTotal(p)} dB`,
    }))
}

export function leaderboardAsTrending(entries: LeaderboardEntry[]) {
  return entries.map((e) => ({
    name: e.name,
    genre: e.rank,
    db: `${e.weeklyDb.toLocaleString()} dB`,
    handle: e.handle,
  }))
}

export function activityRecentIcon(kind: MemberActivityItem['kind']): string {
  return kind === 'db' ? 'play' : 'comment'
}
