import { detectCatalogPlatform } from './parseUrls'
import { importCatalogFromSoundCloud } from './soundcloudServer'
import { importCatalogFromSpotify } from './spotifyServer'
import type { ArtistCatalogImportResult } from './types'
import { importCatalogFromYouTube } from './youtubeServer'

export async function buildArtistCatalogFromUrl(url: string): Promise<ArtistCatalogImportResult> {
  const profileUrl = url.trim()
  if (!profileUrl) {
    throw new Error('Profile URL is required')
  }

  const platform = detectCatalogPlatform(profileUrl)

  switch (platform) {
    case 'spotify':
      return importCatalogFromSpotify(profileUrl)
    case 'youtube':
      return importCatalogFromYouTube(profileUrl)
    case 'soundcloud':
      return importCatalogFromSoundCloud(profileUrl)
    default:
      return {
        platform: 'unsupported',
        profileUrl,
        suggestions: {},
        items: [],
        warnings: [
          'Unsupported URL. Paste a Spotify artist link, YouTube channel, or SoundCloud profile.',
        ],
      }
  }
}
