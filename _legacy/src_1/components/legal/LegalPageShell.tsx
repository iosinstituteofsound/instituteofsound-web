import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface LegalPageShellProps {
  kicker: string
  title: string
  subtitle: string
  children: ReactNode
}

export function LegalPageShell({ kicker, title, subtitle, children }: LegalPageShellProps) {
  return (
    <div className="legal-page section-padding pt-32 min-h-screen">
      <div className="legal-page-inner max-w-3xl mx-auto">
        <SectionHeading label={kicker} title={title} subtitle={subtitle} titleAs="h1" />
        <div className="legal-page-body">{children}</div>
        <nav className="legal-page-foot" aria-label="Related pages">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/archive">Archive</Link>
        </nav>
      </div>
    </div>
  )
}
