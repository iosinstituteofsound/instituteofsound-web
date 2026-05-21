import type { ArtistCatalogImportResult } from './types'

async function readApiJson<T>(res: Response): Promise<T & { error?: string }> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T & { error?: string }
  } catch {
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160)
    if (snippet.toLowerCase().includes('<!doctype') || snippet.startsWith('<')) {
      throw new Error(
        'Catalog API reachable nahi (HTML mila). Vercel pe deploy + SPOTIFY_CLIENT_ID/SECRET Production env mein daalo, phir redeploy.'
      )
    }
    throw new Error(snippet || `Server error (${res.status})`)
  }
}

export async function fetchArtistCatalogFromUrl(
  profileUrl: string
): Promise<ArtistCatalogImportResult> {
  const url = profileUrl.trim()
  if (!url) throw new Error('Profile URL is required')

  const res = await fetch(`/api/import-catalog?url=${encodeURIComponent(url)}`)
  const data = await readApiJson<ArtistCatalogImportResult>(res)

  if (!res.ok) {
    throw new Error(data.error ?? 'Could not fetch catalog')
  }

  return data
}
