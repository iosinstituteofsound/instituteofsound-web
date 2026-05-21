import type { ArtistCatalogImportResult } from './types'

export async function fetchArtistCatalogFromUrl(
  profileUrl: string
): Promise<ArtistCatalogImportResult> {
  const url = profileUrl.trim()
  if (!url) throw new Error('Profile URL is required')

  const res = await fetch(`/api/import-catalog?url=${encodeURIComponent(url)}`)
  const data = (await res.json()) as ArtistCatalogImportResult & { error?: string }

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not fetch catalog')
  }

  return data
}
