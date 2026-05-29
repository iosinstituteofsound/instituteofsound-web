import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLoginGate } from '@/context/LoginGateContext'
import {
  DiscoverCommunitySection,
  DiscoverEditorialSection,
  DiscoverEventsSection,
  DiscoverGuestBanner,
  DiscoverPageIntro,
  DiscoverLabelsSection,
  DiscoverListenersSection,
  DiscoverPlaylistsSection,
  DiscoverReleasesSection,
  DiscoverScenesSection,
} from '@/components/discover/DiscoverSections'
import { DiscoverArtistsSection } from '@/components/discover/DiscoverArtistsSection'
import { useSeo } from '@/hooks/useSeo'

const DISCOVER_GATE_KEY = 'ios_discover_gate_seen'

export default function DiscoverPage() {
  const { user } = useAuth()
  const { openLoginGate } = useLoginGate()

  useSeo({
    title: 'Discover',
    description:
      'Search and explore editorial, artists, releases, labels, playlists, India scenes, events, operators, and community trends on Institute of Sound.',
    canonicalPath: '/discover',
  })

  useEffect(() => {
    if (user) return
    try {
      if (sessionStorage.getItem(DISCOVER_GATE_KEY) === '1') return
      sessionStorage.setItem(DISCOVER_GATE_KEY, '1')
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => {
      openLoginGate(
        'Sign in to follow operators, RSVP events, and unlock the full discovery engine.'
      )
    }, 700)
    return () => window.clearTimeout(t)
  }, [user, openLoginGate])

  return (
    <div className="discover-wire mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 lg:py-8">
      <DiscoverGuestBanner />
      <DiscoverPageIntro />
      <DiscoverEditorialSection />
      <DiscoverArtistsSection />
      <DiscoverReleasesSection />
      <DiscoverLabelsSection />
      <DiscoverPlaylistsSection />
      <DiscoverScenesSection />
      <DiscoverEventsSection />
      <DiscoverListenersSection />
      <DiscoverCommunitySection />
    </div>
  )
}
