import { useCallback } from 'react'
import { useContent } from '@/hooks/useContent'
import { getFeatures } from '@/api/endpoints'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EditorialCard } from '@/components/cards/EditorialCard'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function FeaturesPage() {
  const { data, loading, error } = useContent(useCallback(() => getFeatures(), []))

  return (
    <div className="v2-page">
        <SectionHeading
          label="Long Form Editorial"
          title="Features"
          subtitle="Deep interviews. Music philosophy. Scene analysis. Alternative culture."
          titleAs="h1"
        />
        {loading && <LoadingTransmission variant="compact" />}
        {error && <p className="text-crimson">{error}</p>}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.map((feature, i) => (
              <EditorialCard key={feature.id} feature={feature} featured={i === 0} />
            ))}
          </div>
        )}
    </div>
  )
}
