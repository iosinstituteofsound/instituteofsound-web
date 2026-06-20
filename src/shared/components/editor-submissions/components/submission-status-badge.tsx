import type { TrackSubmissionDto } from '@/modules/explore/types/explore.types'
import { SUBMISSION_STATUS_LABELS } from '@/shared/components/editor-submissions/lib/submission-utils'
import { cn } from '@/shared/lib/cn'

export function SubmissionStatusBadge({
  status,
  className,
}: {
  status: TrackSubmissionDto['status']
  className?: string
}) {
  return (
    <span className={cn('sub-desk__status', `sub-desk__status--${status}`, className)}>
      {SUBMISSION_STATUS_LABELS[status]}
    </span>
  )
}
