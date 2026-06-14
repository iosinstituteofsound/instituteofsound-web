import { Link } from 'react-router-dom'
import { useShell } from '@/context/ShellContext'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { MetalBadge } from '@/components/ui/MetalBadge'

export function PageShell() {
  const { meta } = useShell()

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <MagazineSectionHeading kicker={meta.kicker} title={meta.sectionTitle} subtitle={meta.description} />

      <div className="ios-panel mt-8 pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <MetalBadge variant="crimson">Phase {meta.pipelinePhase}</MetalBadge>
          <MetalBadge>Shell ready</MetalBadge>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          This route uses the v2 app shell — sidebar, top bar, SEO, and command palette are wired.
          Full page content ports in pipeline phase {meta.pipelinePhase}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/" className="ios-btn ios-btn-secondary">
            ← Home
          </Link>
          {meta.shellMode === 'learn' && (
            <Link to="/academy" className="ios-btn ios-btn-primary">
              Academy hub
            </Link>
          )}
          {meta.shellMode === 'make' && (
            <Link to="/tools" className="ios-btn ios-btn-primary">
              Toolkit hub
            </Link>
          )}
          {meta.shellMode === 'network' && (
            <Link to="/community" className="ios-btn ios-btn-primary">
              Community
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
