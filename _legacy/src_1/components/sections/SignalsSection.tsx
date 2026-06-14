import { Link } from 'react-router-dom'
import type { Signal } from '@/types'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { SignalCard } from '@/components/cards/SignalCard'

interface SignalsSectionProps {
  signals: Signal[]
  limit?: number
}

export function SignalsSection({ signals, limit = 6 }: SignalsSectionProps) {
  return (
    <section className="section-padding border-t border-border">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          kicker="News Desk"
          title="Latest Signals"
          subtitle="Scene reports, releases, and culture drops from the underground wire."
        />
        <AnimatedGrid columns={3}>
          {signals.slice(0, limit).map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </AnimatedGrid>
        <div className="mt-12 text-center">
          <Link
            to="/signals"
            className="text-xs tracking-[0.2em] uppercase text-muted hover:text-rs-red transition-colors"
          >
            All Signals →
          </Link>
        </div>
      </div>
    </section>
  )
}
