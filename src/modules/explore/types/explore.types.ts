import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export type ExploreFilter = 'all' | 'top' | 'new' | 'vibe'

export type ArticleType = 'review' | 'single' | 'ep' | 'feature' | 'band_profile'

export interface ArticleDto {
  id: string
  editorId?: string
  title: string
  slug: string
  type?: ArticleType
  excerpt?: string
  bodyHtml: string
  puckData?: Record<string, unknown>
  coverUrl?: string
  galleryUrls?: string[]
  status: string
  isCoverStory: boolean
  publishedAt?: string
  updatedAt?: string
}

export interface ArtistProfileDto {
  id: string
  userId: string
  slug: string
  displayName: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  genres: string[]
  labelName?: string
}

export interface LabelProfileDto {
  id: string
  userId: string
  slug: string
  displayName: string
  bio?: string
  logoUrl?: string
  coverUrl?: string
  genres: string[]
  featuredReleaseIds?: string[]
  foundedYear?: number
  founderName?: string
  basedIn?: string
}

export interface LabelOverviewLabelDto extends LabelProfileDto {
  foundedYear?: number
  founderName?: string
  basedIn?: string
}

export interface LabelOverviewStatsDto {
  releases: number
  artists: number
  streams: number
  countriesReach: number
}

export interface LabelOverviewDto {
  label: LabelOverviewLabelDto
  featuredReleases: ReleaseDto[]
  artists: ArtistProfileDto[]
  latestReleases: ReleaseDto[]
  latestNews: ArticleDto[]
  playlists: PlaylistDto[]
  stats: LabelOverviewStatsDto
}

export interface CuratorStatsDto {
  followers: number
  playlists: number
  artistsDiscovered: number
  playlistSpins: number
  featuredPicks: number
}

export interface CuratorScoreDto {
  taste: number
  discovery: number
  influence: number
  accuracy: number
}

export interface CuratorGenreSliceDto {
  genre: string
  percent: number
  color?: string
}

export interface CuratorFeaturedPlaylistDto extends PlaylistDto {
  followerCount?: number
  playCount?: number
}

export interface CuratorDiscoveryArtistDto {
  id: string
  artistName: string
  slug?: string
  coverUrl?: string
  subGenre?: string
  growthPercent: number
  firstFeaturedAt: string
  listenerCount: number
}

export interface CuratorRecentPickDto {
  id: string
  pickNumber: number
  artistName: string
  note: string
  coverUrl?: string
  publishedAt: string
  reviewSlug?: string
}

export interface CuratorEditorialArticleDto {
  id: string
  title: string
  slug: string
  publishedAt: string
  readTimeMin: number
}

export interface CuratorSupportedArtistDto {
  id: string
  displayName: string
  avatarUrl?: string
  monthlyListeners: number
  slug?: string
  userId?: string
  isVerified?: boolean
}

export interface CuratorReputationStatDto {
  key: string
  label: string
  value: number | string
}

export interface CuratorActivityItemDto {
  id: string
  type: 'playlist_add' | 'article' | 'review' | 'signal_pick' | 'follow'
  text: string
  date: string
}

export interface CuratorOverviewDto {
  stats: CuratorStatsDto
  scores: CuratorScoreDto
  tasteMap: CuratorGenreSliceDto[]
  genreTags: string[]
  featuredPlaylists: CuratorFeaturedPlaylistDto[]
  discoveryWall: CuratorDiscoveryArtistDto[]
  recentPicks: CuratorRecentPickDto[]
  editorialContributions: CuratorEditorialArticleDto[]
  topSupportedArtists: CuratorSupportedArtistDto[]
  communityReputation: CuratorReputationStatDto[]
  followersAlsoListen: CuratorSupportedArtistDto[]
  activityFeed: CuratorActivityItemDto[]
}

export type ReleaseType = 'single' | 'ep' | 'album'
export type ReleaseFilter = 'all' | 'album' | 'ep' | 'single' | 'archive'
export type ReleasesPageFilter = 'all' | 'album' | 'epsingles' | 'hot' | 'new' | 'undiscovered'

export interface ReleaseDto {
  id: string
  slug?: string
  artistProfileId?: string
  title: string
  coverUrl?: string
  artistName?: string
  labelName?: string
  streamUrl?: string
  type?: ReleaseType
  genre?: string
  playCount?: number
  releaseDate?: string
  isFeatured?: boolean
  durationSec?: number
  trackCount?: number
  parentReleaseId?: string
  primaryTrackId?: string
}

export interface ReleaseGenreDto {
  slug: string
  label: string
  count: number
  coverUrl?: string
}

export interface ReleaseFilterOptionDto {
  id: string
  label: string
  count: number
}

export interface ReleasesCatalogDto {
  featured: ReleaseDto | null
  rail: ReleaseDto[]
  upcoming: ReleaseDto[]
  genres: ReleaseGenreDto[]
  stats: {
    total: number
    singles: number
    albums: number
    eps: number
  }
  filters: ReleaseFilterOptionDto[]
}

export interface ReleasesPageDto {
  items: ReleaseDto[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface DiscographyTrackDto {
  id: string
  releaseId?: string
  artistProfileId?: string
  title: string
  coverUrl?: string
  artistName?: string
  streamUrl?: string
  playCount?: number
  durationSec?: number
  releaseDate?: string
  type?: ReleaseType
  genre?: string
}

export interface DiscographyDto {
  artist: ArtistProfileDto | null
  latestRelease: ReleaseDto | null
  popular: DiscographyTrackDto[]
  tracks: DiscographyTrackDto[]
  artistPick: ReleaseDto | null
  albumsAndEps: ReleaseDto[]
  singles: ReleaseDto[]
  musicVideos: MusicVideoDto[]
}

export interface MusicVideoDto {
  id: string
  artistProfileId: string
  title: string
  thumbnailUrl?: string
  videoUrl: string
  durationSec?: number
  viewCount?: number
  releaseDate?: string
}

export interface PlaylistTrack {
  title: string
  artistName: string
  durationSec?: number
  streamUrl?: string
  audioUrl?: string
}

export interface PlaylistDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  description?: string
  visibility?: 'public' | 'private'
  tracks: PlaylistTrack[]
}

export interface SceneHubDto {
  id: string
  city: string
  slug: string
  coverUrl?: string
  description?: string
  isPrimary: boolean
  sortOrder?: number
}

export interface EventDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  startsAt: string
  venue: string
  hubCity?: string
  description?: string
  ticketUrl?: string
}

export interface ListenerStatDto {
  id: string
  userId: string
  name: string
  avatarUrl?: string
  dbScore: number
  totalPlays: number
  rank?: number
}

export interface EditorialPickDto {
  id: string
  title: string
  genre: string
  coverUrl?: string
  slug?: string
  kind?: 'article' | 'release'
  releaseId?: string
  action?: 'play' | 'view_release' | 'view_profile'
  articleType?: ArticleType
  releaseType?: ReleaseType
  streamUrl?: string
  artistName?: string
}

export interface EditorialReadingListDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  articleCount: number
  leadArticleSlug?: string
}

export interface EditorsNoteDto {
  quote: string
  signature: string
  authorName: string
}

export interface EditorialPublicationDto extends ArticleDto {
  editorId: string
  editorName: string
}

export interface EditorialDeskDto {
  editor: { name: string; avatarUrl?: string }
  featuredStory: ArticleDto | null
  editorsNote: EditorsNoteDto
  popular: ArticleDto[]
  picks: EditorialPickDto[]
  pickCandidates: EditorialPickDto[]
  interviews: ArticleDto[]
  readingLists: EditorialReadingListDto[]
  latest: EditorialPublicationDto[]
}

export interface ExplorePayload {
  editorial: { coverStory: ArticleDto | null; sidebar: ArticleDto[] }
  artists: ArtistProfileDto[]
  releases: ReleaseDto[]
  labels: LabelProfileDto[]
  playlists: { featured: PlaylistDto | null; items: PlaylistDto[] }
  sceneHubs: SceneHubDto[]
  events: EventDto[]
  listeners: {
    topListener: ListenerStatDto | null
    cards: ListenerStatDto[]
    totalListeners: number
    totalPlays: number
  }
  community: {
    topics: Array<{ id: string; label: string; count: number }>
    latestActivity: Array<{ id: string; title: string; authorName: string; createdAt: string }>
    topContributors: Array<{ id: string; name: string; avatarUrl?: string; score: number }>
  }
}

export interface TrackSubmissionDto {
  id: string
  artistId?: string
  artistName?: string
  artistEmail?: string
  projectName: string
  genre: string
  trackTitle: string
  description: string
  streamUrl: string
  coverUrl?: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  editorNotes?: string
  reviewedById?: string
  reviewedByName?: string
  reviewedAt?: string
  createdAt: string
  updatedAt?: string
}

export interface WirePickItem {
  feedItemId?: string
  articleId?: string
  releaseId?: string
  sortOrder: number
  label?: string
}

export interface WireCandidates {
  feedItems: FeedItemDto[]
  releases: Array<{
    id: string
    title: string
    artistName?: string
    coverUrl?: string
    streamUrl?: string
    type?: ReleaseType
    genre?: string
    playCount?: number
    releaseDate?: string
    isFeatured?: boolean
  }>
}
