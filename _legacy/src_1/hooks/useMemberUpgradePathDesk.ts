import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getProfileForUser, loadArtistStudioChildData } from '@/lib/artist-profile/service'
import type { ArtistProfile } from '@/lib/artist-profile/types'
import {
  fetchPublicMemberProfile,
  memberHandleFromUser,
  type PublicMemberProfile,
} from '@/lib/community/memberProfileService'
import { buildUpgradePathSnapshot } from '@/lib/dashboard/upgradePathDesk'
import { getMyEditorApplication } from '@/lib/editor-applications/service'
import type { EditorApplication } from '@/lib/editor-applications/types'
import { getMyPlaylistCuratorApplications } from '@/lib/playlistCurator/service'
import type { PlaylistCuratorApplication } from '@/lib/playlistCurator/types'
import { getSubmissionsForArtist } from '@/lib/submissions/service'
import type { TrackSubmission } from '@/lib/auth/types'
import { getMyRoleVerificationRequests } from '@/lib/verification/service'
import type { RoleVerificationRequest } from '@/lib/verification/types'

export function useMemberUpgradePathDesk() {
  const { user } = useAuth()
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [trackCount, setTrackCount] = useState(0)
  const [publicProfile, setPublicProfile] = useState<PublicMemberProfile | null>(null)
  const [submissions, setSubmissions] = useState<TrackSubmission[]>([])
  const [verificationRequests, setVerificationRequests] = useState<RoleVerificationRequest[]>([])
  const [editorApplication, setEditorApplication] = useState<EditorApplication | null>(null)
  const [curatorApplications, setCuratorApplications] = useState<PlaylistCuratorApplication[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setArtistProfile(null)
      setTrackCount(0)
      setPublicProfile(null)
      setSubmissions([])
      setVerificationRequests([])
      setEditorApplication(null)
      setCuratorApplications([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const handle = memberHandleFromUser(user)
      const [profile, pub, subs, verifications, editorApp, curatorApps] = await Promise.all([
        getProfileForUser(user.id),
        fetchPublicMemberProfile(handle),
        getSubmissionsForArtist(user.id),
        getMyRoleVerificationRequests(user.id),
        getMyEditorApplication(user.id),
        getMyPlaylistCuratorApplications(user.id),
      ])

      setArtistProfile(profile)
      setPublicProfile(pub)
      setSubmissions(subs)
      setVerificationRequests(verifications)
      setEditorApplication(editorApp)
      setCuratorApplications(curatorApps)

      if (profile) {
        try {
          const studio = await loadArtistStudioChildData(profile.id)
          setTrackCount(studio.trackCount)
        } catch {
          setTrackCount(0)
        }
      } else {
        setTrackCount(0)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const snapshot = useMemo(() => {
    if (!user) return null
    return buildUpgradePathSnapshot({
      user,
      artistProfile,
      trackCount,
      publicProfile,
      submissions,
      verificationRequests,
      editorApplication,
      curatorApplications,
    })
  }, [
    user,
    artistProfile,
    trackCount,
    publicProfile,
    submissions,
    verificationRequests,
    editorApplication,
    curatorApplications,
  ])

  return {
    user,
    snapshot,
    loading,
    refresh,
  }
}
