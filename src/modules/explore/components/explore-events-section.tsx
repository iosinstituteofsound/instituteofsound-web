import { useState } from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/stores/auth-store'
import type { EventDto } from '@/modules/explore/types/explore.types'
import {
  eventCover,
  eventLocationLine,
  eventSubtitle,
  eventTags,
  formatExploreEventDate,
  isFallbackEvent,
  listExploreEvents,
} from '@/modules/explore/lib/event-meta'

interface ExploreEventsSectionProps {
  events: EventDto[]
}

function EventCard({ event, index }: { event: EventDto; index: number }) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [rsvped, setRsvped] = useState(false)
  const [busy, setBusy] = useState(false)
  const when = formatExploreEventDate(event.startsAt)
  const tags = eventTags(event)
  const poster = eventCover(event, index)

  const handleRsvp = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: '/explore' } })
      return
    }
    if (isFallbackEvent(event)) {
      navigate('/auth/login', { state: { from: '/explore' } })
      return
    }
    setBusy(true)
    try {
      setRsvped((prev) => !prev)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article
      className="explore-evt-card"
      style={{ '--explore-evt-card-delay': `${90 + index * 55}ms` } as React.CSSProperties}
    >
      <a
        href={event.ticketUrl ?? `#event-${event.slug}`}
        className="explore-evt-card__poster"
        onClick={(e) => {
          if (!event.ticketUrl) e.preventDefault()
        }}
      >
        <img src={poster} alt="" loading="lazy" className="explore-evt-card__img" />
        <span className="explore-evt-card__live">Live</span>
        <div className="explore-evt-card__date" aria-hidden>
          <span className="explore-evt-card__day">{when.day}</span>
          <span className="explore-evt-card__month">{when.month}</span>
        </div>
      </a>

      <div className="explore-evt-card__body">
        <div className="explore-evt-card__tags">
          <span>{tags.primary}</span>
          <span>{tags.secondary}</span>
        </div>

        <h3 className="explore-evt-card__title">{event.title}</h3>
        <p className="explore-evt-card__sub">{eventSubtitle(event)}</p>

        <ul className="explore-evt-card__meta">
          <li>
            <Calendar size={11} strokeWidth={2} aria-hidden />
            {when.line}
          </li>
          <li>
            <Clock size={11} strokeWidth={2} aria-hidden />
            {when.time}
          </li>
          <li>
            <MapPin size={11} strokeWidth={2} aria-hidden />
            {eventLocationLine(event)}
          </li>
        </ul>

        <button
          type="button"
          className="explore-evt-card__rsvp"
          disabled={busy}
          onClick={handleRsvp}
        >
          {busy ? '…' : rsvped ? 'Going' : 'RSVP'}
          <span className="explore-evt-card__rsvp-arrow" aria-hidden>
            →
          </span>
        </button>
      </div>
    </article>
  )
}

export function ExploreEventsSection({ events }: ExploreEventsSectionProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const items = listExploreEvents(events, 5)
  if (items.length === 0) return null

  const submitHref = isAuthenticated ? '/editor/events' : '/auth/login'

  return (
    <section id="explore-events" className="explore-section explore-evt-section">
      <header className="explore-evt-head">
        <div className="explore-evt-head__brand">
          <span className="explore-evt-head__num" aria-hidden>
            07
          </span>
          <div>
            <p className="explore-evt-head__kicker">Live</p>
            <h2 className="explore-evt-head__title">Events</h2>
            <p className="explore-evt-head__sub">Gigs on the wire — RSVP when signed in.</p>
          </div>
        </div>

        <a href="#explore-events" className="explore-evt-head__board">
          <span className="explore-evt-head__board-text">Event board</span>
          <span className="explore-evt-head__board-arrow" aria-hidden>
            →
          </span>
        </a>
      </header>

      <div className="explore-evt-intro">
        <h3 className="explore-evt-intro__title">Upcoming events</h3>
        <span className="explore-evt-intro__dot" aria-hidden />
        <p className="explore-evt-intro__sub">See what&apos;s happening on the underground.</p>
      </div>

      <div className="explore-evt-grid">
        {items.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>

      <Link to={submitHref} state={{ from: '/explore' }} className="explore-evt-submit">
        <span className="explore-evt-submit__icon" aria-hidden>
          <Calendar size={22} strokeWidth={1.5} />
        </span>
        <span className="explore-evt-submit__copy">
          <strong>Don&apos;t see your event here?</strong>
          <span>Submit your gig to get discovered by the underground.</span>
        </span>
        <span className="explore-evt-submit__cta">
          Submit event
          <span aria-hidden>→</span>
        </span>
      </Link>
    </section>
  )
}
