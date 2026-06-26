import { Link } from 'react-router-dom'
import { Loader2, X } from 'lucide-react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { useFollowersList, useFollowingUsersList } from '@/modules/social/hooks/use-follow'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useInfiniteScroll } from '@/shared/hooks/use-infinite-scroll'

type FollowListDialogProps = {
  userId: string
  mode: 'followers' | 'following' | null
  onClose: () => void
}

export function FollowListDialog({ userId, mode, onClose }: FollowListDialogProps) {
  const isFollowers = mode === 'followers'
  const followersQuery = useFollowersList(userId, mode === 'followers')
  const followingQuery = useFollowingUsersList(userId, mode === 'following')
  const query = isFollowers ? followersQuery : followingQuery

  const users =
    query.data?.pages.flatMap((page) => page.users) ?? []

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage()
    }
  }

  const sentinelRef = useInfiniteScroll(loadMore, {
    enabled: Boolean(query.hasNextPage),
  })

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[min(80vh,32rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base">
            {isFollowers ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[min(60vh,24rem)] overflow-y-auto px-2 py-2">
          {query.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {isFollowers ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {users.map((user) => (
                <li key={user.id}>
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                    onClick={onClose}
                  >
                    <FeedUserAvatar name={user.name} avatarUrl={user.avatarThumbnailUrl ?? user.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        <VerifiedUserName name={user.name} isVerified={user.isVerified} />
                      </p>
                      {user.username ? (
                        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div ref={sentinelRef} className="h-1" />
          {query.isFetchingNextPage ? (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>

        <div className="border-t px-4 py-2">
          <Button type="button" variant="ghost" size="sm" className="w-full" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
