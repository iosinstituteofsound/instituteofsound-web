import { useCallback } from 'react'
import { useContent } from '@/hooks/useContent'
import { getSignals } from '@/api/endpoints'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { SignalCard } from '@/components/cards/SignalCard'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function SignalsPage() {
  const { data, loading, error } = useContent(useCallback(() => getSignals(), []))

  return (
    <div className="section-padding pt-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Encrypted Feed"
          title="Signals"
          subtitle="Underground discoveries. Releases. Culture drops. Not a news blog."
          titleAs="h1"
        />
        {loading && <LoadingTransmission variant="compact" />}
        {error && <p className="text-crimson">{error}</p>}
        {data && (
          <AnimatedGrid columns={2}>
            {data.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </AnimatedGrid>
        )}
      </div>
    </div>
  )
}
