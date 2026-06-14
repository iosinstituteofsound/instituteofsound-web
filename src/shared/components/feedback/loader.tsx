import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface LoaderProps {
  className?: string
  label?: string
}

export function Loader({ className, label = 'Loading...' }: LoaderProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 text-muted-foreground', className)}>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader />
    </div>
  )
}
