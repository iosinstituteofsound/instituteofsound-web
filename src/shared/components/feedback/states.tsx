import type { ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/cn'

type EmptyStateVariant = 'default' | 'dashed' | 'card'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  variant?: EmptyStateVariant
  className?: string
  icon?: ReactNode
}

const variantClass: Record<EmptyStateVariant, string> = {
  default: 'flex flex-col items-center justify-center gap-2 py-12 text-center',
  dashed: 'rounded-lg border border-dashed bg-card p-8 text-center shadow-sm',
  card: 'rounded-lg border bg-card shadow-sm',
}

export function EmptyState({
  title = 'No data found',
  description = 'There is nothing to display yet.',
  action,
  variant = 'default',
  className,
  icon,
}: EmptyStateProps) {
  const content = (
    <>
      {icon ?? (variant === 'default' ? <Inbox className="mx-auto h-10 w-10 text-muted-foreground" /> : null)}
      {title ? <h3 className={cn('font-medium', variant !== 'default' && 'text-base')}>{title}</h3> : null}
      {description ? (
        <p className={cn('text-sm text-muted-foreground', variant !== 'default' && 'mt-1')}>{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </>
  )

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center text-sm text-muted-foreground">
          {description && !title ? <p>{description}</p> : content}
        </CardContent>
      </Card>
    )
  }

  return <div className={cn(variantClass[variant], className)}>{content}</div>
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
