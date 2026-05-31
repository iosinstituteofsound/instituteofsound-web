import { v1Fetch } from '@/api/v1Client'
import type {
  ArtistContentChampionRow,
  ArtistRecentSupportRow,
  ArtistSupporterRow,
  FandomWindow,
  MyFandomArtistRow,
} from '@/lib/fandom/types'

export async function v1FetchMyFandom(
  window: FandomWindow = '90d',
): Promise<MyFandomArtistRow[]> {
  const { artists } = await v1Fetch<{ artists: MyFandomArtistRow[] }>(
    `/fandom/my-artists?window=${encodeURIComponent(window)}`,
  )
  return artists
}

export async function v1FetchArtistFandom(window: FandomWindow = '90d'): Promise<{
  supporters: ArtistSupporterRow[]
  recent: ArtistRecentSupportRow[]
  champions: ArtistContentChampionRow[]
}> {
  return v1Fetch(`/fandom/artist?window=${encodeURIComponent(window)}`)
}

export async function v1LogFandomShare(postId: string): Promise<void> {
  await v1Fetch('/fandom/share', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  })
}
