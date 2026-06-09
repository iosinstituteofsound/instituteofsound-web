import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import {
  fetchMemberActivity,
  fetchPublicMemberProfile,
  memberHandleFromUser,
  type MemberActivityItem,
  type PublicMemberProfile,
} from '@/lib/community/memberProfileService'
import { fetchFandomDiscover, fetchMyFandom } from '@/lib/fandom/service'
import type { FandomDiscoverArtistRow, FandomWindow, MyFandomArtistRow } from '@/lib/fandom/types'
import { fetchUpcomingEvents } from '@/lib/events/service'
import type { SceneEvent } from '@/lib/events/types'

export function useMemberFandomDesk() {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const [window, setWindow] = useState<FandomWindow>('90d')
  const [artists, setArtists] = useState<MyFandomArtistRow[]>([])
  const [discover, setDiscover] = useState<FandomDiscoverArtistRow[]>([])
  const [events, setEvents] = useState<SceneEvent[]>([])
  const [activity, setActivity] = useState<MemberActivityItem[]>([])
  const [profile, setProfile] = useState<PublicMemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handle = user ? memberHandleFromUser(user) : ''

  const refresh = useCallback(async () => {
    if (!user) {
      setArtists([])
      setDiscover([])
      setEvents([])
      setActivity([])
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const [rowsResult, discoveryResult, evtsResult, actResult, profResult] =
        await Promise.allSettled([
          fetchMyFandom(window),
          fetchFandomDiscover(),
          fetchUpcomingEvents({}, 20, user.id),
          fetchMemberActivity(handle, 20),
          fetchPublicMemberProfile(handle),
        ])

      if (rowsResult.status === 'rejected') {
        throw rowsResult.reason
      }

      setArtists(rowsResult.value ?? [])
      setDiscover(
        discoveryResult.status === 'fulfilled'
          ? [...(discoveryResult.value.forYou ?? []), ...(discoveryResult.value.rising ?? [])]
          : [],
      )
      setEvents(evtsResult.status === 'fulfilled' ? evtsResult.value : [])
      setActivity(actResult.status === 'fulfilled' ? actResult.value : [])
      setProfile(profResult.status === 'fulfilled' ? profResult.value : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fandom')
      setArtists([])
    } finally {
      setLoading(false)
    }
  }, [user, window, handle])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    user,
    handle,
    window,
    setWindow,
    artists,
    discover,
    events,
    activity,
    profile,
    stats,
    loading,
    error,
    refresh,
  }
}
