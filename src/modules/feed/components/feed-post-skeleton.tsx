import { Skeleton } from '@/shared/components/ui/skeleton'

interface FeedPostSkeletonProps {
  count?: number
  className?: string
}

export function FeedPostSkeleton({ count = 2, className }: FeedPostSkeletonProps) {
  return (
    <div className={className ?? 'space-y-4'}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="feed-social-card overflow-hidden p-4">
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
