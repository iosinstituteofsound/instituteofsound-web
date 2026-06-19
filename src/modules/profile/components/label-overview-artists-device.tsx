import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ArtistProfileDto } from '@/modules/explore/types/explore.types'
import { artistGenreLabel, artistInitials } from '@/modules/explore/lib/artist-meta'
import '@/modules/profile/styles/label-overview-artists-device.css'

type LabelOverviewArtistsDeviceProps = {
  artists: ArtistProfileDto[]
  viewAllHref?: string
}

function ArtistPod({ artist, index }: { artist: ArtistProfileDto; index: number }) {
  const imageUrl = artist.avatarUrl ?? artist.coverUrl
  const isDemo = artist.id.startsWith('demo-')
  const profileHref = isDemo ? '/discover#explore-artists' : `/profile/${artist.userId}`

  return (
    <Link
      to={profileHref}
      className="lbl-ov-roster__pod"
      aria-label={`${artist.displayName} — ${artistGenreLabel(artist)}`}
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
          {imageUrl ? (
            <img src={imageUrl} alt="" loading="lazy" className="lbl-ov-roster__orb-img" />
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
        <p className="lbl-ov-roster__pod-genre">{artistGenreLabel(artist)}</p>
      </div>
    </Link>
  )
}

export function LabelOverviewArtistsDevice({ artists, viewAllHref = '/discover#explore-artists' }: LabelOverviewArtistsDeviceProps) {
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
      aria-labelledby="lbl-ov-roster-heading"
      style={{ '--lbl-ov-roster-scroll': scrollPct } as React.CSSProperties}
    >
      <header className="lbl-ov-roster__head">
        <div className="lbl-ov-roster__head-left">
          <span className="lbl-ov-roster__module-id" aria-hidden>
            RS-01
          </span>
          <div>
            <p className="lbl-ov-roster__kicker">:: Roster relay</p>
            <h2 id="lbl-ov-roster-heading" className="lbl-ov-roster__title">
              Our Artists
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
              <ArtistPod artist={artist} index={index} />
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
        <span className="lbl-ov-roster__telemetry-tag">SIG::ROSTER::ARRAY</span>
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
