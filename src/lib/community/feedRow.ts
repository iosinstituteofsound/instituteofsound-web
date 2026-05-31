import type { CommunityRank } from '../../types'
import type {
  CommunityFeedPost,
  CommunityPostKind,
  FeedArtistTag,
  FeedReactionKind,
} from './feedTypes'

export type FeedRow = {
  id: string
  kind: string
  body: string | null
  spotify_url: string | null
  youtube_url: string | null
  track_title: string | null
  image_url?: string | null
  link_url?: string | null
  link_title?: string | null
  link_description?: string | null
  link_image_url?: string | null
  created_at: string
  user_id: string
  display_name: string
  handle: string
  avatar_url: string | null
  community_rank: string
  primary_genre_slug: string | null
  reactions_fire?: number | string
  reactions_headphones?: number | string
  reactions_bolt?: number | string
  my_reaction?: string | null
  comment_count?: number | string
  artist_tags?: unknown
}

function parseArtistTags(raw: unknown): FeedArtistTag[] {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : []
  const tags: FeedArtistTag[] = []
  for (const item of list) {
    const row = item as Record<string, unknown>
    const id = row.id != null ? String(row.id) : ''
    const slug = row.slug != null ? String(row.slug) : ''
    if (!id || !slug) continue
    const tag: FeedArtistTag = {
      id,
      slug,
      displayName: String(row.display_name ?? row.displayName ?? slug),
    }
    const avatar =
      row.avatar_url != null
        ? String(row.avatar_url)
        : row.avatarUrl != null
          ? String(row.avatarUrl)
          : undefined
    if (avatar) tag.avatarUrl = avatar
    tags.push(tag)
  }
  return tags
}

export function mapFeedRow(row: FeedRow): CommunityFeedPost {
  return {
    id: row.id,
    kind: row.kind as CommunityPostKind,
    body: row.body ?? undefined,
    spotifyUrl: row.spotify_url ?? undefined,
    youtubeUrl: row.youtube_url ?? undefined,
    trackTitle: row.track_title ?? undefined,
    imageUrl: row.image_url ?? undefined,
    linkUrl: row.link_url ?? undefined,
    linkTitle: row.link_title ?? undefined,
    linkDescription: row.link_description ?? undefined,
    linkImageUrl: row.link_image_url ?? undefined,
    createdAt: row.created_at,
    userId: row.user_id,
    displayName: row.display_name,
    handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
    avatarUrl: row.avatar_url ?? undefined,
    rank: row.community_rank as CommunityRank,
    primaryGenreSlug: row.primary_genre_slug ?? undefined,
    status: 'visible',
    reactions: {
      fire: Number(row.reactions_fire ?? 0),
      headphones: Number(row.reactions_headphones ?? 0),
      bolt: Number(row.reactions_bolt ?? 0),
    },
    myReaction: (row.my_reaction as FeedReactionKind | null) ?? null,
    commentCount: Number(row.comment_count ?? 0),
    artistTags: parseArtistTags(row.artist_tags),
  }
}
