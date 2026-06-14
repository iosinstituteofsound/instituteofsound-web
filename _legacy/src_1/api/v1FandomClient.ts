import { v1Fetch } from '@/api/v1Client'
import type {
  ArtistContentChampionRow,
  ArtistDiscoveryDriverRow,
  ArtistRecentSupportRow,
  ArtistSupporterRow,
  FandomDiscoverArtistRow,
  FandomMilestoneRow,
  FandomPublicRecognitionRow,
  FandomRecognitionKind,
  FandomSentRecognitionRow,
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
  drivers: ArtistDiscoveryDriverRow[]
}> {
  return v1Fetch(`/fandom/artist?window=${encodeURIComponent(window)}`)
}

export async function v1FetchFandomDiscover(): Promise<{
  rising: FandomDiscoverArtistRow[]
  forYou: FandomDiscoverArtistRow[]
}> {
  return v1Fetch('/fandom/discover', { auth: 'optional' })
}

export async function v1LogFandomShare(postId: string): Promise<void> {
  await v1Fetch('/fandom/share', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  })
}

export async function v1SendFandomRecognition(input: {
  supporterUserId: string
  message: string
  kind?: FandomRecognitionKind
  isPublic?: boolean
}): Promise<void> {
  await v1Fetch('/fandom/recognize', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function v1FetchArtistSentRecognitions(
  limit = 20,
): Promise<FandomSentRecognitionRow[]> {
  const { recognitions } = await v1Fetch<{ recognitions: FandomSentRecognitionRow[] }>(
    `/fandom/recognitions/sent?limit=${limit}`,
  )
  return recognitions ?? []
}

export async function v1FetchPublicRecognitionsForUser(
  userId: string,
  limit = 12,
): Promise<FandomPublicRecognitionRow[]> {
  const { recognitions } = await v1Fetch<{ recognitions: FandomPublicRecognitionRow[] }>(
    `/fandom/recognitions/public?userId=${encodeURIComponent(userId)}&limit=${limit}`,
    { auth: 'optional' },
  )
  return recognitions ?? []
}

export async function v1FetchSupporterMilestones(
  artistProfileId: string,
  supporterUserId?: string,
): Promise<FandomMilestoneRow[]> {
  const params = new URLSearchParams({ artistProfileId })
  if (supporterUserId) params.set('supporterUserId', supporterUserId)
  const { milestones } = await v1Fetch<{ milestones: FandomMilestoneRow[] }>(
    `/fandom/milestones?${params}`,
  )
  return milestones ?? []
}
