import type { ReactNode } from 'react'

export function PageLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
}
