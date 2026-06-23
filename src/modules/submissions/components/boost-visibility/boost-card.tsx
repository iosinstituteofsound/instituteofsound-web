import {
  Clock,
  Megaphone,
  Newspaper,
  Sparkles,
  Star,
} from 'lucide-react'
import { formatInr } from '@/modules/submissions/lib/submission-catalog'
import type { SubmissionBoostOption } from '@/modules/submissions/types/submission-wizard.types'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/lib/cn'

const ICONS = {
  featured: Star,
  playlist: Sparkles,
  newsletter: Newspaper,
  social: Megaphone,
  priority: Clock,
} as const

interface BoostCardProps {
  boost: SubmissionBoostOption
  selected: boolean
  onToggle: () => void
}

export function BoostCard({ boost, selected, onToggle }: BoostCardProps) {
  const Icon = ICONS[boost.icon]

  return (
    <button
      type="button"
      className={cn('sub-boost-card', selected && 'sub-boost-card--selected')}
      onClick={onToggle}
      aria-pressed={selected}
    >
      {boost.popular ? <span className="sub-boost-card__badge">Most Popular</span> : null}
      <span className="sub-boost-card__check" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label={`Select ${boost.title}`} />
      </span>
      <span className="sub-boost-card__icon" aria-hidden>
        <Icon className="size-4" />
      </span>
      <h4 className="sub-boost-card__title">{boost.title}</h4>
      <p className="sub-boost-card__desc">{boost.description}</p>
      <div className="sub-boost-card__footer">
        <div>
          <div className="sub-boost-card__stat-label">{boost.metricLabel}</div>
          <div className="sub-boost-card__stat-value">{boost.metric}</div>
        </div>
        <div className="sub-boost-card__price">{formatInr(boost.priceInr)}</div>
      </div>
    </button>
  )
}
