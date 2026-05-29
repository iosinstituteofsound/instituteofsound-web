import { useEffect, useState } from 'react'
import { GatedLink } from '@/components/auth/GatedLink'
import { useAuth } from '@/context/AuthContext'
import { useLoginGate } from '@/context/LoginGateContext'
import { toggleEventRsvp } from '@/lib/events/service'
import {
  formatDiscoverEventDate,
  listDiscoverEvents,
  type DiscoverEventCard,
} from '@/lib/discovery/events'
import '@/styles/events-wire.css'

function DiscoverEventTile({ event }: { event: DiscoverEventCard }) {
  const { user } = useAuth()
  const { openLoginGate } = useLoginGate()
  const [rsvped, setRsvped] = useState(event.viewerRsvped)
  const [busy, setBusy] = useState(false)
  const when = formatDiscoverEventDate(event.startsAt)

  const handleRsvp = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      openLoginGate('Sign in to RSVP on the wire.')
      return
    }
    if (event.id.startsWith('discover-evt-')) {
      openLoginGate('Published events RSVP on the full event board.')
      return
    }
    setBusy(true)
    try {
      const next = await toggleEventRsvp(event.id, user.id)
      setRsvped(next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="evt-card">
      <a
        href={event.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="evt-card__poster"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={event.imageUrl} alt="" className="evt-card__img" loading="lazy" />
        <span className="evt-card__live">Live</span>
        <div className="evt-card__date">
          <span className="evt-card__day">{when.day}</span>
          <span className="evt-card__month">{when.month}</span>
        </div>
      </a>

      <div className="evt-card__body">
        <div className="evt-card__tags">
          <span>{event.tagPrimary}</span>
          <span>{event.tagSecondary}</span>
        </div>

        <h3 className="evt-card__title">{event.title}</h3>
        <p className="evt-card__sub">{event.subtitle}</p>

        <ul className="evt-card__meta">
          <li>
            <IcoCal />
            {when.line}
          </li>
          <li>
            <IcoClock />
            {when.time}
          </li>
          <li>
            <IcoPin />
            {event.venueName}, {event.sceneCity}
          </li>
        </ul>

        <button
          type="button"
          className="evt-card__rsvp"
          disabled={busy}
          onClick={handleRsvp}
        >
          {busy ? '…' : rsvped ? 'Going' : 'RSVP'}
          <span className="evt-card__rsvp-arrow" aria-hidden>
            →
          </span>
        </button>
      </div>
    </article>
  )
}

export function DiscoverEventsSection() {
  const [events, setEvents] = useState<DiscoverEventCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void listDiscoverEvents(5)
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="discover-events" className="evt-sec scroll-mt-24">
      <header className="evt-sec__head">
        <div className="evt-sec__brand">
          <span className="evt-sec__idx" aria-hidden>
            07
          </span>
          <div>
            <p className="evt-sec__tag">Live</p>
            <h2 className="evt-sec__title">Events</h2>
            <p className="evt-sec__sub">Gigs on the wire — RSVP when signed in.</p>
          </div>
        </div>
        <GatedLink to="/events" forceGate className="evt__board-btn">
          <span className="evt__board-btn-text">Event board</span>
          <span className="evt__board-btn-arrow" aria-hidden>
            →
          </span>
        </GatedLink>
      </header>

      <div className="evt-sec__intro">
        <h3 className="evt-sec__intro-title">Upcoming events</h3>
        <span className="evt-sec__intro-dot" aria-hidden />
        <p className="evt-sec__intro-sub">See what&apos;s happening on the underground.</p>
      </div>

      {loading && <p className="disco-loading">Loading events…</p>}

      {!loading && events.length > 0 && (
        <div className="evt__grid">
          {events.map((ev) => (
            <DiscoverEventTile key={ev.id} event={ev} />
          ))}
        </div>
      )}

      <GatedLink to="/events" forceGate className="evt__submit">
        <span className="evt__submit-icon" aria-hidden>
          <IcoCalLarge />
        </span>
        <span className="evt__submit-copy">
          <strong>Don&apos;t see your event here?</strong>
          <span>Submit your gig to get discovered by the underground.</span>
        </span>
        <span className="evt__submit-cta">
          Submit event
          <span aria-hidden>→</span>
        </span>
      </GatedLink>
    </section>
  )
}

function IcoCal() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <rect x="1.5" y="2" width="8" height="7.5" rx="0.8" stroke="currentColor" strokeWidth="1" />
      <path d="M1.5 4h8M3.5 1v2M7.5 1v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function IcoCalLarge() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="3" y="4" width="16" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 8h16M7 2v3M15 2v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IcoClock() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <circle cx="5.5" cy="5.5" r="4.2" stroke="currentColor" strokeWidth="1" />
      <path d="M5.5 3v2.5l1.8 1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function IcoPin() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path
        d="M5.5 1.5c-1.8 0-3 1.4-3 3.2 0 2.2 3 5.3 3 5.3s3-3.1 3-5.3c0-1.8-1.2-3.2-3-3.2z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="5.5" cy="4.5" r="1" fill="currentColor" />
    </svg>
  )
}
