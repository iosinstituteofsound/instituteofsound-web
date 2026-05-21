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
  getCommunity,
  getRanks,
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
  const community = useContent(useCallback(() => getCommunity(), []))
  const ranks = useContent(useCallback(() => getRanks(), []))

  const loading =
    cover.loading ||
    trending.loading ||
    artists.loading ||
    reviews.loading ||
    albums.loading ||
    features.loading ||
    playlists.loading ||
    signals.loading ||
    community.loading ||
    ranks.loading

  if (loading) return <LoadingTransmission />

  if (
    !cover.data ||
    !trending.data ||
    !artists.data ||
    !reviews.data ||
    !albums.data ||
    !features.data ||
    !playlists.data ||
    !signals.data ||
    !community.data ||
    !ranks.data
  ) {
    return (
      <div className="section-padding text-center text-rs-red">
        Failed to load magazine feed.
      </div>
    )
  }

  return (
    <>
      {/* Rolling Stone layer */}
      <CoverHeroSection story={cover.data} />
      <TrendingRail items={trending.data} />

      {/* Metal Hammer layer — band-first */}
      <BandSpotlightSection artists={artists.data} />
      <ReviewsBlock reviews={reviews.data} />
      <AlbumArtRow albums={albums.data} />

      {/* Rolling Stone editorial grid */}
      <EditorialMagazineGrid features={features.data} />

      {/* Supporting sections */}
      <PlaylistSection playlists={playlists.data} />
      <SignalsSection signals={signals.data} limit={4} />
      <CommunitySection members={community.data} ranks={ranks.data} />
      <SubmissionSection />
    </>
  )
}
