import type { ReactNode } from 'react'
import type { WireCandidates, WirePickItem } from '@/modules/explore/types/explore.types'
import type { WireReleaseSection, WireSourceTab } from '@/shared/components/wire-picks/lib/wire-candidate-filters'

export interface WirePicksLabels {
  lineupKicker?: string
  lineupTitle?: string
  lineupEmpty?: string
  candidatesKicker?: string
  candidatesTitle?: string
  saveLabel?: string
  savingLabel?: string
  searchHint?: string
  footerHint?: (count: number) => string
  liveMeta?: (count: number) => string
}

export const DEFAULT_WIRE_PICKS_LABELS: Required<Omit<WirePicksLabels, 'footerHint' | 'liveMeta'>> & {
  footerHint: (count: number) => string
  liveMeta: (count: number) => string
} = {
  lineupKicker: ':: Broadcast output',
  lineupTitle: 'Wire lineup',
  lineupEmpty: 'Drag candidates from the right and drop them here.\nOr tap + to add · reorder with the grip once slotted.',
  candidatesKicker: ':: Source matrix',
  candidatesTitle: 'Pick candidates',
  saveLabel: 'Save wire picks',
  savingLabel: 'Saving wire…',
  searchHint: 'Search releases and playlist tracks across the site, then tap a result to slot it into the wire.',
  footerHint: (count) =>
    `${count} pick${count === 1 ? '' : 's'} queued · drag to reorder or drop from the right.`,
  liveMeta: (count) => `${count} live`,
}

export interface WirePicksBuilderProps {
  items: WirePickItem[]
  candidates?: WireCandidates
  onChange: (items: WirePickItem[]) => void
  onSave?: () => void
  isSaving?: boolean
  className?: string
  labels?: WirePicksLabels
  enabledSourceTabs?: WireSourceTab[]
  defaultSourceTab?: WireSourceTab
  defaultSection?: WireReleaseSection
  releasePageLimit?: number
  instanceId?: string
}

export interface WirePicksEditorProps {
  enabled?: boolean
  className?: string
  labels?: WirePicksLabels
  enabledSourceTabs?: WireSourceTab[]
  defaultSourceTab?: WireSourceTab
  defaultSection?: WireReleaseSection
  releasePageLimit?: number
  instanceId?: string
  onSaved?: () => void
  children?: ReactNode
}
