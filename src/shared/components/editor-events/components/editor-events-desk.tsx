import { EventDetailPanel } from '@/shared/components/editor-events/components/event-detail-panel'
import { EventSchedulePanel } from '@/shared/components/editor-events/components/event-schedule-panel'
import {
  filterEventsBySchedule,
  countEventsBySchedule,
} from '@/shared/components/editor-events/lib/event-desk-utils'
import {
  DEFAULT_EDITOR_EVENTS_LABELS,
  type EditorEventsDeskProps,
} from '@/shared/components/editor-events/types'
import { cn } from '@/shared/lib/cn'
import '@/shared/components/editor-events/styles/editor-events-desk.css'

export function EditorEventsDesk({
  events,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
  draft,
  onDraftChange,
  isCreating,
  onStartCreate,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  className,
  labels,
}: EditorEventsDeskProps) {
  const copy = { ...DEFAULT_EDITOR_EVENTS_LABELS, ...labels }
  const filteredEvents = filterEventsBySchedule(events, filter)
  const scheduleCounts = countEventsBySchedule(events)
  const selectedEvent = events.find((event) => event.id === selectedId) ?? null

  return (
    <div className={cn('evt-desk', className)}>
      <EventSchedulePanel
        events={filteredEvents}
        filter={filter}
        counts={scheduleCounts}
        selectedId={isCreating ? null : selectedId}
        labels={{
          scheduleKicker: copy.scheduleKicker,
          scheduleTitle: copy.scheduleTitle,
          scheduleEmpty: copy.scheduleEmpty,
        }}
        onFilterChange={onFilterChange}
        onSelect={(id) => {
          onSelect(id)
        }}
        onStartCreate={onStartCreate}
        newEventLabel={copy.newEventLabel}
      />
      <EventDetailPanel
        event={selectedEvent}
        draft={draft}
        isCreating={isCreating}
        onDraftChange={onDraftChange}
        onSave={onSave}
        onDelete={onDelete}
        isSaving={isSaving}
        isDeleting={isDeleting}
        labels={{
          detailKicker: copy.detailKicker,
          detailTitle: copy.detailTitle,
          createTitle: copy.createTitle,
          detailEmpty: copy.detailEmpty,
          saveLabel: copy.saveLabel,
          createLabel: copy.createLabel,
          deleteLabel: copy.deleteLabel,
          savingLabel: copy.savingLabel,
          titleLabel: copy.titleLabel,
          slugLabel: copy.slugLabel,
          venueLabel: copy.venueLabel,
          startsAtLabel: copy.startsAtLabel,
          descriptionLabel: copy.descriptionLabel,
          coverUrlLabel: copy.coverUrlLabel,
          ticketUrlLabel: copy.ticketUrlLabel,
        }}
      />
    </div>
  )
}
