export { EditorEventsDesk } from '@/shared/components/editor-events/components/editor-events-desk'
export { EditorEventsEditor } from '@/shared/components/editor-events/components/editor-events-editor'
export { EventSchedulePanel, EventScheduleRow, EventScheduleFilterTabs } from '@/shared/components/editor-events/components/event-schedule-panel'
export { EventDetailPanel } from '@/shared/components/editor-events/components/event-detail-panel'

export { useEditorEventsDesk } from '@/shared/components/editor-events/hooks/use-editor-events-desk'
export { useEditorEventsEditor } from '@/shared/components/editor-events/hooks/use-editor-events-editor'

export {
  EVENT_SCHEDULE_FILTERS,
  EVENT_SCHEDULE_FILTER_LABELS,
  countEventsBySchedule,
  createDefaultEventDraft,
  eventDtoToDraft,
  filterEventsBySchedule,
  isUpcomingEvent,
  slugifyEventTitle,
  toDatetimeLocalValue,
} from '@/shared/components/editor-events/lib/event-desk-utils'

export {
  DEFAULT_EDITOR_EVENTS_LABELS,
  EMPTY_EVENT_DRAFT,
  type EditorEventsDeskProps,
  type EditorEventsEditorProps,
  type EditorEventsLabels,
  type EventDraft,
  type EventScheduleFilter,
} from '@/shared/components/editor-events/types'
