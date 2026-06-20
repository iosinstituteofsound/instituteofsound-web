import type { ReactNode } from 'react'
import type { EventDto } from '@/modules/explore/types/explore.types'

export type EventScheduleFilter = 'all' | 'upcoming' | 'past'

export interface EventDraft {
  title: string
  slug: string
  venue: string
  startsAt: string
  description: string
  coverUrl: string
  ticketUrl: string
}

export interface EditorEventsLabels {
  scheduleKicker?: string
  scheduleTitle?: string
  scheduleEmpty?: string
  detailKicker?: string
  detailTitle?: string
  detailEmpty?: string
  createTitle?: string
  saveLabel?: string
  createLabel?: string
  deleteLabel?: string
  savingLabel?: string
  newEventLabel?: string
  titleLabel?: string
  slugLabel?: string
  venueLabel?: string
  startsAtLabel?: string
  descriptionLabel?: string
  coverUrlLabel?: string
  ticketUrlLabel?: string
}

export const DEFAULT_EDITOR_EVENTS_LABELS: Required<EditorEventsLabels> = {
  scheduleKicker: ':: Transmission calendar',
  scheduleTitle: 'Event schedule',
  scheduleEmpty: 'No events in this view. Schedule a transmission for the wire.',
  detailKicker: ':: Event console',
  detailTitle: 'Event detail',
  detailEmpty: 'Select an event to edit or schedule a new transmission.',
  createTitle: 'New transmission',
  saveLabel: 'Save event',
  createLabel: 'Publish event',
  deleteLabel: 'Delete',
  savingLabel: 'Saving…',
  newEventLabel: 'Schedule event',
  titleLabel: 'Title',
  slugLabel: 'Slug',
  venueLabel: 'Venue',
  startsAtLabel: 'Starts at',
  descriptionLabel: 'Description',
  coverUrlLabel: 'Cover image URL',
  ticketUrlLabel: 'Ticket / RSVP link',
}

export const EMPTY_EVENT_DRAFT: EventDraft = {
  title: '',
  slug: '',
  venue: '',
  startsAt: '',
  description: '',
  coverUrl: '',
  ticketUrl: '',
}

export interface EditorEventsDeskProps {
  events: EventDto[]
  filter: EventScheduleFilter
  onFilterChange: (filter: EventScheduleFilter) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  draft: EventDraft
  onDraftChange: (draft: EventDraft) => void
  isCreating: boolean
  onStartCreate: () => void
  onSave: () => void
  onDelete?: () => void
  isSaving?: boolean
  isDeleting?: boolean
  className?: string
  labels?: EditorEventsLabels
}

export interface EditorEventsEditorProps {
  enabled?: boolean
  className?: string
  labels?: EditorEventsLabels
  onSaved?: (event: EventDto) => void
  children?: ReactNode
}
