import { Link } from 'react-router-dom'
import type { Feature } from '@/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EditorialCard } from '@/components/cards/EditorialCard'

interface FeaturesSectionProps {
  features: Feature[]
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  const [lead, ...rest] = features

  return (
    <section className="section-padding border-t border-border">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Transmission 005"
          title="Long Form"
          subtitle="Luxury editorials. Deep culture. Music philosophy and scene analysis."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {lead && <EditorialCard feature={lead} featured />}
          {rest.slice(0, 3).map((feature) => (
            <EditorialCard key={feature.id} feature={feature} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/features"
            className="text-xs tracking-[0.2em] uppercase text-muted hover:text-neon transition-colors"
          >
            Read All Features →
          </Link>
        </div>
      </div>
    </section>
  )
}
