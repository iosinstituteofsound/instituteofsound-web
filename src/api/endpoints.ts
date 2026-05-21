import { fetchApi } from './client'
import type {
  AlbumRelease,
  Artist,
  CommunityMember,
  CoverStory,
  Feature,
  FooterData,
  HeroData,
  NavLink,
  Playlist,
  RankInfo,
  Review,
  Signal,
  SubmissionField,
  TrendingItem,
} from '@/types'

export const getHero = () => fetchApi<HeroData>('/hero.json')
export const getCoverStory = () => fetchApi<CoverStory>('/cover-story.json')
export const getTrending = () => fetchApi<TrendingItem[]>('/trending.json')
export const getReviews = () => fetchApi<Review[]>('/reviews.json')
export const getAlbumReleases = () => fetchApi<AlbumRelease[]>('/album-releases.json')
export const getNav = () => fetchApi<NavLink[]>('/nav.json')
export const getArtists = () => fetchApi<Artist[]>('/artists.json')
export const getArtist = (slug: string) =>
  getArtists().then((artists) => {
    const artist = artists.find((a) => a.slug === slug)
    if (!artist) throw new Error('Artist not found')
    return artist
  })
export const getPlaylists = () => fetchApi<Playlist[]>('/playlists.json')
export const getPlaylist = (slug: string) =>
  getPlaylists().then((playlists) => {
    const playlist = playlists.find((p) => p.slug === slug)
    if (!playlist) throw new Error('Playlist not found')
    return playlist
  })
export const getSignals = () => fetchApi<Signal[]>('/signals.json')
export const getFeatures = () => fetchApi<Feature[]>('/features.json')
export const getFeature = (slug: string) =>
  getFeatures().then((features) => {
    const feature = features.find((f) => f.slug === slug)
    if (!feature) throw new Error('Feature not found')
    return feature
  })
export const getCommunity = () => fetchApi<CommunityMember[]>('/community.json')
export const getRanks = () => fetchApi<RankInfo[]>('/ranks.json')
export const getFooter = () => fetchApi<FooterData>('/footer.json')
export const getSubmissionFields = () =>
  fetchApi<SubmissionField[]>('/submission-fields.json')
