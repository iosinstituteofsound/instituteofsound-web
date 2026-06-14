import { eventKindLabel } from '@/lib/events/constants'
import type { SceneEvent } from '@/lib/events/types'
import { EventRsvpButton } from '@/components/events/EventRsvpButton'

interface EventCardProps {
  event: SceneEvent
  onRsvpChange?: () => void
}

export function EventCard({ event, onRsvpChange }: EventCardProps) {
  const date = new Date(event.startsAt)

  return (
    <article className="scene-event-card ios-card">
      <div className="scene-event-card-head">
        <span className="scene-event-kind">{eventKindLabel(event.eventKind)}</span>
        <time className="scene-event-date" dateTime={event.startsAt}>
          {date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>

      <h3 className="font-display text-xl font-bold mt-2">{event.title}</h3>
      {event.description && <p className="text-sm text-muted mt-2">{event.description}</p>}

      <p className="scene-event-venue mt-3">
        <span className="text-mh-red">{event.venueName}</span>
        <span className="text-muted">
          {' '}
          · {event.sceneCity}
          {event.sceneGenreSlug && ` · ${event.sceneGenreSlug.replace(/-/g, ' ')}`}
        </span>
      </p>

      <div className="scene-event-actions mt-4 flex flex-wrap items-center gap-3">
        <a
          href={event.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ios-btn ios-btn-primary !text-xs"
        >
          Tickets / info →
        </a>
        <EventRsvpButton event={event} onChange={onRsvpChange} />
        <span className="text-xs text-muted">
          {event.rsvpCount.toLocaleString()} going on IOS
        </span>
      </div>
    </article>
  )
}
