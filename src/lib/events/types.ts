import type { EventKind } from '@/lib/events/constants'

export interface SceneEvent {
  id: string
  title: string
  description?: string
  eventKind: EventKind | string
  sceneCity: string
  sceneGenreSlug?: string
  venueName: string
  startsAt: string
  externalUrl: string
  rsvpCount: number
  viewerRsvped: boolean
}

export interface PendingSceneEvent {
  id: string
  title: string
  eventKind: string
  sceneCity: string
  sceneGenreSlug?: string
  venueName: string
  startsAt: string
  externalUrl: string
  submittedAt: string
  submitterName: string
  submitterHandle: string
}

export interface SubmitEventInput {
  title: string
  description?: string
  eventKind: EventKind
  sceneCity: string
  sceneGenreSlug?: string
  venueName: string
  startsAt: string
  externalUrl: string
}

export interface EventFilters {
  city?: string
  genreSlug?: string
}
