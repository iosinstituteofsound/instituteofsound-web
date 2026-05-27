import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EventCard } from '@/components/events/EventCard'
import { EventSubmitForm } from '@/components/events/EventSubmitForm'
import { EventBoardFilters } from '@/components/events/EventBoardFilters'
import { useAuth } from '@/context/AuthContext'
import { fetchUpcomingEvents } from '@/lib/events/service'
import type { EventFilters } from '@/lib/events/types'
import { findCityBySlug, findGenreBySlug } from '@/lib/discovery/sceneRegistry'
import { useSeo } from '@/hooks/useSeo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { useCallback, useEffect } from 'react'
import type { SceneEvent } from '@/lib/events/types'

export default function EventsIndexPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const citySlug = searchParams.get('city') ?? ''
  const genreSlug = searchParams.get('genre') ?? ''

  const initialFilters = useMemo<EventFilters>(() => {
    const city = findCityBySlug(citySlug)?.label
    const genre = genreSlug || undefined
    return { city, genreSlug: genre }
  }, [citySlug, genreSlug])

  const [filters, setFilters] = useState<EventFilters>(initialFilters)
  const [events, setEvents] = useState<SceneEvent[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setEvents(await fetchUpcomingEvents(filters, 40, user?.id))
    } finally {
      setLoading(false)
    }
  }, [filters, user?.id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  useSeo({
    title: 'Underground Events',
    description:
      'India-first gig listings — indie, electronic, metal, and experimental shows. Editor-verified. RSVP on the network.',
    canonicalPath: '/events',
    jsonLd: breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Events', path: '/events' },
    ]),
  })

  const sceneLabel =
    filters.city && filters.genreSlug
      ? `${filters.city} · ${findGenreBySlug(filters.genreSlug)?.label ?? filters.genreSlug}`
      : filters.city ?? 'India'

  return (
    <div className="section-padding pt-32 pb-20">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          label="IRL · India"
          title="Underground events"
          subtitle="Gig listings with external links — no empty global calendar. Editors approve before publish."
          titleAs="h1"
        />

        <p className="discovery-anti-algo text-sm text-muted max-w-2xl mb-8 border-l-2 border-mh-red pl-4">
          Real shows in your city — not a dead Ticketmaster clone.
        </p>

        <EventSubmitForm onSubmitted={() => void refresh()} />

        <div className="mt-10">
          <p className="ios-kicker mb-3">Filter · {sceneLabel}</p>
          <EventBoardFilters value={filters} onChange={setFilters} />
        </div>

        <div className="mt-8 space-y-6">
          {loading && events.length === 0 && (
            <p className="text-sm text-muted text-center py-8">Loading events…</p>
          )}
          {!loading && events.length === 0 && (
            <div className="ios-card p-6 text-center">
              <p className="font-display font-bold">No upcoming listings</p>
              <p className="text-sm text-muted mt-2">
                Wave 1 scenes: Delhi, Mumbai, Bangalore, Kolkata — submit the first gig.
              </p>
            </div>
          )}
          {events.map((event) => (
            <EventCard key={event.id} event={event} onRsvpChange={() => void refresh()} />
          ))}
        </div>

        <p className="text-sm text-muted mt-12 text-center">
          <Link to="/scenes" className="text-mh-red">
            Scene hubs
          </Link>
          {' · '}
          <Link to="/collab" className="text-mh-red">
            Collab board
          </Link>
          {' · '}
          <Link to="/community" className="text-mh-red">
            Network
          </Link>
        </p>
      </div>
    </div>
  )
}
