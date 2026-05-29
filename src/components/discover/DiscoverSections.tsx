import { useAuth } from '@/context/AuthContext'
import { useLoginGate } from '@/context/LoginGateContext'

export { DiscoverEditorialSection } from '@/components/discover/DiscoverEditorialSection'
export { DiscoverReleasesSection } from '@/components/discover/DiscoverReleasesSection'
export { DiscoverLabelsSection } from '@/components/discover/DiscoverLabelsSection'
export { DiscoverPlaylistsSection } from '@/components/discover/DiscoverPlaylistsSection'
export { DiscoverScenesSection } from '@/components/discover/DiscoverScenesSection'
export { DiscoverEventsSection } from '@/components/discover/DiscoverEventsSection'
export { DiscoverListenersSection } from '@/components/discover/DiscoverListenersSection'
export { DiscoverCommunitySection } from '@/components/discover/DiscoverCommunitySection'

const DISCOVER_TABS = [
  { id: 'editorial', label: 'Editorial', idx: '01' },
  { id: 'artists', label: 'Artists', idx: '02' },
  { id: 'releases', label: 'Releases', idx: '03' },
  { id: 'labels', label: 'Labels', idx: '04' },
  { id: 'playlists', label: 'Playlists', idx: '05' },
  { id: 'scenes', label: 'Scenes', idx: '06' },
  { id: 'events', label: 'Events', idx: '07' },
  { id: 'listeners', label: 'Listeners', idx: '08' },
  { id: 'community', label: 'Community', idx: '09' },
] as const

export function DiscoverGuestBanner() {
  const { user } = useAuth()
  const { openLoginGate } = useLoginGate()
  if (user) return null

  return (
    <div className="discover-guest-banner">
      <div>
        <p className="ios-kicker">Explore preview</p>
        <p className="font-display text-lg font-bold mt-1">Login to access the full wire</p>
        <p className="text-sm text-muted mt-2 max-w-xl">
          Sections load below — taps into artists, feed, and profiles need sign-in.
        </p>
      </div>
      <button type="button" className="ios-btn ios-btn-primary shrink-0" onClick={() => openLoginGate()}>
        Sign in
      </button>
    </div>
  )
}

export function DiscoverPageIntro() {
  return (
    <header className="discover-page-intro">
      <div className="discover-intro-meta">
        <div>
          <p className="ios-kicker">Wire index</p>
          <h1 className="discover-intro-title">Explore</h1>
        </div>
        <p className="discover-intro-hint">
          Search in header <kbd>⌘K</kbd>
        </p>
      </div>
      <nav className="discover-rail-nav discover-rail-nav--sticky" aria-label="Jump to section">
        {DISCOVER_TABS.map((tab) => (
          <a key={tab.id} href={`#discover-${tab.id}`} className="discover-rail-link">
            <span className="discover-rail-link__idx">{tab.idx}</span>
            {tab.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

