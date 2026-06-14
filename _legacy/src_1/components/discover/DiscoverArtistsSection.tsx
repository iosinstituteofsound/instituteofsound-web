import { useCallback, useMemo, useRef, useState } from 'react'
import { useContent } from '@/hooks/useContent'
import { listDiscoverArtists } from '@/lib/artist-profile/service'
import {
  DiscoverArtistsRoster,
  RosterCarouselNav,
} from '@/components/discover/DiscoverArtistsRoster'
import '@/styles/roster-pro.css'

export function DiscoverArtistsSection() {
  const { data, loading } = useContent(useCallback(() => listDiscoverArtists(), []))
  const artists = data ?? []
  const scrollByRef = useRef<(dir: -1 | 1) => void>(() => {})
  const [nav, setNav] = useState({ activeIndex: 0, pageCount: 0 })

  const handleCarouselReady = useCallback(
    (api: {
      scrollBy: (dir: -1 | 1) => void
      activeIndex: number
      pageCount: number
    }) => {
      scrollByRef.current = api.scrollBy
      setNav((prev) =>
        prev.activeIndex === api.activeIndex && prev.pageCount === api.pageCount
          ? prev
          : { activeIndex: api.activeIndex, pageCount: api.pageCount }
      )
    },
    []
  )

  const openStudios = useMemo(
    () => artists.filter((a, i) => a.featured || i % 3 === 0).length,
    [artists]
  )

  return (
    <section id="discover-artists" className="roster-pro-sec scroll-mt-24">
      <header className="roster-pro-sec__head">
        <div className="roster-pro-sec__brand">
          <span className="roster-pro-sec__idx" aria-hidden>
            02
          </span>
          <div className="roster-pro-sec__titles">
            <p className="roster-pro-sec__tag">Roster</p>
            <h2 className="roster-pro-sec__title">Artists</h2>
            <p className="roster-pro-sec__sub">
              Live studio pages on the underground network.
            </p>
          </div>
        </div>

        <div className="roster-pro-sec__aside">
          <div className="roster-pro-sec__stats" aria-label="Roster statistics">
            <div className="roster-pro__stat">
              <strong>{artists.length > 0 ? `${artists.length}+` : '—'}</strong>
              <span>Artists</span>
            </div>
            <div className="roster-pro__stat">
              <strong>{openStudios > 0 ? `${openStudios}+` : '—'}</strong>
              <span>Open studios</span>
            </div>
            <div className="roster-pro__stat roster-pro__stat--wire">
              <strong>24/7</strong>
              <span>The wire</span>
            </div>
          </div>
          {nav.pageCount > 0 && (
            <RosterCarouselNav
              pageCount={nav.pageCount}
              activeIndex={nav.activeIndex}
              onPrev={() => scrollByRef.current(-1)}
              onNext={() => scrollByRef.current(1)}
            />
          )}
        </div>
      </header>

      <DiscoverArtistsRoster
        artists={artists}
        loading={loading}
        onCarouselReady={handleCarouselReady}
      />
    </section>
  )
}
