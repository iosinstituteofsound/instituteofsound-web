import type { EventDto } from '@/modules/explore/types/explore.types'
import {
  eventCover,
  eventLocationLine,
  eventTags,
  formatExploreEventDate,
} from '@/modules/explore/lib/event-meta'
import type { EventDraft, EventScheduleFilter } from '@/shared/components/editor-events/types'
import { EMPTY_EVENT_DRAFT } from '@/shared/components/editor-events/types'

export const EVENT_SCHEDULE_FILTERS: EventScheduleFilter[] = ['all', 'upcoming', 'past']

export const EVENT_SCHEDULE_FILTER_LABELS: Record<EventScheduleFilter, string> = {
  all: 'All',
  upcoming: 'Upcoming',
  past: 'Past',
}

export function filterEventsBySchedule(events: EventDto[], filter: EventScheduleFilter): EventDto[] {
  const now = Date.now()
  const sorted = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )

  switch (filter) {
    case 'upcoming':
      return sorted.filter((event) => new Date(event.startsAt).getTime() >= now)
    case 'past':
      return sorted.filter((event) => new Date(event.startsAt).getTime() < now)
    default:
      return sorted
  }
}

export function countEventsBySchedule(events: EventDto[]) {
  const now = Date.now()
  return {
    all: events.length,
    upcoming: events.filter((event) => new Date(event.startsAt).getTime() >= now).length,
    past: events.filter((event) => new Date(event.startsAt).getTime() < now).length,
  }
}

export function isUpcomingEvent(event: EventDto) {
  return new Date(event.startsAt).getTime() >= Date.now()
}

export function toDatetimeLocalValue(iso?: string) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDatetimeLocalValue(value: string) {
  return new Date(value).toISOString()
}

export function slugifyEventTitle(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `event-${Date.now()}`
}

export function eventDtoToDraft(event: EventDto): EventDraft {
  return {
    title: event.title,
    slug: event.slug,
    venue: event.venue,
    startsAt: toDatetimeLocalValue(event.startsAt),
    description: event.description ?? '',
    coverUrl: event.coverUrl ?? '',
    ticketUrl: event.ticketUrl ?? '',
  }
}

export function createDefaultEventDraft(): EventDraft {
  const startsAt = new Date(Date.now() + 7 * 86400000)
  startsAt.setMinutes(0, 0, 0)
  return {
    ...EMPTY_EVENT_DRAFT,
    title: 'New IOS Event',
    slug: slugifyEventTitle('New IOS Event'),
    venue: 'TBA',
    startsAt: toDatetimeLocalValue(startsAt.toISOString()),
    description: 'Transmission on the wire.',
  }
}

export function draftToCreatePayload(draft: EventDraft) {
  return {
    title: draft.title.trim(),
    slug: draft.slug.trim() || slugifyEventTitle(draft.title),
    venue: draft.venue.trim(),
    startsAt: fromDatetimeLocalValue(draft.startsAt),
    description: draft.description.trim() || undefined,
    coverUrl: draft.coverUrl.trim() || undefined,
    ticketUrl: draft.ticketUrl.trim() || undefined,
  }
}

export function draftToUpdatePayload(draft: EventDraft) {
  return draftToCreatePayload(draft)
}

export function eventScheduleMeta(event: EventDto, index: number) {
  const when = formatExploreEventDate(event.startsAt)
  const tags = eventTags(event)
  return {
    cover: eventCover(event, index),
    when,
    tags,
    location: eventLocationLine(event),
    upcoming: isUpcomingEvent(event),
  }
}
