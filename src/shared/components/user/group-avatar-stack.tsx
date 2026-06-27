import { memo } from 'react'
import { UserAvatar } from '@/shared/components/user/user-avatar'
import type { GroupMemberPreview } from '@/shared/components/user/types'
import { cn } from '@/shared/lib/cn'

type GroupAvatarStackProps = {
  members?: GroupMemberPreview[]
  title?: string
  avatarUrl?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-[52px] w-[52px]',
  lg: 'h-16 w-16',
}

export const GroupAvatarStack = memo(function GroupAvatarStack({
  members,
  title,
  avatarUrl,
  className,
  size = 'md',
}: GroupAvatarStackProps) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={cn('rounded-full object-cover', sizeMap[size], className)} />
  }

  const preview = members?.slice(0, 2) ?? []
  if (!preview.length) {
    return <UserAvatar name={title ?? 'Group'} className={cn(sizeMap[size], className)} />
  }

  if (preview.length === 1) {
    const member = preview[0]!
    return (
      <UserAvatar
        name={member.name}
        avatarUrl={member.avatarThumbnailUrl ?? member.avatarUrl}
        className={cn(sizeMap[size], className)}
      />
    )
  }

  return (
    <div className={cn('relative', sizeMap[size], className)}>
      <UserAvatar
        name={preview[0]!.name}
        avatarUrl={preview[0]!.avatarThumbnailUrl ?? preview[0]!.avatarUrl}
        className="absolute left-0 top-0 h-[70%] w-[70%] ring-2 ring-[var(--background)]"
      />
      <UserAvatar
        name={preview[1]!.name}
        avatarUrl={preview[1]!.avatarThumbnailUrl ?? preview[1]!.avatarUrl}
        className="absolute bottom-0 right-0 h-[70%] w-[70%] ring-2 ring-[var(--background)]"
      />
    </div>
  )
})
