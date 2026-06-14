import { useEffect, useState } from 'react'
import { GatedLink } from '@/components/auth/GatedLink'
import { IOSImage } from '@/components/ui/IOSImage'
import { networkProfilePath } from '@/lib/community/networkPaths'
import {
  labelNetworkStats,
  listDiscoverLabels,
  type DiscoverLabel,
} from '@/lib/discovery/labels'
import '@/styles/labels-imprints.css'

function LabelCard({ label }: { label: DiscoverLabel }) {
  const href = label.profileUserId
    ? networkProfilePath(label.slug)
    : `/labels#${label.slug}`

  return (
    <GatedLink
      to={href}
      forceGate
      gateHint="Label profiles unlock when your imprint is verified on IOS."
      className="lbl-card"
      aria-label={label.name}
    >
      <div className="lbl-card__hero">
        {label.imageUrl ? (
          <IOSImage
            src={label.imageUrl}
            alt=""
            width={640}
            sizes="(max-width: 1100px) 50vw, 25vw"
            className="lbl-card__hero-img"
          />
        ) : null}
        {label.demo && (
          <span className="lbl-card__preview">
            <EyeIcon />
            Preview
          </span>
        )}
      </div>
      <div className="lbl-card__body">
        <div className="lbl-card__identity">
          <span className="lbl-card__mark" aria-hidden>
            {label.initials}
          </span>
          <div className="min-w-0">
            <p className="lbl-card__name">{label.name}</p>
            <p className="lbl-card__tagline">{label.tagline}</p>
          </div>
        </div>
        <div className="lbl-card__stats">
          <span className="lbl-card__stat">
            <PeopleIcon />
            {label.rosterCount} artists
          </span>
          <span className="lbl-card__stat">
            <WaveIcon />
            {label.releaseCount} releases
          </span>
          <span className="lbl-card__stat">
            <PinIcon />
            {label.city}
          </span>
        </div>
        <span className="lbl-card__cta">
          View label
          <span className="lbl-card__cta-icon" aria-hidden>
            →
          </span>
        </span>
      </div>
    </GatedLink>
  )
}

function LabelStatsBar({ labels }: { labels: DiscoverLabel[] }) {
  const stats = labelNetworkStats(labels)
  return (
    <div className="lbl__stats-bar" aria-label="Label network statistics">
      <div className="lbl__stats-cell">
        <RibbonIcon className="lbl__stats-icon" />
        <span className="lbl__stats-val">{stats.verifiedLabels}</span>
        <span className="lbl__stats-label">Verified labels</span>
      </div>
      <div className="lbl__stats-cell">
        <PeopleIcon className="lbl__stats-icon" />
        <span className="lbl__stats-val">{stats.artists}</span>
        <span className="lbl__stats-label">Artists</span>
      </div>
      <div className="lbl__stats-cell">
        <WaveIcon className="lbl__stats-icon" />
        <span className="lbl__stats-val">{stats.releases}</span>
        <span className="lbl__stats-label">Releases</span>
      </div>
      <div className="lbl__stats-cell">
        <GlobeIcon className="lbl__stats-icon" />
        <span className="lbl__stats-val">{stats.cities}</span>
        <span className="lbl__stats-label">Cities</span>
      </div>
      <div className="lbl__stats-cell">
        <ShieldIcon className="lbl__stats-icon" />
        <span className="lbl__stats-val" style={{ fontSize: '0.95rem' }}>
          IOS
        </span>
        <span className="lbl__stats-label">Verified by IOS desk</span>
      </div>
    </div>
  )
}

export function DiscoverLabelsSection() {
  const [labels, setLabels] = useState<DiscoverLabel[]>([])

  useEffect(() => {
    void listDiscoverLabels().then(setLabels)
  }, [])

  return (
    <section id="discover-labels" className="lbl-sec scroll-mt-24">
      <header className="lbl-sec__head">
        <div className="lbl-sec__brand">
          <span className="lbl-sec__idx" aria-hidden>
            04
          </span>
          <div>
            <p className="lbl-sec__tag">Imprints</p>
            <h2 className="lbl-sec__title">Labels</h2>
            <p className="lbl-sec__sub">Verified label sign-ups list here automatically.</p>
          </div>
        </div>
        <GatedLink to="/labels" forceGate className="lbl__browse-btn">
          Browse all labels
          <span className="lbl__browse-btn-icon" aria-hidden>
            →
          </span>
        </GatedLink>
      </header>

      <div className="lbl__grid">
        {labels.map((label) => (
          <LabelCard key={label.id} label={label} />
        ))}
      </div>

      {labels.length > 0 && <LabelStatsBar labels={labels} />}
    </section>
  )
}

function EyeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <ellipse cx="5" cy="5" rx="4" ry="2.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="5" cy="5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className={className} aria-hidden>
      <circle cx="3.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M1 9c0-1.5 1.1-2.5 2.5-2.5S6 7.5 6 9" stroke="currentColor" strokeWidth="1" />
      <circle cx="7.5" cy="3.8" r="1.2" stroke="currentColor" strokeWidth="1" />
      <path d="M6 9c0-1.2.8-2 1.8-2" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className={className} aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <rect
          key={i}
          x={1 + i * 2.5}
          y={4 - (i % 2)}
          width="1.5"
          height={3 + (i % 2) * 2}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path
        d="M5.5 1c-1.5 0-2.5 1.2-2.5 2.5 0 1.8 2.5 4.5 2.5 4.5s2.5-2.7 2.5-4.5C8 2.2 7 1 5.5 1z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="5.5" cy="3.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

function RibbonIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1" />
      <path d="M5 8.5 4 13l3-1.5L10 13l-1-4.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M1.5 7h11M7 1.5c1.5 2 1.5 9 0 11M7 1.5c-1.5 2-1.5 9 0 11" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path
        d="M7 1.5 11 3.5v3.5c0 2.5-1.8 4.2-4 5-2.2-.8-4-2.5-4-5V3.5L7 1.5z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}
