import { Smile } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type EmojiTriggerButtonProps = {
  onClick: (anchor: HTMLElement) => void
  active?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function EmojiTriggerButton({ onClick, active, className, size = 'md' }: EmojiTriggerButtonProps) {
  return (
    <button
      type="button"
      data-emoji-trigger
      onClick={(event) => onClick(event.currentTarget)}
      aria-label="Open animated emoji picker"
      aria-expanded={active}
      className={cn(
        'rounded-full transition-colors hover:bg-muted',
        size === 'md' ? 'p-1.5' : 'p-1',
        active && 'bg-amber-500/15 text-amber-500',
        className,
      )}
    >
      <Smile className={cn('h-6 w-6', active ? 'text-amber-500' : 'text-muted-foreground')} />
    </button>
  )
}
