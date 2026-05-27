import type { ReactNode } from 'react'
import clsx from 'clsx'

interface PageManifestoLineProps {
  children: ReactNode
  className?: string
}

/** Left-rail manifesto quote used on hub pages. */
export function PageManifestoLine({ children, className }: PageManifestoLineProps) {
  return <p className={clsx('ios-manifesto-line', className)}>{children}</p>
}
