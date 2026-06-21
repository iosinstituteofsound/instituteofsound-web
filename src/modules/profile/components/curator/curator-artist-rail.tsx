import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CuratorSupportedArtistDto } from '@/modules/explore/types/explore.types'
import { artistInitials } from '@/modules/explore/lib/artist-meta'
import { curatorCompactCount } from '@/modules/profile/lib/curator-format'
import '@/modules/profile/styles/label-overview-artists-device.css'

type CuratorArtistRailProps = {
  title: string
  id: string
  artists: CuratorSupportedArtistDto[]
  viewAllHref?: string
  showListeners?: boolean
  kicker?: string
  moduleId?: string
  telemetryTag?: string
}

function ArtistPod({
  artist,
  index,
  showListeners,
}: {
  artist: CuratorSupportedArtistDto
  index: number
  showListeners: boolean
}) {
  const href = artist.userId ? `/profile/${artist.userId}` : '/discover#explore-artists'
  const meta = showListeners
    ? `${curatorCompactCount(artist.monthlyListeners)} monthly listeners`
    : null

  return (
    <Link
      to={href}
      className="lbl-ov-roster__pod"
      aria-label={meta ? `${artist.displayName} — ${meta}` : artist.displayName}
      style={{ '--lbl-ov-roster-pod-delay': `${index * 70}ms` } as React.CSSProperties}
    >
      <span className="lbl-ov-roster__pod-idx" aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="lbl-ov-roster__orb">
        <span className="lbl-ov-roster__orb-ring lbl-ov-roster__orb-ring--outer" aria-hidden />
        <span className="lbl-ov-roster__orb-ring lbl-ov-roster__orb-ring--mid" aria-hidden />
        <span className="lbl-ov-roster__orb-ring lbl-ov-roster__orb-ring--inner" aria-hidden />
        <span className="lbl-ov-roster__orb-wave lbl-ov-roster__orb-wave--a" aria-hidden />
        <span className="lbl-ov-roster__orb-wave lbl-ov-roster__orb-wave--b" aria-hidden />
        <span className="lbl-ov-roster__orb-scan" aria-hidden />

        <span className="lbl-ov-roster__orb-lens">
          {artist.avatarUrl ? (
            <img src={artist.avatarUrl} alt="" loading="lazy" className="lbl-ov-roster__orb-img" />
          ) : (
            <span className="lbl-ov-roster__orb-fallback" aria-hidden>
              {artistInitials(artist.displayName)}
            </span>
          )}
        </span>

        <span className="lbl-ov-roster__orb-bracket lbl-ov-roster__orb-bracket--tl" aria-hidden />
        <span className="lbl-ov-roster__orb-bracket lbl-ov-roster__orb-bracket--tr" aria-hidden />
        <span className="lbl-ov-roster__orb-bracket lbl-ov-roster__orb-bracket--bl" aria-hidden />
        <span className="lbl-ov-roster__orb-bracket lbl-ov-roster__orb-bracket--br" aria-hidden />
      </div>

      <div className="lbl-ov-roster__pod-copy">
        <p className="lbl-ov-roster__pod-name">{artist.displayName}</p>
        {meta ? <p className="lbl-ov-roster__pod-genre">{meta}</p> : null}
      </div>
    </Link>
  )
}

export function CuratorArtistRail({
  title,
  id,
  artists,
  viewAllHref = '/discover#explore-artists',
  showListeners = true,
  kicker = ':: Support relay',
  moduleId = 'SA-01',
  telemetryTag = 'SIG::SUPPORT::ARRAY',
}: CuratorArtistRailProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollPct, setScrollPct] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const syncScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollPct(max > 0 ? (el.scrollLeft / max) * 100 : 0)
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    syncScroll()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', syncScroll, { passive: true })
    const observer = new ResizeObserver(syncScroll)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', syncScroll)
      observer.disconnect()
    }
  }, [artists.length, syncScroll])

  const scrollBy = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  if (artists.length === 0) return null

  return (
    <section
      className="lbl-ov-roster"
      aria-labelledby={id}
      style={{ '--lbl-ov-roster-scroll': scrollPct } as React.CSSProperties}
    >
      <header className="lbl-ov-roster__head">
        <div className="lbl-ov-roster__head-left">
          <span className="lbl-ov-roster__module-id" aria-hidden>
            {moduleId}
          </span>
          <div>
            <p className="lbl-ov-roster__kicker">{kicker}</p>
            <h2 id={id} className="lbl-ov-roster__title">
              {title}
            </h2>
          </div>
        </div>

        <Link to={viewAllHref} className="lbl-ov-roster__view-all">
          View All Artists
          <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
        </Link>
      </header>

      <div className="lbl-ov-roster__console">
        <button
          type="button"
          className="lbl-ov-roster__nav lbl-ov-roster__nav--prev"
          aria-label="Previous artists"
          disabled={!canPrev}
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeft size={18} strokeWidth={2.25} aria-hidden />
        </button>

        <div ref={trackRef} className="lbl-ov-roster__track" role="list">
          {artists.map((artist, index) => (
            <div key={artist.id} role="listitem">
              <ArtistPod artist={artist} index={index} showListeners={showListeners} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="lbl-ov-roster__nav lbl-ov-roster__nav--next"
          aria-label="Next artists"
          disabled={!canNext}
          onClick={() => scrollBy(1)}
        >
          <ChevronRight size={18} strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      <div className="lbl-ov-roster__telemetry">
        <span className="lbl-ov-roster__telemetry-tag">{telemetryTag}</span>
        <div className="lbl-ov-roster__progress" aria-hidden>
          <span className="lbl-ov-roster__progress-track">
            <span className="lbl-ov-roster__progress-thumb" />
          </span>
        </div>
        <span className="lbl-ov-roster__telemetry-count">
          {String(artists.length).padStart(2, '0')} NODES
        </span>
      </div>
    </section>
  )
}
