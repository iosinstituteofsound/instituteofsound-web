import {
  Calendar,
  FolderOpen,
  ListMusic,
  Newspaper,
  Users,
} from 'lucide-react'
import type { SubmissionDestination } from '@/modules/submissions/types/submission-wizard.types'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/lib/cn'

const ICONS = {
  editorial: FolderOpen,
  playlist: ListMusic,
  curators: Users,
  wire: Newspaper,
  events: Calendar,
} as const

interface DestinationCardProps {
  destination: SubmissionDestination
  selected: boolean
  onToggle: () => void
}

export function DestinationCard({ destination, selected, onToggle }: DestinationCardProps) {
  const Icon = ICONS[destination.icon]

  return (
    <button
      type="button"
      className={cn('sub-dest-card', selected && 'sub-dest-card--selected')}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <span className="sub-dest-card__check" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label={`Select ${destination.title}`} />
      </span>
      <span className="sub-dest-card__icon" aria-hidden>
        <Icon className="size-4" />
      </span>
      <h4 className="sub-dest-card__title">{destination.title}</h4>
      <p className="sub-dest-card__desc">{destination.description}</p>
      <div className="sub-dest-card__footer">
        <div>
          <div className="sub-dest-card__stat-label">Reach</div>
          <div className="sub-dest-card__stat-value">{destination.reach}</div>
        </div>
        <div className="text-right">
          <div className="sub-dest-card__stat-label">Acceptance</div>
          <div className="sub-dest-card__stat-value">{destination.acceptance}</div>
        </div>
      </div>
    </button>
  )
}
