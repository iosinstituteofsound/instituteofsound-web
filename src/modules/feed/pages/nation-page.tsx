import { NationAllianceSection, NationStatsSection } from '@/modules/feed/components/nation/nation-alliance-section'
import {
  NationMagazineArticlesSection,
  NationRecentActivitySection,
  NationTopArtistsSection,
  NationTrendingNowSection,
} from '@/modules/feed/components/nation/nation-hub-sections'
import './nation-page.css'

export function NationPage() {
  return (
    <div className="nation-page">
      <NationStatsSection />
      <NationAllianceSection />
      <NationTopArtistsSection />
      <NationRecentActivitySection />
      <NationMagazineArticlesSection />
      <NationTrendingNowSection />
    </div>
  )
}
