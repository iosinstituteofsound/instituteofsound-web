import type { ReactNode } from 'react'
import { Button } from '@/shared/components/ui/button'

interface ReviewSummaryCardProps {
  title: string
  children: ReactNode
  onEdit?: () => void
  editLabel?: string
}

export function ReviewSummaryCard({ title, children, onEdit, editLabel = 'Edit' }: ReviewSummaryCardProps) {
  return (
    <article className="sub-review-card">
      <h3 className="sub-review-card__title">{title}</h3>
      <div className="flex-1">{children}</div>
      {onEdit ? (
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          {editLabel}
        </Button>
      ) : null}
    </article>
  )
}
