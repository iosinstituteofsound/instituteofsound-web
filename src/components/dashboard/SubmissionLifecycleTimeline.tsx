import clsx from 'clsx'
import type { SubmissionStatus, TrackSubmission } from '@/lib/auth/types'

const STEPS: { key: SubmissionStatus | 'submitted'; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'pending', label: 'Queued' },
  { key: 'in_review', label: 'In review' },
  { key: 'approved', label: 'Approved' },
]

function stepIndex(status: SubmissionStatus): number {
  if (status === 'rejected') return 3
  if (status === 'approved') return 3
  if (status === 'in_review') return 2
  return 1
}

interface SubmissionLifecycleTimelineProps {
  submission: TrackSubmission
}

export function SubmissionLifecycleTimeline({ submission }: SubmissionLifecycleTimelineProps) {
  const active = stepIndex(submission.status)
  const rejected = submission.status === 'rejected'
  const approved = submission.status === 'approved'

  return (
    <div className="submission-lifecycle" aria-label="Submission progress">
      <ol className="submission-lifecycle-steps">
        {STEPS.map((step, index) => {
          const done = index < active || (index === 3 && approved)
          const current = index === active && !approved && !rejected
          const failed = index === 3 && rejected
          return (
            <li
              key={step.key}
              className={clsx(
                'submission-lifecycle-step',
                done && 'submission-lifecycle-step-done',
                current && 'submission-lifecycle-step-current',
                failed && 'submission-lifecycle-step-rejected'
              )}
            >
              <span className="submission-lifecycle-dot" aria-hidden />
              <span className="submission-lifecycle-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
      {rejected && (
        <p className="submission-lifecycle-note submission-lifecycle-note-rejected">
          Not selected this round — editor notes below may include next steps.
        </p>
      )}
      {approved && (
        <p className="submission-lifecycle-note submission-lifecycle-note-approved">
          Approved — consider spinning the track on the network for extra visibility.
        </p>
      )}
      <p className="submission-lifecycle-meta text-xs text-muted mt-2">
        Submitted {new Date(submission.createdAt).toLocaleString()}
        {submission.reviewedAt &&
          ` · Reviewed ${new Date(submission.reviewedAt).toLocaleString()}`}
      </p>
    </div>
  )
}
