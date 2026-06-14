import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { LayoutConfig } from '@/shared/types/layout.types'

interface LayoutPublicPreviewProps {
  layoutName?: string
  config: LayoutConfig['public']
  compact?: boolean
}

export function LayoutPublicPreview({ layoutName, config, compact = false }: LayoutPublicPreviewProps) {
  if (!config.enabled) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
        Public surface disabled
      </div>
    )
  }

  const brand = config.header.brandTitle?.trim() || layoutName?.trim() || 'Institute of Sound'

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border/80 bg-background shadow-sm', compact && 'text-xs')}>
      <header className="border-b border-border/80 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold">{brand}</span>
          <div className="flex flex-wrap items-center gap-2">
            {config.header.navLinks.slice(0, compact ? 2 : 4).map((link) => (
              <span key={link.href} className="text-[8px] text-muted-foreground">
                {link.label}
              </span>
            ))}
            {config.header.showAuthButtons ? (
              <>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[8px]" asChild>
                  <Link to="/auth/login">Sign in</Link>
                </Button>
                <Button size="sm" className="h-6 px-2 text-[8px]" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="bg-muted/20 px-3 py-6">
        <p className="text-center text-[9px] text-muted-foreground">Public page content</p>
      </main>
      {config.footer.enabled ? (
        <footer className="border-t border-border/80 bg-card px-3 py-2">
          <p className="text-[8px] text-muted-foreground">{config.footer.copyright || 'Footer'}</p>
          {config.footer.linkGroups.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-2">
              {config.footer.linkGroups.flatMap((group) =>
                group.links.map((link) => (
                  <span key={`${group.title}-${link.href}`} className="text-[8px] text-muted-foreground">
                    {link.label}
                  </span>
                )),
              )}
            </div>
          ) : null}
        </footer>
      ) : null}
    </div>
  )
}
