import { Loader2, UserCheck, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { useFollowStatus, useToggleFollow } from '@/shared/hooks/use-follow'
import { Button } from '@/shared/components/ui/button'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

type ProfileFollowButtonProps = {
  userId: string
  userName: string
  initialFollowing?: boolean
  className?: string
  variant?: 'default' | 'profile'
}

export function ProfileFollowButton({
  userId,
  userName,
  initialFollowing,
  className,
  variant = 'profile',
}: ProfileFollowButtonProps) {
  const viewerId = useAuthStore((s) => s.userId)
  const isSelf = viewerId === userId
  const { data: status, isLoading } = useFollowStatus(!isSelf ? userId : undefined)
  const toggleFollow = useToggleFollow(userId)

  const following = status?.following ?? initialFollowing ?? false

  if (isSelf || !viewerId) return null

  const handleClick = () => {
    toggleFollow.mutate(following, {
      onSuccess: (result) => {
        toast.success(result.following ? `Following ${userName}` : `Unfollowed ${userName}`)
      },
      onError: () => {
        toast.error('Could not update follow status. Please try again.')
      },
    })
  }

  const profileClasses =
    'h-9 rounded-lg border border-white/20 bg-white/12 px-4 text-[13px] font-semibold text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20'

  return (
    <Button
      type="button"
      size="sm"
      variant={following ? 'secondary' : 'default'}
      className={cn(
        variant === 'profile' && profileClasses,
        following && variant === 'profile' && 'bg-white/20',
        className,
      )}
      disabled={isLoading || toggleFollow.isPending}
      onClick={handleClick}
    >
      {toggleFollow.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  )
}
