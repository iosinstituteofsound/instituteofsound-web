import { useExplore } from '@/modules/explore/hooks/use-explore'
import { ExploreSectionDivider } from '@/modules/explore/components/explore-section-divider'
import { Loader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'
import { usePlatformStats } from '@/modules/public/hooks/use-platform-stats'
import { LandingHero } from '@/modules/public/components/landing-hero'
import { LandingStatsBar } from '@/modules/public/components/landing-stats-bar'
import { LandingTrendingReleases } from '@/modules/public/components/landing-trending-releases'
import { LandingEditorialSpotlight } from '@/modules/public/components/landing-editorial-spotlight'
import { LandingCultureRail } from '@/modules/public/components/landing-culture-rail'
import { LandingSocialProof } from '@/modules/public/components/landing-social-proof'
import { LandingJoinSection } from '@/modules/public/components/landing-join-section'
import { LandingFinalCta } from '@/modules/public/components/landing-final-cta'
import '@/modules/explore/styles/explore.css'
import '@/modules/public/styles/landing.css'

export function HomePage() {
  const { data, isLoading, isError, refetch } = useExplore()
  const { data: stats, isLoading: statsLoading } = usePlatformStats()

  if (isLoading) {
    return <Loader className="min-h-screen bg-background" />
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-muted-foreground">Could not load the landing page. Check API connection.</p>
        <Button type="button" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="landing-page">
      <LandingHero coverStory={data.editorial.coverStory} />
      <LandingStatsBar stats={stats} isLoading={statsLoading} />

      <ExploreSectionDivider variant="gateway" />
      <LandingTrendingReleases releases={data.releases} />

      <ExploreSectionDivider variant="saturn" />
      <LandingEditorialSpotlight
        coverStory={data.editorial.coverStory}
        sidebar={data.editorial.sidebar}
      />

      <ExploreSectionDivider variant="lunar" />
      <LandingCultureRail
        featured={data.playlists.featured}
        playlists={data.playlists.items}
        artists={data.artists}
      />

      <ExploreSectionDivider variant="eclipse" />
      <LandingSocialProof listeners={data.listeners} community={data.community} />

      <ExploreSectionDivider variant="nexus" />
      <LandingJoinSection />
      <LandingFinalCta />
    </div>
  )
}
