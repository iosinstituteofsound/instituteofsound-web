import type { FeedItemType } from '@/modules/feed/types/feed.types'

const COMPOSE_DRAFT_KEY = 'ios_feed_compose_draft'

export type ComposeDraft = {
  body: string
  initialType?: FeedItemType
  initialPayload?: Record<string, unknown>
}

export function setComposeDraft(draft: ComposeDraft) {
  sessionStorage.setItem(COMPOSE_DRAFT_KEY, JSON.stringify(draft))
}

export function consumeComposeDraft(): ComposeDraft | null {
  const raw = sessionStorage.getItem(COMPOSE_DRAFT_KEY)
  if (!raw) return null
  sessionStorage.removeItem(COMPOSE_DRAFT_KEY)
  try {
    return JSON.parse(raw) as ComposeDraft
  } catch {
    return null
  }
}
