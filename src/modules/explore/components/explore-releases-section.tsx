import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReleaseDto, ReleaseFilter } from '@/modules/explore/types/explore.types'
import { filterReleases } from '@/modules/explore/lib/release-meta'
import { ExploreReleaseCard } from '@/modules/explore/components/explore-release-card'
import {
  ExploreSectionHead,
  ExploreSectionHeadAction,
} from '@/modules/explore/components/explore-section-head'
import { cn } from '@/shared/lib/cn'

const FILTER_OPTIONS: { value: ReleaseFilter; label: string }[] = [
  { value: 'all', label: 'All Releases' },
  { value: 'album', label: 'Albums' },
  { value: 'ep', label: 'EPs' },
  { value: 'single', label: 'Singles' },
  { value: 'archive', label: 'Archive Drops' },
]

export function ExploreReleasesSection({ releases }: { releases: ReleaseDto[] }) {
  const [filter, setFilter] = useState<ReleaseFilter>('all')
  const [scrollPct, setScrollPct] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const filtered = filterReleases(releases, filter)

  const syncScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollPct(max > 0 ? (el.scrollLeft / max) * 100 : 0)
  }, [])

  const scrollBy = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }

  if (releases.length === 0) return null

  return (
    <section id="explore-releases" className="explore-section explore-rel-section">
      <ExploreSectionHead
        index={3}
        kicker="Premieres"
        title="Releases"
        description="Albums and archive drops from artist studios."
        action={<ExploreSectionHeadAction label="All Releases" to="/releases" />}
        footer={
          <div className="explore-rel-head__controls">
            <div className="explore-rel-filters">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={cn('explore-rel-filter', filter === value && 'is-active')}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="explore-rel-nav">
              <div className="explore-rel-scroll-track explore-rel-scroll-track--compact" aria-hidden>
                <span className="explore-rel-scroll-thumb" style={{ left: `${scrollPct * 0.62}%` }} />
              </div>
              <button type="button" className="explore-rel-nav__btn" aria-label="Scroll releases left" onClick={() => scrollBy(-1)}>
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button type="button" className="explore-rel-nav__btn" aria-label="Scroll releases right" onClick={() => scrollBy(1)}>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        }
      />

      <div ref={trackRef} className="explore-rel-track" onScroll={syncScroll}>
        {filtered.map((release, i) => (
          <ExploreReleaseCard key={release.id} release={release} index={i} />
        ))}
      </div>
    </section>
  )
}
