import type {
  LabelOverviewDto,
  ReleaseDto,
  ArtistProfileDto,
  ArticleDto,
  PlaylistDto,
  LabelOverviewStatsDto,
} from '@/modules/explore/types/explore.types'
import type { UserDto } from '@/shared/types/auth.types'

const DEMO_RELEASES: ReleaseDto[] = [
  {
    id: 'demo-red-eclipse',
    artistProfileId: 'demo-signal-bloom',
    title: 'Red Eclipse',
    artistName: 'Signal Bloom',
    coverUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-05-28T00:00:00.000Z',
    type: 'ep',
    genre: 'Post Rock',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    playCount: 1280,
    isFeatured: true,
  },
  {
    id: 'demo-void-transit',
    artistProfileId: 'demo-static-void',
    title: 'Void Transit',
    artistName: 'Static Void',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-03-14T00:00:00.000Z',
    type: 'album',
    genre: 'Industrial',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    playCount: 940,
    isFeatured: true,
  },
  {
    id: 'demo-midnight-signal',
    artistProfileId: 'demo-aria-editor',
    title: 'Midnight Signal',
    artistName: 'Aria Editor',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    releaseDate: '2024-01-08T00:00:00.000Z',
    type: 'single',
    genre: 'Ambient',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    playCount: 620,
    isFeatured: false,
  },
]

const DEFAULT_LABEL_BIO =
  'Institute of Sound Records is an independent label founded by passionate music enthusiasts. We are dedicated to discovering and promoting emerging artists across diverse genres, from rock and post-rock to ambient and electronic.'

const DEMO_ARTISTS: ArtistProfileDto[] = [
  {
    id: 'demo-signal-bloom',
    userId: 'demo-user-signal-bloom',
    slug: 'signal-bloom',
    displayName: 'Signal Bloom',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&h=400&q=80',
    genres: ['Post Rock'],
  },
  {
    id: 'demo-anantram',
    userId: 'demo-user-anantram',
    slug: 'anantram',
    displayName: 'Anantram',
    avatarUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&h=400&q=80',
    genres: ['Alternative Rock'],
  },
  {
    id: 'demo-riha',
    userId: 'demo-user-riha',
    slug: 'riha',
    displayName: 'Riha',
    avatarUrl: 'https://images.unsplash.com/photo-1524368535928-1a18db27a965?auto=format&fit=crop&w=400&h=400&q=80',
    genres: ['Industrial Rock'],
  },
  {
    id: 'demo-tarse-naina',
    userId: 'demo-user-tarse-naina',
    slug: 'tarse-naina',
    displayName: 'Tarse Naina',
    avatarUrl: 'https://images.unsplash.com/photo-1501386761578-aeac8d43c288?auto=format&fit=crop&w=400&h=400&q=80',
    genres: ['Experimental'],
  },
  {
    id: 'demo-khwaab',
    userId: 'demo-user-khwaab',
    slug: 'khwaab',
    displayName: 'Khwaab',
    avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&h=400&q=80',
    genres: ['Ambient'],
  },
  {
    id: 'demo-static-void',
    userId: 'demo-user-static-void',
    slug: 'static-void',
    displayName: 'Static Void',
    avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=400&q=80',
    genres: ['Noise'],
  },
]

const DEMO_LATEST_RELEASES: ReleaseDto[] = [
  {
    id: 'demo-anantram-ep',
    artistProfileId: 'demo-anantram',
    title: 'Anantram',
    artistName: 'Anantram',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=760&q=80',
    releaseDate: '2024-06-12T00:00:00.000Z',
    type: 'ep',
    genre: 'Alternative Rock',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    playCount: 720,
  },
  {
    id: 'demo-cathedral-ep',
    artistProfileId: 'demo-anantram',
    title: 'Cathedral EP',
    artistName: 'Anantram',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&h=760&q=80',
    releaseDate: '2024-05-18T00:00:00.000Z',
    type: 'ep',
    genre: 'Post Rock',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    playCount: 540,
  },
  {
    id: 'demo-iron-vein',
    artistProfileId: 'demo-riha',
    title: 'Iron Vein',
    artistName: 'Riha',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&h=760&q=80',
    releaseDate: '2024-04-22T00:00:00.000Z',
    type: 'single',
    genre: 'Industrial Rock',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    playCount: 410,
  },
  {
    id: 'demo-midnight-signals',
    artistProfileId: 'demo-khwaab',
    title: 'Midnight Signals',
    artistName: 'Khwaab',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=760&q=80',
    releaseDate: '2024-06-02T00:00:00.000Z',
    type: 'album',
    genre: 'Ambient',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    playCount: 380,
  },
]

const DEMO_LATEST_NEWS: ArticleDto[] = [
  {
    id: 'demo-news-red-eclipse',
    title: "Signal Bloom's 'Red Eclipse' is out now",
    slug: 'signal-bloom-red-eclipse-out-now',
    excerpt: 'The post-rock outfit delivers their most expansive EP to date.',
    bodyHtml: '',
    status: 'published',
    isCoverStory: false,
    coverUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=400&h=400&q=80',
    publishedAt: '2024-05-28T00:00:00.000Z',
  },
  {
    id: 'demo-news-cathedral',
    title: "Anantram announce 'Cathedral EP'",
    slug: 'anantram-cathedral-ep-announce',
    excerpt: 'Four-track session recorded between Mumbai and Pune.',
    bodyHtml: '',
    status: 'published',
    isCoverStory: false,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&h=400&q=80',
    publishedAt: '2024-05-18T00:00:00.000Z',
  },
  {
    id: 'demo-news-iron-vein',
    title: "Riha premiere new single 'Iron Vein'",
    slug: 'riha-iron-vein-premiere',
    excerpt: 'Industrial rock pressure built for warehouse systems.',
    bodyHtml: '',
    status: 'published',
    isCoverStory: false,
    coverUrl: 'https://images.unsplash.com/photo-1524368535928-1a18db27a965?auto=format&fit=crop&w=400&h=400&q=80',
    publishedAt: '2024-04-22T00:00:00.000Z',
  },
  {
    id: 'demo-news-midnight-signals',
    title: "Khwaab share ambient project 'Midnight Signals'",
    slug: 'khwaab-midnight-signals',
    excerpt: 'Slow-bloom textures for late-night listening rooms.',
    bodyHtml: '',
    status: 'published',
    isCoverStory: false,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=400&q=80',
    publishedAt: '2024-06-02T00:00:00.000Z',
  },
]

function stubPlaylistTracks(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    sortOrder: index,
    title: `Track ${index + 1}`,
    artistName: 'Institute of Sound',
    durationSec: 210,
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  }))
}

const DEMO_PLAYLISTS: PlaylistDto[] = [
  {
    id: 'demo-ios-essentials',
    title: 'IOS Essentials',
    slug: 'ios-essentials',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&h=600&q=80',
    description: 'Core catalogue cuts from the imprint.',
    tracks: stubPlaylistTracks(10),
  },
  {
    id: 'demo-post-rock-india',
    title: 'Post Rock India',
    slug: 'post-rock-india',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&h=600&q=80',
    description: 'Expansive guitar arcs from the subcontinent.',
    tracks: stubPlaylistTracks(25),
  },
  {
    id: 'demo-late-night',
    title: 'Late Night Sessions',
    slug: 'late-night-sessions',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=600&q=80',
    description: 'After-hours transmissions for focused listening.',
    tracks: stubPlaylistTracks(30),
  },
  {
    id: 'demo-experimental-mix',
    title: 'Experimental Mix',
    slug: 'experimental-mix',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=600&q=80',
    description: 'Forward-thinking artists and unique sounds.',
    tracks: stubPlaylistTracks(21),
  },
]

const DEMO_STATS: LabelOverviewStatsDto = {
  releases: 28,
  artists: 19,
  streams: 3_200_000,
  countriesReach: 11,
}

/** Canonical label overview demo — used when API data is missing or incomplete. */
export function buildLabelOverviewDemo(user: UserDto): LabelOverviewDto {
  return {
    label: {
      id: `demo-label-${user.id}`,
      userId: user.id,
      slug: user.username?.trim() || 'institute-of-sound',
      displayName: user.name,
      bio: user.bio?.trim() || DEFAULT_LABEL_BIO,
      logoUrl: user.avatarUrl ?? undefined,
      coverUrl: user.coverUrl ?? undefined,
      genres: ['Rock', 'Post Rock', 'Ambient', 'Electronic', 'Experimental'],
      foundedYear: 2023,
      founderName: user.name,
      basedIn: 'Mumbai, India',
    },
    featuredReleases: DEMO_RELEASES,
    artists: DEMO_ARTISTS,
    latestReleases: DEMO_LATEST_RELEASES,
    latestNews: DEMO_LATEST_NEWS,
    playlists: DEMO_PLAYLISTS,
    stats: DEMO_STATS,
  }
}

export function mergeLabelOverviewWithDemo(
  user: UserDto,
  data: LabelOverviewDto | null | undefined,
): LabelOverviewDto {
  const demo = buildLabelOverviewDemo(user)
  if (!data) return demo

  return {
    label: {
      ...demo.label,
      ...data.label,
      bio: data.label.bio?.trim() || demo.label.bio,
      genres: data.label.genres.length > 0 ? data.label.genres : demo.label.genres,
      foundedYear: data.label.foundedYear ?? demo.label.foundedYear,
      founderName: data.label.founderName?.trim() || demo.label.founderName,
      basedIn: data.label.basedIn?.trim() || demo.label.basedIn,
      logoUrl: data.label.logoUrl ?? demo.label.logoUrl,
      coverUrl: data.label.coverUrl ?? demo.label.coverUrl,
    },
    featuredReleases: data.featuredReleases.length > 0 ? data.featuredReleases : demo.featuredReleases,
    artists: data.artists.length > 0 ? data.artists : demo.artists,
    latestReleases: data.latestReleases.length > 0 ? data.latestReleases : demo.latestReleases,
    latestNews: data.latestNews.length > 0 ? data.latestNews : demo.latestNews,
    playlists: data.playlists?.length > 0 ? data.playlists : demo.playlists,
    stats:
      data.stats && (data.stats.releases > 0 || data.stats.streams > 0 || data.stats.artists > 0)
        ? data.stats
        : demo.stats,
  }
}
