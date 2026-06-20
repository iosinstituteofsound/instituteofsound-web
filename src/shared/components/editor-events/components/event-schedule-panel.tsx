import { CalendarDays, Plus } from 'lucide-react'
import type { EventDto } from '@/modules/explore/types/explore.types'
import {
  EVENT_SCHEDULE_FILTER_LABELS,
  EVENT_SCHEDULE_FILTERS,
  eventScheduleMeta,
} from '@/shared/components/editor-events/lib/event-desk-utils'
import type { EventScheduleFilter } from '@/shared/components/editor-events/types'
import { cn } from '@/shared/lib/cn'

export function EventScheduleFilterTabs({
  filter,
  counts,
  onChange,
}: {
  filter: EventScheduleFilter
  counts: Record<EventScheduleFilter, number>
  onChange: (filter: EventScheduleFilter) => void
}) {
  return (
    <div className="evt-desk__filters" role="tablist" aria-label="Event schedule filters">
      {EVENT_SCHEDULE_FILTERS.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={filter === key ? 'true' : 'false'}
          className={cn('evt-desk__filter', filter === key && 'evt-desk__filter--active')}
          onClick={() => onChange(key)}
        >
          {EVENT_SCHEDULE_FILTER_LABELS[key]}
          <span className="evt-desk__filter-count">{counts[key]}</span>
        </button>
      ))}
    </div>
  )
}

export function EventScheduleRow({
  event,
  index,
  active,
  onSelect,
}: {
  event: EventDto
  index: number
  active: boolean
  onSelect: () => void
}) {
  const meta = eventScheduleMeta(event, index)

  return (
    <button
      type="button"
      className={cn('evt-desk__row', active && 'evt-desk__row--active')}
      onClick={onSelect}
    >
      <div className="evt-desk__poster">
        <img src={meta.cover} alt="" loading="lazy" />
        <div className="evt-desk__date-badge" aria-hidden>
          <span className="evt-desk__date-day">{meta.when.day}</span>
          <span className="evt-desk__date-month">{meta.when.month}</span>
        </div>
      </div>
      <div className="evt-desk__info">
        <p className="evt-desk__event-title">{event.title}</p>
        <p className="evt-desk__event-meta">{meta.location}</p>
        <p className="evt-desk__event-meta">{meta.when.line}</p>
        <div className="evt-desk__badges">
          <span className="evt-desk__badge">{meta.tags.primary}</span>
          <span className="evt-desk__badge">{meta.tags.secondary}</span>
          <span
            className={cn(
              'evt-desk__badge',
              meta.upcoming ? 'evt-desk__badge--live' : 'evt-desk__badge--past',
            )}
          >
            {meta.upcoming ? 'Upcoming' : 'Past'}
          </span>
        </div>
      </div>
    </button>
  )
}

export function EventSchedulePanel({
  events,
  filter,
  counts,
  selectedId,
  labels,
  onFilterChange,
  onSelect,
  onStartCreate,
  newEventLabel,
}: {
  events: EventDto[]
  filter: EventScheduleFilter
  counts: Record<EventScheduleFilter, number>
  selectedId: string | null
  labels: { scheduleKicker: string; scheduleTitle: string; scheduleEmpty: string }
  onFilterChange: (filter: EventScheduleFilter) => void
  onSelect: (id: string) => void
  onStartCreate: () => void
  newEventLabel: string
}) {
  return (
    <section className="evt-desk__panel evt-desk__panel--schedule" aria-labelledby="event-schedule-heading">
      <header className="evt-desk__header">
        <div>
          <p className="evt-desk__kicker">{labels.scheduleKicker}</p>
          <h3 id="event-schedule-heading" className="evt-desk__title">
            {labels.scheduleTitle}
          </h3>
        </div>
        <span className="evt-desk__meta">
          <CalendarDays size={12} aria-hidden />
          {counts.all} total
        </span>
      </header>
      <div className="evt-desk__body">
        <div className="evt-desk__toolbar">
          <button type="button" className="evt-desk__new-btn evt-desk__filter" onClick={onStartCreate}>
            <Plus size={12} className="inline mr-1" aria-hidden />
            {newEventLabel}
          </button>
        </div>
        <EventScheduleFilterTabs filter={filter} counts={counts} onChange={onFilterChange} />
        <div className="evt-desk__scroll">
          {events.length === 0 ? (
            <div className="evt-desk__empty">{labels.scheduleEmpty}</div>
          ) : (
            <div className="evt-desk__list">
              {events.map((event, index) => (
                <EventScheduleRow
                  key={event.id}
                  event={event}
                  index={index}
                  active={selectedId === event.id}
                  onSelect={() => onSelect(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
