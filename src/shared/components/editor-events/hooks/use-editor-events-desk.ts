import { useEffect, useMemo, useState } from 'react'
import type { EventDto } from '@/modules/explore/types/explore.types'
import {
  countEventsBySchedule,
  createDefaultEventDraft,
  eventDtoToDraft,
  filterEventsBySchedule,
} from '@/shared/components/editor-events/lib/event-desk-utils'
import type { EventDraft, EventScheduleFilter } from '@/shared/components/editor-events/types'

interface UseEditorEventsDeskOptions {
  events: EventDto[]
  filter: EventScheduleFilter
  selectedId: string | null
  isCreating: boolean
  onSelect: (id: string | null) => void
}

export function useEditorEventsDesk({
  events,
  filter,
  selectedId,
  isCreating,
  onSelect,
}: UseEditorEventsDeskOptions) {
  const [draft, setDraft] = useState<EventDraft>(createDefaultEventDraft())

  const filteredEvents = useMemo(
    () => filterEventsBySchedule(events, filter),
    [events, filter],
  )

  const scheduleCounts = useMemo(() => countEventsBySchedule(events), [events])

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? null,
    [events, selectedId],
  )

  useEffect(() => {
    if (isCreating) {
      setDraft(createDefaultEventDraft())
      return
    }
    if (selectedEvent) {
      setDraft(eventDtoToDraft(selectedEvent))
    }
  }, [isCreating, selectedEvent?.id, selectedEvent])

  useEffect(() => {
    if (selectedId && !events.some((event) => event.id === selectedId)) {
      onSelect(null)
    }
  }, [events, onSelect, selectedId])

  return {
    filteredEvents,
    scheduleCounts,
    selectedEvent,
    draft,
    setDraft,
  }
}
