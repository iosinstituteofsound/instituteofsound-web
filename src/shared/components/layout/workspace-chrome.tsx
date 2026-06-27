import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface WorkspaceChromeBarProps {
  leading?: ReactNode
  center?: ReactNode
  trailing?: ReactNode
  className?: string
}

function WorkspaceBar({ leading, center, trailing, className }: WorkspaceChromeBarProps) {
  return (
    <div
      className={cn(
        'flex h-14 shrink-0 items-center justify-between gap-3 border-border bg-card px-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">{leading}</div>
      {center ? <div className="flex min-w-0 flex-1 items-center justify-center">{center}</div> : <span className="flex-1" />}
      <div className="flex shrink-0 items-center gap-2">{trailing}</div>
    </div>
  )
}

export function WorkspaceHeader(props: WorkspaceChromeBarProps) {
  return <WorkspaceBar {...props} className={cn('border-b', props.className)} />
}

export function WorkspaceFooter(props: WorkspaceChromeBarProps) {
  return <WorkspaceBar {...props} className={cn('border-t', props.className)} />
}
