import type { ReactNode } from 'react'

export function PageLayout({
  children,
  wide,
}: {
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? 'v2-page v2-page--wide' : 'v2-page'}>{children}</div>
  )
}
