import { Link } from 'react-router-dom'
import type { SceneEvent } from '@/lib/events/types'
import { EventCard } from '@/components/events/EventCard'

interface SceneEventsRailProps {
  events: SceneEvent[]
  citySlug: string
  genreSlug: string
  onRsvpChange?: () => void
}

export function SceneEventsRail({ events, citySlug, genreSlug, onRsvpChange }: SceneEventsRailProps) {
  if (events.length === 0) {
    return (
      <div className="scene-events-empty ios-card">
        <p className="font-display font-bold">No gigs listed this month</p>
        <p className="text-sm text-muted mt-2">
          Know a show?{' '}
          <Link to="/events" className="text-mh-red">
            Submit a listing
          </Link>{' '}
          — editors verify before publish.
        </p>
      </div>
    )
  }

  return (
    <div className="scene-events-rail space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onRsvpChange={onRsvpChange} />
      ))}
      <Link to={`/events?city=${encodeURIComponent(citySlug)}&genre=${genreSlug}`} className="text-sm text-mh-red uppercase tracking-widest">
        All upcoming in this scene →
      </Link>
    </div>
  )
}
