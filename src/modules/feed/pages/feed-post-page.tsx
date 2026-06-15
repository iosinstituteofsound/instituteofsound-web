import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { FeedItemCard } from '@/modules/feed/lib/feed-type-registry'
import { useFeedItem } from '@/modules/feed/hooks/use-feed-engagement'
import { useFeedPostPageMeta } from '@/modules/feed/lib/feed-post-meta'
import { Button } from '@/shared/components/ui/button'
import { ErrorState } from '@/shared/components/feedback/states'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { usePageMeta } from '@/shared/hooks/use-page-meta'

export function FeedPostPage() {
  const { id = '' } = useParams()
  const { data: item, isLoading, isError, refetch } = useFeedItem(id)
  const pageMeta = useFeedPostPageMeta(item)
  usePageMeta(pageMeta)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[680px] space-y-3 pb-8">
        <Skeleton className="h-9 w-24" />
        <div className="feed-social-card overflow-hidden p-4">
          <div className="mb-3 flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="mx-auto w-full max-w-[680px] pb-8">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-3 pb-8">
      <Button variant="ghost" size="sm" className="rounded-lg px-2" asChild>
        <Link to="/feed">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to feed
        </Link>
      </Button>

      <FeedItemCard item={item} defaultCommentsOpen />
    </div>
  )
}
