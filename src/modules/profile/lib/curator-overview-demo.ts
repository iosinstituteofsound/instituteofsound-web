import type { CuratorDiscoveryArtistDto, CuratorOverviewDto } from '@/modules/explore/types/explore.types'
import type { UserDto } from '@/shared/types/auth.types'

const DISCOVERY_WALL_LIMIT = 8

function mergeDiscoveryWall(
  fromApi: CuratorDiscoveryArtistDto[] | undefined,
  fallback: CuratorDiscoveryArtistDto[],
): CuratorDiscoveryArtistDto[] {
  const primary = fromApi?.length ? fromApi : fallback
  if (primary.length >= DISCOVERY_WALL_LIMIT) return primary.slice(0, DISCOVERY_WALL_LIMIT)

  const seen = new Set(primary.map((artist) => artist.id))
  const merged = [...primary]

  for (const artist of fallback) {
    if (merged.length >= DISCOVERY_WALL_LIMIT) break
    if (seen.has(artist.id)) continue
    merged.push(artist)
    seen.add(artist.id)
  }

  return merged
}

/** Client-side fallback when API is unavailable — mirrors backend demo seed. */
const CURATOR_OVERVIEW_DEMO: CuratorOverviewDto = {
    stats: {
      followers: 12_400,
      playlists: 48,
      artistsDiscovered: 327,
      playlistSpins: 1_200_000,
      featuredPicks: 28,
    },
    scores: { taste: 92, discovery: 88, influence: 79, accuracy: 84 },
    tasteMap: [
      { genre: 'Metal', percent: 45, color: '#d4a017' },
      { genre: 'Rock', percent: 25, color: '#8b7fa8' },
      { genre: 'Prog', percent: 15, color: '#7c5cbf' },
      { genre: 'Electronic', percent: 10, color: '#e07830' },
      { genre: 'Experimental', percent: 5, color: '#2a9d8f' },
    ],
    genreTags: ['Metal', 'Prog', 'Alternative', 'Doom'],
    featuredPlaylists: [
      {
        id: 'demo-underground-metal-india',
        title: 'Underground Metal India',
        slug: 'underground-metal-india',
        coverUrl:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=640&h=640&q=80',
        followerCount: 8_200,
        playCount: 312_000,
        tracks: [],
      },
      {
        id: 'demo-future-heavy',
        title: 'Future Heavy',
        slug: 'future-heavy',
        coverUrl:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=640&h=640&q=80',
        followerCount: 6_100,
        playCount: 248_000,
        tracks: [],
      },
      {
        id: 'demo-doom-sessions',
        title: 'Doom Sessions',
        slug: 'doom-sessions',
        coverUrl:
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=640&h=640&q=80',
        followerCount: 4_800,
        playCount: 186_000,
        tracks: [],
      },
      {
        id: 'demo-prog-frontiers',
        title: 'Prog Frontiers',
        slug: 'prog-frontiers',
        coverUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=640&h=640&q=80',
        followerCount: 3_900,
        playCount: 142_000,
        tracks: [],
      },
    ],
    discoveryWall: [
      {
        id: 'demo-last-ritual',
        artistName: 'The Last Ritual',
        slug: 'the-last-ritual',
        coverUrl: 'https://picsum.photos/seed/the-last-ritual/480/640',
        subGenre: 'Atmospheric Black Metal',
        growthPercent: 380,
        firstFeaturedAt: '2025-01-15T00:00:00.000Z',
        listenerCount: 80_000,
      },
      {
        id: 'demo-agnikund',
        artistName: 'Agnikund',
        slug: 'agnikund',
        coverUrl: 'https://picsum.photos/seed/agnikund/480/640',
        subGenre: 'Sludge Metal',
        growthPercent: 245,
        firstFeaturedAt: '2024-11-08T00:00:00.000Z',
        listenerCount: 52_000,
      },
      {
        id: 'demo-void-temple',
        artistName: 'Void Temple',
        slug: 'void-temple',
        coverUrl: 'https://picsum.photos/seed/void-temple/480/640',
        subGenre: 'Post-Metal',
        growthPercent: 190,
        firstFeaturedAt: '2024-09-22T00:00:00.000Z',
        listenerCount: 38_000,
      },
      {
        id: 'demo-iron-veil',
        artistName: 'Iron Veil',
        slug: 'iron-veil',
        coverUrl: 'https://picsum.photos/seed/iron-veil/480/640',
        subGenre: 'Progressive Metal',
        growthPercent: 156,
        firstFeaturedAt: '2024-08-03T00:00:00.000Z',
        listenerCount: 29_000,
      },
      {
        id: 'demo-crimson-hex',
        artistName: 'Crimson Hex',
        slug: 'crimson-hex',
        coverUrl: 'https://picsum.photos/seed/crimson-hex/480/640',
        subGenre: 'Groove Metal',
        growthPercent: 132,
        firstFeaturedAt: '2024-07-19T00:00:00.000Z',
        listenerCount: 24_000,
      },
      {
        id: 'demo-shadow-meridian',
        artistName: 'Shadow Meridian',
        slug: 'shadow-meridian',
        coverUrl: 'https://picsum.photos/seed/shadow-meridian/480/640',
        growthPercent: 118,
        firstFeaturedAt: '2024-06-30T00:00:00.000Z',
        listenerCount: 21_000,
      },
      {
        id: 'demo-bone-prophet',
        artistName: 'Bone Prophet',
        slug: 'bone-prophet',
        coverUrl: 'https://picsum.photos/seed/bone-prophet/480/640',
        subGenre: 'Death Metal',
        growthPercent: 104,
        firstFeaturedAt: '2024-05-12T00:00:00.000Z',
        listenerCount: 18_500,
      },
      {
        id: 'demo-neon-grave',
        artistName: 'Neon Grave',
        slug: 'neon-grave',
        coverUrl: 'https://picsum.photos/seed/neon-grave/480/640',
        subGenre: 'Industrial Metal',
        growthPercent: 96,
        firstFeaturedAt: '2024-04-21T00:00:00.000Z',
        listenerCount: 16_200,
      },
    ],
    recentPicks: [
      {
        id: 'demo-pick-248',
        pickNumber: 248,
        artistName: 'The Last Ritual',
        note: 'Raw. Honest. Powerful.',
        coverUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&h=120&q=80',
        publishedAt: '2025-06-18T00:00:00.000Z',
        reviewSlug: 'the-last-ritual-signal-pick-248',
      },
      {
        id: 'demo-pick-247',
        pickNumber: 247,
        artistName: 'Agnikund',
        note: 'Furnace-grade sludge with real narrative weight.',
        coverUrl:
          'https://images.unsplash.com/photo-1524368535928-1a18db27a965?auto=format&fit=crop&w=120&h=120&q=80',
        publishedAt: '2025-06-12T00:00:00.000Z',
        reviewSlug: 'agnikund-signal-pick-247',
      },
      {
        id: 'demo-pick-246',
        pickNumber: 246,
        artistName: 'Void Temple',
        note: 'Cathedral-scale post-metal for late-night systems.',
        coverUrl:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&h=120&q=80',
        publishedAt: '2025-06-05T00:00:00.000Z',
        reviewSlug: 'void-temple-signal-pick-246',
      },
    ],
    editorialContributions: [
      {
        id: 'demo-ed-storytelling',
        title: 'Why Indian Metal Needs Better Storytelling',
        slug: 'why-indian-metal-needs-better-storytelling',
        publishedAt: '2025-06-10T00:00:00.000Z',
        readTimeMin: 5,
      },
      {
        id: 'demo-ed-underground',
        title: 'Best Underground Releases This Quarter',
        slug: 'best-underground-releases-this-quarter',
        publishedAt: '2025-05-28T00:00:00.000Z',
        readTimeMin: 7,
      },
      {
        id: 'demo-ed-curation',
        title: 'The Art of Playlist Curation in 2025',
        slug: 'art-of-playlist-curation-2025',
        publishedAt: '2025-05-14T00:00:00.000Z',
        readTimeMin: 4,
      },
      {
        id: 'demo-ed-doom',
        title: 'Doom Metal Is Having a Moment in India',
        slug: 'doom-metal-moment-india',
        publishedAt: '2025-04-30T00:00:00.000Z',
        readTimeMin: 6,
      },
    ],
    topSupportedArtists: [
      {
        id: 'demo-supported-1',
        displayName: 'The Last Ritual',
        avatarUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 80_000,
        slug: 'the-last-ritual',
      },
      {
        id: 'demo-supported-2',
        displayName: 'Agnikund',
        avatarUrl:
          'https://images.unsplash.com/photo-1524368535928-1a18db27a965?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 52_000,
        slug: 'agnikund',
      },
      {
        id: 'demo-supported-3',
        displayName: 'Void Temple',
        avatarUrl:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 38_000,
        slug: 'void-temple',
      },
      {
        id: 'demo-supported-4',
        displayName: 'Iron Veil',
        avatarUrl:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 29_000,
        slug: 'iron-veil',
      },
      {
        id: 'demo-supported-5',
        displayName: 'Crimson Tide',
        avatarUrl:
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 24_000,
        slug: 'crimson-tide',
      },
      {
        id: 'demo-supported-6',
        displayName: 'Static Void',
        avatarUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 18_000,
        slug: 'static-void',
      },
    ],
    communityReputation: [
      { key: 'signals', label: 'Signals Sent', value: 1482 },
      { key: 'playlists', label: 'Playlists Created', value: 48 },
      { key: 'reviews', label: 'Reviews Written', value: 132 },
      { key: 'comments', label: 'Comments', value: 4312 },
      { key: 'artists', label: 'Artists Supported', value: 327 },
      { key: 'followers', label: 'Followers Gained', value: '+2.1K' },
    ],
    followersAlsoListen: [
      {
        id: 'demo-fan-gojira',
        displayName: 'Gojira',
        avatarUrl:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 4_200_000,
        slug: 'gojira',
        isVerified: true,
      },
      {
        id: 'demo-fan-tool',
        displayName: 'Tool',
        avatarUrl:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 8_100_000,
        slug: 'tool',
        isVerified: true,
      },
      {
        id: 'demo-fan-opeth',
        displayName: 'Opeth',
        avatarUrl:
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 3_600_000,
        slug: 'opeth',
      },
      {
        id: 'demo-fan-mastodon',
        displayName: 'Mastodon',
        avatarUrl:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 2_800_000,
        slug: 'mastodon',
      },
      {
        id: 'demo-fan-deftones',
        displayName: 'Deftones',
        avatarUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 9_400_000,
        slug: 'deftones',
        isVerified: true,
      },
      {
        id: 'demo-fan-meshuggah',
        displayName: 'Meshuggah',
        avatarUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 1_900_000,
        slug: 'meshuggah',
      },
      {
        id: 'demo-fan-katatonia',
        displayName: 'Katatonia',
        avatarUrl:
          'https://images.unsplash.com/photo-1511379938549-c1f69419868d?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 1_200_000,
        slug: 'katatonia',
        isVerified: true,
      },
      {
        id: 'demo-fan-ghost',
        displayName: 'Ghost',
        avatarUrl:
          'https://images.unsplash.com/photo-1459749411175-04bf5294c0cf?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 5_600_000,
        slug: 'ghost',
        isVerified: true,
      },
      {
        id: 'demo-fan-pallbearer',
        displayName: 'Pallbearer',
        avatarUrl:
          'https://images.unsplash.com/photo-1485579149621-3123dd97985f?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 890_000,
        slug: 'pallbearer',
      },
      {
        id: 'demo-fan-rivers',
        displayName: 'Rivers of Nihil',
        avatarUrl:
          'https://images.unsplash.com/photo-1514320291840-7559639549d8?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 720_000,
        slug: 'rivers-of-nihil',
      },
      {
        id: 'demo-fan-uncle',
        displayName: 'Uncle Acid',
        avatarUrl:
          'https://images.unsplash.com/photo-1498038432885-c6d3f1e8e8ca?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 1_100_000,
        slug: 'uncle-acid',
        isVerified: true,
      },
      {
        id: 'demo-fan-king',
        displayName: 'King Buffalo',
        avatarUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&h=200&q=80',
        monthlyListeners: 640_000,
        slug: 'king-buffalo',
      },
    ],
    activityFeed: [
      {
        id: 'demo-act-1',
        type: 'playlist_add',
        text: 'Added "The Lost Symbols" to Future Heavy',
        date: '2025-06-20T00:00:00.000Z',
      },
      {
        id: 'demo-act-2',
        type: 'review',
        text: 'Reviewed Agnikund',
        date: '2025-06-18T00:00:00.000Z',
      },
      {
        id: 'demo-act-3',
        type: 'article',
        text: 'Published article: Best Underground Releases',
        date: '2025-06-06T00:00:00.000Z',
      },
      {
        id: 'demo-act-4',
        type: 'signal_pick',
        text: 'Signal Picked The Last Ritual',
        date: '2025-06-04T00:00:00.000Z',
      },
      {
        id: 'demo-act-5',
        type: 'follow',
        text: 'Followed Void Temple',
        date: '2025-05-30T00:00:00.000Z',
      },
      {
        id: 'demo-act-6',
        type: 'playlist_add',
        text: 'Added "Iron Veil" to Doom Sessions',
        date: '2025-05-28T00:00:00.000Z',
      },
      {
        id: 'demo-act-7',
        type: 'review',
        text: 'Reviewed Crimson Tide EP',
        date: '2025-05-22T00:00:00.000Z',
      },
      {
        id: 'demo-act-8',
        type: 'article',
        text: 'Published article: Why Indian Metal Needs Better Storytelling',
        date: '2025-05-14T00:00:00.000Z',
      },
    ],
}

export function mergeCuratorOverviewWithDemo(
  _user: UserDto,
  data: CuratorOverviewDto | null | undefined,
): CuratorOverviewDto {
  const demo = CURATOR_OVERVIEW_DEMO
  if (!data) return demo

  return {
    stats: data.stats?.followers ? data.stats : demo.stats,
    scores: data.scores?.taste ? data.scores : demo.scores,
    tasteMap: data.tasteMap?.length ? data.tasteMap : demo.tasteMap,
    genreTags: data.genreTags?.length ? data.genreTags : demo.genreTags,
    featuredPlaylists: data.featuredPlaylists?.length ? data.featuredPlaylists : demo.featuredPlaylists,
    discoveryWall: mergeDiscoveryWall(data.discoveryWall, demo.discoveryWall),
    recentPicks: data.recentPicks?.length ? data.recentPicks : demo.recentPicks,
    editorialContributions: data.editorialContributions?.length
      ? data.editorialContributions
      : demo.editorialContributions,
    topSupportedArtists: data.topSupportedArtists?.length ? data.topSupportedArtists : demo.topSupportedArtists,
    communityReputation: data.communityReputation?.length ? data.communityReputation : demo.communityReputation,
    followersAlsoListen: data.followersAlsoListen?.length ? data.followersAlsoListen : demo.followersAlsoListen,
    activityFeed: data.activityFeed?.length ? data.activityFeed : demo.activityFeed,
  }
}
