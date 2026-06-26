import { useState } from 'react'
import { FollowListDialog } from '@/modules/social/components/follow-list-dialog'
import { cn } from '@/shared/lib/cn'

type FollowStatsProps = {
  userId: string
  followerCount?: number
  followingCount?: number
  className?: string
}

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return String(count)
}

export function FollowStats({ userId, followerCount = 0, followingCount = 0, className }: FollowStatsProps) {
  const [openList, setOpenList] = useState<'followers' | 'following' | null>(null)

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-4 text-sm', className)}>
        <button
          type="button"
          className="group inline-flex items-baseline gap-1.5 text-white/80 transition-colors hover:text-white"
          onClick={() => setOpenList('followers')}
        >
          <span className="text-[15px] font-bold text-white">{formatCount(followerCount)}</span>
          <span className="text-[13px] font-medium text-white/65 group-hover:text-white/85">Followers</span>
        </button>
        <button
          type="button"
          className="group inline-flex items-baseline gap-1.5 text-white/80 transition-colors hover:text-white"
          onClick={() => setOpenList('following')}
        >
          <span className="text-[15px] font-bold text-white">{formatCount(followingCount)}</span>
          <span className="text-[13px] font-medium text-white/65 group-hover:text-white/85">Following</span>
        </button>
      </div>

      <FollowListDialog
        userId={userId}
        mode={openList}
        onClose={() => setOpenList(null)}
      />
    </>
  )
}
