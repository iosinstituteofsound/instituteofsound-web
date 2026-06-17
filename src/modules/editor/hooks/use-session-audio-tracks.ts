import { useEffect, useState } from 'react'
import { resolveAudioSessionTracks } from '@/modules/editor/lib/resolve-audio-collection'
import type { SessionAudioTrack } from '@/modules/editor/lib/session-audio-tracks'
import type { ExplorePayload } from '@/modules/explore/types/explore.types'
import type { SiteAudioTrack } from '@/modules/editor/lib/site-audio-library'

export function useSessionAudioTracks(input: {
  audioUrl: string
  trackTitle?: string
  sessionTracks?: SessionAudioTrack[]
  explore?: ExplorePayload | null
  siteTrack?: SiteAudioTrack | null
}) {
  const [tracks, setTracks] = useState<SessionAudioTrack[]>(input.sessionTracks ?? [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (input.sessionTracks && input.sessionTracks.length > 0) {
      setTracks(input.sessionTracks)
      return
    }

    let cancelled = false
    setLoading(true)

    void resolveAudioSessionTracks(input).then((resolved) => {
      if (cancelled) return
      setTracks(resolved)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [
    input.audioUrl,
    input.trackTitle,
    input.explore,
    input.siteTrack?.id,
    input.sessionTracks?.map((track) => track.id).join('|'),
  ])

  return { tracks, loading }
}
