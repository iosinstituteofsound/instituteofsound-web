import { useCallback, useMemo } from 'react'
import {
  getAlbumReleases,
  getCoverStory,
  getFeatures,
  getPlaylists,
  getReviews,
  getSignals,
} from '@/api/endpoints'
import { RightRail } from '@/components/layout/RightRail'
import {
  BrowseByVibes,
  EditorsPicks,
  HomeError,
  HomeFooterStrip,
  HomeHero,
  LatestReleases,
  LoadingHome,
  MovementInNumbers,
  RecommendedRow,
  buildEditorSideItems,
  buildRecommendedCards,
} from '@/components/home/HomeSections'
import { useContent } from '@/hooks/useContent'

export default function HomePage() {
  const cover = useContent(useCallback(() => getCoverStory(), []))
  const features = useContent(useCallback(() => getFeatures(), []))
  const reviews = useContent(useCallback(() => getReviews(), []))
  const releases = useContent(useCallback(() => getAlbumReleases(), []))
  const playlists = useContent(useCallback(() => getPlaylists(), []))
  const signals = useContent(useCallback(() => getSignals(), []))

  const loading =
    cover.loading ||
    features.loading ||
    reviews.loading ||
    releases.loading

  const recommended = useMemo(() => {
    if (!features.data || !reviews.data || !playlists.data || !signals.data) return []
    return buildRecommendedCards(features.data, reviews.data, playlists.data, signals.data)
  }, [features.data, reviews.data, playlists.data, signals.data])

  const editorSide = useMemo(() => {
    if (!features.data || !reviews.data || !signals.data) return []
    return buildEditorSideItems(features.data, reviews.data, signals.data)
  }, [features.data, reviews.data, signals.data])

  if (loading && !cover.data && !cover.error) return <LoadingHome />
  if (cover.error && !cover.data) return <HomeError />
  if (
    !loading &&
    (!cover.data || !features.data?.length || !releases.data)
  ) {
    return <HomeError />
  }
  if (!cover.data || !features.data?.length || !releases.data) return <LoadingHome />

  const leadFeature =
    features.data.find((f) => f.slug === 'underground-movements') ?? features.data[0]

  return (
    <div className="v2-home-layout">
      <div className="v2-home-main space-y-8 sm:space-y-10 lg:space-y-12">
        <HomeHero cover={cover.data} />
        {recommended.length > 0 && <RecommendedRow cards={recommended} />}
        {editorSide.length > 0 && (
          <EditorsPicks lead={leadFeature} items={editorSide} />
        )}
        <LatestReleases releases={releases.data} />
        <BrowseByVibes />
        <MovementInNumbers />
        <HomeFooterStrip />
      </div>
      <RightRail signals={signals.data ?? []} />
    </div>
  )
}
