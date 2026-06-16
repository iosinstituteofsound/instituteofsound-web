import { formatFeedTimestamp, formatFeedTimestampDetail } from '@/modules/feed/lib/feed-time'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/cn'
import './feed-post-timestamp.css'

export function FeedPostTimestamp({ value, className }: { value: string; className?: string }) {
  const shortLabel = formatFeedTimestamp(value)
  const detailLabel = formatFeedTimestampDetail(value)

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span
          className={cn('feed-post-timestamp', className)}
          aria-label={detailLabel}
        >
          {shortLabel}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="feed-post-timestamp__tooltip">
        {detailLabel}
      </TooltipContent>
    </Tooltip>
  )
}
