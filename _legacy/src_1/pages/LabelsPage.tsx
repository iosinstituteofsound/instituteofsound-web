import { useEffect, useState } from 'react'
import { GatedLink } from '@/components/auth/GatedLink'
import { IOSImage } from '@/components/ui/IOSImage'
import { useSeo } from '@/hooks/useSeo'
import { listDiscoverLabels, type DiscoverLabel } from '@/lib/discovery/labels'
import '@/styles/labels-imprints.css'

export default function LabelsPage() {
  const [labels, setLabels] = useState<DiscoverLabel[]>([])

  useSeo({
    title: 'Labels',
    description:
      'Verified underground imprints on Institute of Sound — browse label rosters, releases, and cities.',
    canonicalPath: '/labels',
  })

  useEffect(() => {
    void listDiscoverLabels().then(setLabels)
  }, [])

  return (
    <div className="discover-wire mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 lg:py-8">
      <header className="lbl-sec__head mb-8">
        <div className="lbl-sec__brand">
          <span className="lbl-sec__idx" aria-hidden>
            04
          </span>
          <div>
            <p className="lbl-sec__tag">Imprints</p>
            <h1 className="lbl-sec__title">All labels</h1>
            <p className="lbl-sec__sub">
              Verified label sign-ups list here automatically after IOS desk review.
            </p>
          </div>
        </div>
        <GatedLink to="/discover#discover-labels" className="lbl__browse-btn">
          Back to explore
          <span className="lbl__browse-btn-icon" aria-hidden>
            →
          </span>
        </GatedLink>
      </header>

      <div className="lbl-page__grid">
        {labels.map((label) => (
          <GatedLink
            key={label.id}
            id={label.slug}
            to={`/labels#${label.slug}`}
            forceGate
            className="lbl-card"
          >
            <div className="lbl-card__hero">
              {label.imageUrl && (
                <IOSImage src={label.imageUrl} alt="" width={640} className="lbl-card__hero-img" />
              )}
              {label.demo && (
                <span className="lbl-card__preview">Preview</span>
              )}
            </div>
            <div className="lbl-card__body">
              <div className="lbl-card__identity">
                <span className="lbl-card__mark">{label.initials}</span>
                <div>
                  <p className="lbl-card__name">{label.name}</p>
                  <p className="lbl-card__tagline">{label.tagline}</p>
                </div>
              </div>
              <span className="lbl-card__cta">
                View label
                <span className="lbl-card__cta-icon" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </GatedLink>
        ))}
      </div>
    </div>
  )
}
