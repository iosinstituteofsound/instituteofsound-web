import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { FeedItemCard } from '@/modules/feed/lib/feed-type-registry'
import { useFeedItem } from '@/modules/feed/hooks/use-feed-engagement'
import { useFeedPostPageMeta } from '@/modules/feed/lib/feed-post-meta'
import { Button } from '@/shared/components/ui/button'
import { ErrorState } from '@/shared/components/feedback/states'
import { FeedPostSkeleton } from '@/modules/feed/components/feed-post-skeleton'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { usePageMeta } from '@/shared/hooks/use-page-meta'

export function FeedPostPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: item, isLoading, isError, refetch } = useFeedItem(id)
  const pageMeta = useFeedPostPageMeta(item)
  usePageMeta(pageMeta)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[680px] space-y-3 pb-8">
        <Skeleton className="h-9 w-24" />
        <FeedPostSkeleton count={1} className="space-y-0" />
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
        <Link to="/home">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to feed
        </Link>
      </Button>

      <FeedItemCard
        item={item}
        defaultCommentsOpen
        onPostDeleted={() => navigate('/home', { replace: true })}
      />
    </div>
  )
}
