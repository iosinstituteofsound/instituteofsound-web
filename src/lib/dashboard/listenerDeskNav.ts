import type { DeskNavGroup } from '@/components/dashboard/RoleDeskLayout'
import type { UserRole } from '@/lib/auth/types'

/** Baseline social nav on every desk — member, artist, editor, IOS Support. */
export const LISTENER_UPGRADE_PATH_BADGE = 7

export type ListenerDeskTab = 'workspace' | 'grow' | 'feed' | 'listener-fandom' | 'explore'

export const LISTENER_DESK_TAB_IDS: ListenerDeskTab[] = [
  'workspace',
  'grow',
  'feed',
  'listener-fandom',
  'explore',
]

export function isListenerDeskTab(tab: string): tab is ListenerDeskTab {
  return (LISTENER_DESK_TAB_IDS as string[]).includes(tab)
}

export function listenerWorkspaceNavGroup(upgradeBadge?: number): DeskNavGroup<string> {
  return {
    title: 'Your workspace',
    items: [
      { id: 'workspace', label: 'Workspace home' },
      { id: 'grow', label: 'Upgrade paths', badge: upgradeBadge },
    ],
  }
}

export function listenerNetworkNavGroup(): DeskNavGroup<string> {
  return {
    title: 'Network',
    items: [
      { id: 'feed', label: 'Feed & activity' },
      { id: 'listener-fandom', label: 'My Fandom', hint: 'Who you support' },
      { id: 'explore', label: 'Explore IOS' },
    ],
  }
}

export function listenerDeskNavGroups(upgradeBadge?: number): DeskNavGroup<string>[] {
  return [listenerWorkspaceNavGroup(upgradeBadge), listenerNetworkNavGroup()]
}

/** Deep-link from upgrade / apply flows (legacy ?tab=network|fandom still works). */
export function listenerTabFromSearchParam(raw: string | null): ListenerDeskTab | null {
  if (!raw) return null
  if (raw === 'network') return 'feed'
  if (raw === 'fandom') return 'listener-fandom'
  return isListenerDeskTab(raw) ? raw : null
}

/** Jump to listener tab on the correct desk for this role. */
export function listenerDeskHref(role: UserRole, tab: ListenerDeskTab): string {
  if (role === 'artist') return `/artist/dashboard?tab=${tab}`
  if (role === 'editor' || role === 'super_editor') return `/editor/dashboard?tab=${tab}`
  return `/member/dashboard?tab=${tab}`
}
