import { create } from 'zustand'
import type { FeedScope } from '@/modules/feed/hooks/use-feed'

export type FeedHomeTab = 'my' | 'artist' | 'nation'

interface FeedScopeState {
  homeTab: FeedHomeTab
  setHomeTab: (homeTab: FeedHomeTab) => void
}

/** My = following · Artist = all · Nation = hub (no feed list). */
export function feedHomeTabToScope(tab: FeedHomeTab): FeedScope | null {
  if (tab === 'my') return 'following'
  if (tab === 'artist') return 'all'
  return null
}

export const useFeedScopeStore = create<FeedScopeState>((set) => ({
  homeTab: 'artist',
  setHomeTab: (homeTab) => set({ homeTab }),
}))
