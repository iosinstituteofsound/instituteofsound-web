import { useMemo } from 'react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { parseLinkPreviewFromPayload } from '@/shared/lib/link-preview'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { env } from '@/shared/config/env'
import type { PageMeta } from '@/shared/hooks/use-page-meta'

export function getFeedItemPhotoUrl(item: FeedItemDto): string | undefined {
  const payload = item.payload

  if (item.type === 'image') return payloadString(payload, 'imageUrl')
  if (item.type === 'model') return payloadString(payload, 'posterUrl')
  if (item.type === 'article') return payloadString(payload, 'coverUrl')
  return undefined
}

function resolveFeedImage(item: FeedItemDto): string | undefined {
  const payload = item.payload

  switch (item.type) {
    case 'image':
      return payloadString(payload, 'imageUrl')
    case 'video':
      return payloadString(payload, 'posterUrl')
    case 'article':
      return payloadString(payload, 'coverUrl')
    case 'model':
      return payloadString(payload, 'posterUrl')
    case 'text':
      return parseLinkPreviewFromPayload(payload)?.imageUrl
    default:
      return undefined
  }
}

function toAbsoluteUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined
  const value = raw.trim()
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) {
    const origin = typeof window !== 'undefined' ? window.location.origin : env.siteUrl
    return `${origin.replace(/\/+$/, '')}${value}`
  }
  return value
}

function resolveTitle(item: FeedItemDto): string {
  if (item.title?.trim()) return item.title.trim()
  if (item.type === 'music') return payloadString(item.payload, 'trackTitle') ?? 'Shared track'
  if (item.type === 'text') {
    return payloadString(item.payload, 'text')?.slice(0, 80) ?? 'Feed post'
  }
  return 'Feed post'
}

function resolveDescription(item: FeedItemDto): string {
  const author = item.author.name?.trim() || 'Institute of Sound'
  if (item.body?.trim()) return `${author}: ${item.body.trim()}`
  if (item.type === 'text') {
    const text = payloadString(item.payload, 'text')
    if (text) return `${author}: ${text}`
  }
  return `${author} shared a post on Institute of Sound`
}

export function buildFeedPostPageMeta(item: FeedItemDto): PageMeta {
  const origin = typeof window !== 'undefined' ? window.location.origin : env.siteUrl
  const base = origin.replace(/\/+$/, '')

  return {
    title: `${resolveTitle(item)} · Institute of Sound`,
    description: resolveDescription(item).slice(0, 300),
    imageUrl: toAbsoluteUrl(resolveFeedImage(item)),
    url: `${base}/feed/${item.id}`,
  }
}

export function useFeedPostPageMeta(item: FeedItemDto | undefined) {
  return useMemo(() => (item ? buildFeedPostPageMeta(item) : null), [item])
}
