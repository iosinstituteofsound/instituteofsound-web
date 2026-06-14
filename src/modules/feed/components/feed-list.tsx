import { FeedItemCard } from '@/modules/feed/lib/feed-type-registry'
import { useFeedList } from '@/modules/feed/hooks/use-feed'
import { Button } from '@/shared/components/ui/button'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function useFeedListItems() {
  const query = useFeedList()
  const items = query.data?.pages.flatMap((page) => page.items) ?? []
  return { ...query, items }
}

interface FeedListProps {
  compactLoader?: boolean
}

export function FeedList({ compactLoader }: FeedListProps) {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeedList()

  const items = data?.pages.flatMap((page) => page.items) ?? []

  if (isLoading) {
    if (compactLoader) {
      return (
        <div className="space-y-3">
          {[1, 2].map((key) => (
            <div key={key} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )
    }
    return <PageLoader />
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center shadow-sm">
        <p className="font-medium">No posts yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Be the first to share something with the community.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}
      {hasNextPage ? (
        <div className="flex justify-center pt-1">
          <Button variant="outline" className="rounded-lg" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'See more posts'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
