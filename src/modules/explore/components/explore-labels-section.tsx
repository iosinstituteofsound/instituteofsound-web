import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Eye,
  Globe2,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { LabelProfileDto } from '@/modules/explore/types/explore.types'
import {
  labelArtistCount,
  labelCity,
  labelGenreLine,
  labelInitials,
  labelNetworkStats,
  labelReleaseCount,
} from '@/modules/explore/lib/label-meta'
import {
  ExploreSectionHead,
  ExploreSectionHeadAction,
} from '@/modules/explore/components/explore-section-head'
import { ExploreStatsBar } from '@/modules/explore/components/explore-stats-bar'

interface ExploreLabelsSectionProps {
  labels: LabelProfileDto[]
  artistCount?: number
  releaseCount?: number
}

function LabelCard({ label, index }: { label: LabelProfileDto; index: number }) {
  const artists = labelArtistCount(label)
  const releases = labelReleaseCount(label)
  const city = labelCity(label)
  const cover = label.coverUrl ?? label.logoUrl ?? `https://picsum.photos/seed/${label.slug}/640/760`

  return (
    <Link
      to={`/profile/${label.userId}`}
      className="explore-lbl-card explore-lbl-glass"
      style={{ '--explore-lbl-card-delay': `${70 + index * 50}ms` } as React.CSSProperties}
      aria-label={`View ${label.displayName}`}
    >
      <div className="explore-lbl-card__media">
        <img src={cover} alt="" loading="lazy" className="explore-lbl-card__img" />
        <div className="explore-lbl-card__scrim" aria-hidden />
        <span className="explore-lbl-card__preview">
          <Eye size={12} strokeWidth={2.25} aria-hidden />
          Preview
        </span>
        <div className="explore-lbl-card__overlay">
          <div className="explore-lbl-card__mark" aria-hidden>
            {label.logoUrl ? (
              <img src={label.logoUrl} alt="" className="explore-lbl-card__mark-img" />
            ) : (
              labelInitials(label.displayName)
            )}
          </div>
          <div className="min-w-0">
            <h3 className="explore-lbl-card__name">{label.displayName}</h3>
            <p className="explore-lbl-card__tag">{labelGenreLine(label)}</p>
          </div>
        </div>
      </div>

      <div className="explore-lbl-card__stats">
        <span className="explore-lbl-card__stat">
          <Users size={13} strokeWidth={2} aria-hidden />
          {artists} Artists
        </span>
        <span className="explore-lbl-card__stat">
          <Disc3 size={13} strokeWidth={2} aria-hidden />
          {releases} Releases
        </span>
        <span className="explore-lbl-card__stat">
          <MapPin size={13} strokeWidth={2} aria-hidden />
          {city}
        </span>
      </div>

      <span className="explore-lbl-card__cta">
        View Label
        <ArrowUpRight size={14} strokeWidth={2.25} aria-hidden />
      </span>
    </Link>
  )
}

export function ExploreLabelsSection({
  labels,
  artistCount = 0,
  releaseCount = 0,
}: ExploreLabelsSectionProps) {
  const [scrollPct, setScrollPct] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const stats = labelNetworkStats(labels, artistCount, releaseCount)

  const syncScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollPct(max > 0 ? (el.scrollLeft / max) * 100 : 0)
  }, [setScrollPct])

  const scrollBy = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' })
  }

  if (labels.length === 0) return null

  return (
    <section id="explore-labels" className="explore-section explore-lbl-section">
      <ExploreSectionHead
        index={4}
        kicker="Imprints"
        title="Labels"
        description="Verified label sign-ups list here automatically."
        action={<ExploreSectionHeadAction label="Browse All Labels" href="#explore-labels" />}
        footer={
          <div className="explore-lbl-head__controls">
            <div className="explore-lbl-nav">
              <div className="explore-lbl-scroll-track explore-lbl-scroll-track--compact" aria-hidden>
                <span className="explore-lbl-scroll-thumb" style={{ left: `${scrollPct * 0.62}%` }} />
              </div>
              <button
                type="button"
                className="explore-lbl-nav__btn"
                aria-label="Scroll labels left"
                onClick={() => scrollBy(-1)}
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="explore-lbl-nav__btn"
                aria-label="Scroll labels right"
                onClick={() => scrollBy(1)}
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        }
      />

      <div ref={trackRef} className="explore-lbl-track" onScroll={syncScroll}>
        {labels.map((label, i) => (
          <LabelCard key={label.id} label={label} index={i} />
        ))}
      </div>

      <ExploreStatsBar
        aria-label="Label network statistics"
        items={[
          {
            icon: <Award size={16} strokeWidth={2} aria-hidden />,
            value: stats.verifiedLabels,
            label: 'Verified Labels',
          },
          {
            icon: <Users size={16} strokeWidth={2} aria-hidden />,
            value: stats.artists,
            label: 'Artists',
          },
          {
            icon: <Disc3 size={16} strokeWidth={2} aria-hidden />,
            value: stats.releases,
            label: 'Releases',
          },
          {
            icon: <Globe2 size={16} strokeWidth={2} aria-hidden />,
            value: stats.cities,
            label: 'Cities',
          },
          {
            icon: <ShieldCheck size={16} strokeWidth={2} aria-hidden />,
            value: 'IOS',
            label: 'Verified by IOS Desk',
            accent: true,
          },
        ]}
      />
    </section>
  )
}
