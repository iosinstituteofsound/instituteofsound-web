import type { ReactNode } from 'react'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { User } from '@/lib/auth/types'
import { RoleDeskLayout, type DeskNavGroup } from '@/components/dashboard/RoleDeskLayout'
import {
  LISTENER_UPGRADE_PATH_BADGE,
  listenerDeskNavGroups,
  type ListenerDeskTab,
} from '@/lib/dashboard/listenerDeskNav'

export type SuperEditorTab =
  | ListenerDeskTab
  | 'analytics'
  | 'preview'
  | 'verification'
  | 'playlist_curators'
  | 'deleted_pages'
  | 'applications'
  | 'queue'
  | 'wire'
  | 'events'
  | 'write'
  | 'drafts'
  | 'community-hub'
  | 'profile'

const ROLE_NAV_GROUPS: DeskNavGroup<SuperEditorTab>[] = [
  {
    title: 'Command',
    items: [
      { id: 'analytics', label: 'Overview' },
      { id: 'preview', label: 'Dashboard preview' },
      { id: 'verification', label: 'Verification queue' },
      { id: 'playlist_curators', label: 'Playlist curators' },
      { id: 'deleted_pages', label: 'Deleted pages' },
      { id: 'applications', label: 'Editor applications' },
    ],
  },
  {
    title: 'Editorial desk',
    items: [
      { id: 'queue', label: 'Submission queue' },
      { id: 'wire', label: 'Wire picks' },
      { id: 'write', label: 'Write editorial' },
      { id: 'drafts', label: 'My drafts' },
      { id: 'events', label: 'Events board' },
    ],
  },
  {
    title: 'Your account',
    items: [
      { id: 'community-hub', label: 'Community hub' },
      { id: 'profile', label: 'Editor profile' },
    ],
  },
]

type Props = {
  user: User
  mode: string
  tab: SuperEditorTab
  onTabChange: (tab: SuperEditorTab) => void
  counts: {
    pending: number
    in_review: number
    approved: number
    rejected: number
    drafts: number
  }
  pipelineLabel?: string
  onLogout: () => void
  children: ReactNode
}

export function SuperEditorDeskLayout({
  user,
  mode,
  tab,
  onTabChange,
  counts,
  pipelineLabel,
  onLogout,
  children,
}: Props) {
  const navGroups: DeskNavGroup<SuperEditorTab>[] = [
    ...listenerDeskNavGroups(LISTENER_UPGRADE_PATH_BADGE),
    ...ROLE_NAV_GROUPS,
  ].map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      id: item.id as SuperEditorTab,
      badge:
        item.id === 'queue'
          ? counts.pending
          : item.id === 'drafts'
            ? counts.drafts
            : undefined,
    })),
  }))

  return (
    <RoleDeskLayout
      user={user}
      mode={mode}
      kicker="Editorial command"
      title="IOS Support desk"
      summary="Run the magazine pipeline, verify roles, and steer the network."
      badge={
        <MetalBadge variant="live" className="shrink-0">
          IOS Support
        </MetalBadge>
      }
      tab={tab}
      onTabChange={onTabChange}
      navGroups={navGroups}
      quickTiles={[
        {
          label: 'Pending',
          value: counts.pending,
          onClick: () => onTabChange('queue'),
        },
        {
          label: 'In review',
          value: counts.in_review,
          onClick: () => onTabChange('queue'),
        },
        {
          label: 'Drafts',
          value: counts.drafts,
          onClick: () => onTabChange('drafts'),
        },
        {
          label: 'Pipeline',
          value: pipelineLabel ?? '—',
          accent: true,
          onClick: () => onTabChange('analytics'),
        },
      ]}
      onLogout={onLogout}
      rootClassName="super-editor-dashboard member-desk member-desk--shellless"
    >
      {children}
    </RoleDeskLayout>
  )
}
