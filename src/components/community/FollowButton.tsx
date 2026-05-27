import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { toggleFollow } from '@/lib/community/followService'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing?: boolean
  onFollowingChange?: (following: boolean) => void
  className?: string
}

export function FollowButton({
  targetUserId,
  initialFollowing = false,
  onFollowingChange,
  className,
}: FollowButtonProps) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setFollowing(initialFollowing)
  }, [initialFollowing])

  const handleClick = useCallback(async () => {
    if (!user || busy) return
    setBusy(true)
    try {
      const next = await toggleFollow(targetUserId)
      setFollowing(next)
      onFollowingChange?.(next)
    } catch (err) {
      console.warn('[community] follow', err)
    } finally {
      setBusy(false)
    }
  }, [user, busy, targetUserId, onFollowingChange])

  if (!user || user.id === targetUserId) return null

  return (
    <button
      type="button"
      className={clsx(
        'member-profile-btn',
        following ? 'member-profile-btn-ghost' : 'member-profile-btn-primary',
        className
      )}
      disabled={busy}
      onClick={() => void handleClick()}
    >
      {busy ? '…' : following ? 'Following' : 'Follow'}
    </button>
  )
}
