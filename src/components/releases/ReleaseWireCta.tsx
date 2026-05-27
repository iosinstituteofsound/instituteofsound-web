import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { createDropPost, createSpinPost } from '@/lib/community/feedService'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { markReleaseSpinPromoted } from '@/lib/releases/service'
import type { PublicRelease } from '@/lib/releases/types'
import { getCommunityGenreId } from '@/lib/community/genreContext'
import { buildToolDropBody } from '@/lib/academy/academyLoop'

interface ReleaseWireCtaProps {
  release: PublicRelease
  isOwner?: boolean
}

export function ReleaseWireCta({ release, isOwner }: ReleaseWireCtaProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(release.spinPromoted)
  const [error, setError] = useState('')

  if (!release.isLive) return null

  const handleDrop = async () => {
    if (!user || !stats || busy || done) return
    setBusy(true)
    setError('')
    try {
      const handle = memberHandleFromUser(user)
      const hasSpinEmbed = Boolean(release.spotifyUrl || release.youtubeUrl)
      if (hasSpinEmbed) {
        await createSpinPost({
          userId: user.id,
          displayName: user.name,
          handle,
          avatarUrl: user.avatarUrl,
          rank: stats.rank,
          primaryGenreSlug: stats.primaryGenreSlug,
          primaryGenreId: getCommunityGenreId() ?? undefined,
          spotifyRaw: release.spotifyUrl ?? '',
          youtubeRaw: release.youtubeUrl ?? '',
          caption: `Premiere: ${release.title}`,
          trackTitle: release.title,
        })
      } else {
        const link = release.soundcloudUrl ?? ''
        await createDropPost({
          userId: user.id,
          displayName: user.name,
          handle,
          avatarUrl: user.avatarUrl,
          rank: stats.rank,
          primaryGenreSlug: stats.primaryGenreSlug,
          primaryGenreId: getCommunityGenreId() ?? undefined,
          text: buildToolDropBody(
            `Premiere: ${release.title}`,
            link ? `Listen: ${link}` : `New ${release.releaseType} on the wire`
          ),
        })
      }
      await markReleaseSpinPromoted(release.id)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post spin')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="release-wire-cta ios-card">
      <p className="ios-kicker">Network</p>
      <p className="font-display font-bold mt-1">Push this premiere on the wire</p>
      <p className="text-sm text-muted mt-2">
        Share as a Spin so followers and your tribe see it in the feed.
      </p>
      {isOwner && !done && (
        <button
          type="button"
          className="ios-btn ios-btn-primary mt-4"
          disabled={busy}
          onClick={() => void handleDrop()}
        >
          {busy ? 'Posting…' : 'Drop on network →'}
        </button>
      )}
      {done && (
        <p className="text-sm text-mh-red mt-4">
          On the wire.{' '}
          <Link to="/community#feed" className="underline">
            View feed
          </Link>
        </p>
      )}
      {error && <p className="text-sm text-crimson mt-2">{error}</p>}
      {!user && (
        <Link to="/login" className="ios-btn ios-btn-ghost mt-4 inline-block">
          Sign in to spin →
        </Link>
      )}
    </div>
  )
}
