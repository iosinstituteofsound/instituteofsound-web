import type { ReactNode } from 'react'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { User } from '@/lib/auth/types'
import { RoleDeskLayout, type DeskNavGroup } from '@/components/dashboard/RoleDeskLayout'

export type SuperEditorTab =
  | 'analytics'
  | 'preview'
  | 'verification'
  | 'applications'
  | 'queue'
  | 'wire'
  | 'events'
  | 'write'
  | 'drafts'
  | 'network'
  | 'profile'

const NAV_GROUPS: DeskNavGroup<SuperEditorTab>[] = [
  {
    title: 'Command',
    items: [
      { id: 'analytics', label: 'Overview' },
      { id: 'preview', label: 'Dashboard preview' },
      { id: 'verification', label: 'Verification queue' },
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
      { id: 'network', label: 'Network & feed' },
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
  const navGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
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
      title="Super editor desk"
      summary="Run the magazine pipeline, verify roles, and steer the network."
      badge={
        <MetalBadge variant="live" className="shrink-0">
          Super editor
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
      rootClassName="super-editor-dashboard"
    >
      {children}
    </RoleDeskLayout>
  )
}
