import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

interface CenteredPageStateProps {
  title?: string
  message: ReactNode
  action?: ReactNode
  className?: string
  pageClassName?: string
}

export function CenteredPageState({
  title,
  message,
  action,
  className,
  pageClassName,
}: CenteredPageStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center',
        pageClassName,
      )}
    >
      <div className={cn('flex max-w-md flex-col items-center gap-3', className)}>
        {title ? (
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </h1>
        ) : null}
        <p className="text-muted-foreground">{message}</p>
        {action}
      </div>
    </div>
  )
}

export function CenteredPageStateRetry({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <CenteredPageState
      className={className}
      message={message}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  )
}
