import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCommunityLeaderboard, useCommunityMemberStats } from '@/hooks/useCommunity'
import { fetchCommunityFeed, COMMUNITY_FEED_EVENT } from '@/lib/community/feedService'
import {
  fetchMemberActivity,
  fetchPublicMemberProfile,
  memberHandleFromUser,
  type MemberActivityItem,
  type PublicMemberProfile,
} from '@/lib/community/memberProfileService'
import { fetchCollabBoard } from '@/lib/collab/service'
import type { CollabBoardPost } from '@/lib/collab/types'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { fetchUpcomingEvents } from '@/lib/events/service'
import type { SceneEvent } from '@/lib/events/types'
import { countMentions } from '@/lib/dashboard/feedActivityDesk'
import { COMMENT_EVENT } from '@/lib/community/commentService'
import { COMMUNITY_FOLLOW_EVENT } from '@/lib/community/followService'

export function useMemberFeedDesk() {
  const { user } = useAuth()
  const { stats, loading: statsLoading } = useCommunityMemberStats()
  const { entries: leaderboard, loading: leaderboardLoading } = useCommunityLeaderboard(5)

  const handle = user ? memberHandleFromUser(user) : ''
  const [profile, setProfile] = useState<PublicMemberProfile | null>(null)
  const [posts, setPosts] = useState<CommunityFeedPost[]>([])
  const [followingPosts, setFollowingPosts] = useState<CommunityFeedPost[]>([])
  const [events, setEvents] = useState<SceneEvent[]>([])
  const [collabPosts, setCollabPosts] = useState<CollabBoardPost[]>([])
  const [activity, setActivity] = useState<MemberActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setPosts([])
      setFollowingPosts([])
      setEvents([])
      setCollabPosts([])
      setActivity([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [prof, feed, following, evts, collab, act] = await Promise.all([
        fetchPublicMemberProfile(handle),
        fetchCommunityFeed({ limit: 30, viewerUserId: user.id }),
        fetchCommunityFeed({ limit: 30, followingOnly: true, viewerUserId: user.id }),
        fetchUpcomingEvents({}, 12, user.id),
        fetchCollabBoard({}, 12),
        fetchMemberActivity(handle, 12),
      ])
      setProfile(prof)
      setPosts(feed)
      setFollowingPosts(following)
      setEvents(evts)
      setCollabPosts(collab.filter((p) => p.status === 'open'))
      setActivity(act)
    } finally {
      setLoading(false)
    }
  }, [user, handle])

  useEffect(() => {
    void refresh()
    const onChange = () => void refresh()
    window.addEventListener(COMMUNITY_FEED_EVENT, onChange)
    window.addEventListener(COMMUNITY_FOLLOW_EVENT, onChange)
    window.addEventListener(COMMENT_EVENT, onChange)
    return () => {
      window.removeEventListener(COMMUNITY_FEED_EVENT, onChange)
      window.removeEventListener(COMMUNITY_FOLLOW_EVENT, onChange)
      window.removeEventListener(COMMENT_EVENT, onChange)
    }
  }, [refresh])

  const mentionCount = countMentions(posts, handle)

  return {
    user,
    handle,
    stats,
    statsLoading,
    profile,
    posts,
    followingPosts,
    events,
    collabPosts,
    activity,
    leaderboard,
    leaderboardLoading,
    mentionCount,
    loading,
    refresh,
  }
}
