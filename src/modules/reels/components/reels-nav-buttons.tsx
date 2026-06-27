import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

interface ReelsNavButtonsProps {
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
  className?: string
}

export function ReelsNavButtons({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  className,
}: ReelsNavButtonsProps) {
  return (
    <div className={cn('reels-nav-buttons', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="reels-nav-buttons__btn"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous reel"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('reels-nav-buttons__btn', canGoNext && 'reels-nav-buttons__btn--primary')}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next reel"
      >
        <ChevronDown className="h-6 w-6" />
      </Button>
    </div>
  )
}
