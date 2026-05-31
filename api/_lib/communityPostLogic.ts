import type { SupabaseClient } from '@supabase/supabase-js'
import { repoAwardDb } from '../../src/lib/community/awardRepository.js'
import {
  repoInsertCommunityPost,
  repoSetPostArtistTags,
  repoTouchArtistActivity,
  type InsertDropRow,
  type InsertSpinRow,
} from '../../src/lib/community/feedRepository.js'
import { validateSpinInput } from '../../src/lib/community/musicLinks.js'
import type { CommunityFeedPost } from '../../src/lib/community/feedTypes.js'
import type { PostAuthorContext } from './communityAuthor.js'

const SPIN_DB = 10
const DROP_DB = 5

function emptyReactions() {
  return { fire: 0, headphones: 0, bolt: 0 }
}

function isMissingLinkColumnError(message: string): boolean {
  return /link_url|link_title|link_description|link_image_url|column.*does not exist/i.test(
    message,
  )
}

export function friendlyPostError(message: string): string {
  if (isMissingLinkColumnError(message)) {
    return 'Link posts need the latest database migration (053). Run it in Supabase SQL editor, then try again.'
  }
  if (/community_posts_drop_requires_content|check constraint/i.test(message)) {
    return 'Add some text, a photo, or a valid link before posting.'
  }
  return message
}

export function buildSpinPostResponse(
  author: PostAuthorContext,
  data: { id: string; created_at: string },
  fields: {
    body: string | null
    spotifyUrl?: string
    youtubeUrl?: string
    trackTitle: string | null
    imageUrl: string | null
  },
): CommunityFeedPost {
  return {
    id: data.id,
    kind: 'spin',
    body: fields.body ?? undefined,
    spotifyUrl: fields.spotifyUrl,
    youtubeUrl: fields.youtubeUrl,
    trackTitle: fields.trackTitle ?? undefined,
    imageUrl: fields.imageUrl ?? undefined,
    createdAt: data.created_at,
    userId: author.userId,
    displayName: author.displayName,
    handle: author.handle,
    avatarUrl: author.avatarUrl,
    rank: author.rank,
    primaryGenreSlug: author.primaryGenreSlug,
    status: 'visible',
    reactions: emptyReactions(),
  }
}

export function buildDropPostResponse(
  author: PostAuthorContext,
  data: { id: string; created_at: string },
  fields: {
    body: string | null
    imageUrl: string | null
    linkUrl: string | null
    linkTitle?: string | null
    linkDescription?: string | null
    linkImageUrl?: string | null
  },
): CommunityFeedPost {
  return {
    id: data.id,
    kind: 'drop',
    body: fields.body ?? undefined,
    imageUrl: fields.imageUrl ?? undefined,
    linkUrl: fields.linkUrl ?? undefined,
    linkTitle: fields.linkTitle?.trim() || undefined,
    linkDescription: fields.linkDescription?.trim() || undefined,
    linkImageUrl: fields.linkImageUrl?.trim() || undefined,
    createdAt: data.created_at,
    userId: author.userId,
    displayName: author.displayName,
    handle: author.handle,
    avatarUrl: author.avatarUrl,
    rank: author.rank,
    primaryGenreSlug: author.primaryGenreSlug,
    status: 'visible',
    reactions: emptyReactions(),
  }
}

export async function serverCreateSpinPost(
  supabase: SupabaseClient,
  author: PostAuthorContext,
  input: {
    spotifyRaw: string
    youtubeRaw: string
    caption?: string
    trackTitle?: string
    imageUrl?: string
    primaryGenreId?: string | null
    artistProfileIds?: string[]
  },
): Promise<CommunityFeedPost> {
  const { spotify, youtube, error } = validateSpinInput(input.spotifyRaw, input.youtubeRaw)
  if (error) throw new Error(error)

  const body = input.caption?.trim().slice(0, 280) || null
  const trackTitle = input.trackTitle?.trim().slice(0, 120) || null
  const imageUrl = input.imageUrl?.trim() || null

  const row: InsertSpinRow = {
    user_id: author.userId,
    kind: 'spin',
    body,
    spotify_url: spotify?.url ?? null,
    youtube_url: youtube?.url ?? null,
    track_title: trackTitle,
    image_url: imageUrl,
  }

  const data = await repoInsertCommunityPost(supabase, row)

  if (input.artistProfileIds?.length) {
    await repoSetPostArtistTags(supabase, data.id, input.artistProfileIds.slice(0, 3))
  }

  await repoAwardDb(supabase, {
    userId: author.userId,
    source: 'spin_post',
    sourceId: data.id,
    amount: SPIN_DB,
    genreId: input.primaryGenreId ?? null,
  })

  void repoTouchArtistActivity(supabase, author.userId)

  return buildSpinPostResponse(author, data, {
    body,
    spotifyUrl: spotify?.url,
    youtubeUrl: youtube?.url,
    trackTitle,
    imageUrl,
  })
}

export async function serverCreateDropPost(
  supabase: SupabaseClient,
  author: PostAuthorContext,
  input: {
    text: string
    imageUrl?: string
    linkUrl?: string
    linkTitle?: string
    linkDescription?: string
    linkImageUrl?: string
    primaryGenreId?: string | null
    artistProfileIds?: string[]
  },
): Promise<CommunityFeedPost> {
  const text = input.text.trim()
  const imageUrl = input.imageUrl?.trim() || null
  const linkUrl = input.linkUrl?.trim() || null
  if (text.length < 1 && !imageUrl && !linkUrl) {
    throw new Error('Write something, add a photo, or paste a link.')
  }
  if (text.length > 280) throw new Error('Max 280 characters.')
  const body = text.length > 0 ? text : null

  const linkTitle = input.linkTitle?.trim() || null
  const linkDescription = input.linkDescription?.trim() || null
  const linkImageUrl = input.linkImageUrl?.trim() || null

  const fullInsert: InsertDropRow = {
    user_id: author.userId,
    kind: 'drop',
    body,
    image_url: imageUrl,
    link_url: linkUrl,
    link_title: linkTitle,
    link_description: linkDescription,
    link_image_url: linkImageUrl,
  }

  let data: { id: string; created_at: string }
  try {
    data = await repoInsertCommunityPost(supabase, fullInsert)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (linkUrl && isMissingLinkColumnError(message)) {
      const fallbackBody =
        body && linkUrl && !body.includes(linkUrl) ? `${body}\n\n${linkUrl}` : body || linkUrl
      data = await repoInsertCommunityPost(supabase, {
        user_id: author.userId,
        kind: 'drop',
        body: fallbackBody,
        image_url: imageUrl,
        link_url: null,
        link_title: null,
        link_description: null,
        link_image_url: null,
      })
    } else {
      throw new Error(friendlyPostError(message))
    }
  }

  if (input.artistProfileIds?.length) {
    await repoSetPostArtistTags(supabase, data.id, input.artistProfileIds.slice(0, 3))
  }

  await repoAwardDb(supabase, {
    userId: author.userId,
    source: 'drop_post',
    sourceId: data.id,
    amount: DROP_DB,
    genreId: input.primaryGenreId ?? null,
  })

  void repoTouchArtistActivity(supabase, author.userId)

  return buildDropPostResponse(author, data, {
    body,
    imageUrl,
    linkUrl,
    linkTitle,
    linkDescription,
    linkImageUrl,
  })
}
