import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type StudioGlassProps = React.ComponentPropsWithoutRef<'div'> & {
  children: ReactNode
  pill?: boolean
  small?: boolean
}

/** Lightweight panel shell — no motion, no backdrop-filter (GPU-friendly). */
export function StudioGlass({ className, children, pill, small, ...rest }: StudioGlassProps) {
  return (
    <div className={cn('mas-glass', pill && 'mas-glass--pill', small && 'mas-glass--sm', className)} {...rest}>
      {children}
    </div>
  )
}
