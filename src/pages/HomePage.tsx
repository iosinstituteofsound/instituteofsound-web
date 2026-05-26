import { useCallback } from 'react'
import { useContent } from '@/hooks/useContent'
import {
  getCoverStory,
  getTrending,
  getArtists,
  getReviews,
  getAlbumReleases,
  getFeatures,
  getPlaylists,
  getSignals,
} from '@/api/endpoints'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { CoverHeroSection } from '@/components/sections/magazine/CoverHeroSection'
import { TrendingRail } from '@/components/sections/magazine/TrendingRail'
import { BandSpotlightSection } from '@/components/sections/magazine/BandSpotlightSection'
import { ReviewsBlock } from '@/components/sections/magazine/ReviewsBlock'
import { AlbumArtRow } from '@/components/sections/magazine/AlbumArtRow'
import { EditorialMagazineGrid } from '@/components/sections/magazine/EditorialMagazineGrid'
import { PlaylistSection } from '@/components/sections/PlaylistSection'
import { SignalsSection } from '@/components/sections/SignalsSection'
import { CommunitySection } from '@/components/sections/CommunitySection'
import { SubmissionSection } from '@/components/sections/SubmissionSection'

export default function HomePage() {
  const cover = useContent(useCallback(() => getCoverStory(), []))
  const trending = useContent(useCallback(() => getTrending(), []))
  const artists = useContent(useCallback(() => getArtists(), []))
  const reviews = useContent(useCallback(() => getReviews(), []))
  const albums = useContent(useCallback(() => getAlbumReleases(), []))
  const features = useContent(useCallback(() => getFeatures(), []))
  const playlists = useContent(useCallback(() => getPlaylists(), []))
  const signals = useContent(useCallback(() => getSignals(), []))

  if (cover.loading && !cover.data) {
    return <LoadingTransmission variant="hell" />
  }

  if (cover.error && !cover.data) {
    return (
      <div className="section-padding text-center text-rs-red min-h-[50vh] flex items-center justify-center">
        Failed to load magazine feed.
      </div>
    )
  }

  return (
    <>
      {cover.data && <CoverHeroSection story={cover.data} />}

      {trending.data && <TrendingRail items={trending.data} />}
      {artists.data && <BandSpotlightSection artists={artists.data} />}
      {reviews.data && <ReviewsBlock reviews={reviews.data} />}
      {albums.data && <AlbumArtRow albums={albums.data} />}
      {features.data && <EditorialMagazineGrid features={features.data} />}
      {playlists.data && <PlaylistSection playlists={playlists.data} />}
      {signals.data && <SignalsSection signals={signals.data} limit={4} />}
      <CommunitySection />
      <SubmissionSection />
    </>
  )
}
