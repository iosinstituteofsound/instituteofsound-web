import clsx from 'clsx'
import type { SubmissionStatus } from '@/lib/auth/types'

const styles: Record<SubmissionStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  in_review: 'bg-mh-red/20 text-mh-red border-mh-red/40',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  rejected: 'bg-red-500/20 text-red-400 border-mh-red/60',
}

const labels: Record<SubmissionStatus, string> = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={clsx(
        'text-[10px] tracking-widest uppercase px-2 py-0.5 border font-bold',
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  )
}
