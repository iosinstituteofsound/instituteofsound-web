import type { ReactNode } from 'react'
import { Award, ChevronDown, Menu, Shield } from 'lucide-react'
import { WorkspaceHeader } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { formatColorLabel, type SemanticColorKey } from '@/shared/design-tokens/theme-tokens'
import '@/styles/dashboard-sidebar.css'

function PreviewTokenTarget({
  token,
  onSelect,
  children,
  className,
}: {
  token: SemanticColorKey
  onSelect?: (token: SemanticColorKey) => void
  children: ReactNode
  className?: string
}) {
  if (!onSelect) return <div className={className}>{children}</div>

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(token)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(token)
        }
      }}
      className={cn(
        'cursor-pointer rounded-sm transition-shadow hover:ring-2 hover:ring-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      title={`Edit ${formatColorLabel(token)}`}
    >
      {children}
    </div>
  )
}

interface ThemeDashboardPreviewProps {
  themeName?: string
  onTokenSelect?: (token: SemanticColorKey) => void
  compact?: boolean
}

const MENU_ITEMS = ['Home', 'Explore', 'Reviews', 'Signals']
const ACADEMY_ITEMS = ['Academy Home', 'Production', 'Quizzes']

export function ThemeDashboardPreview({ themeName, onTokenSelect, compact = false }: ThemeDashboardPreviewProps) {
  const appLabel = themeName?.trim() || 'Institute of Sound'
  const menuItems = compact ? MENU_ITEMS.slice(0, 3) : MENU_ITEMS
  const academyItems = compact ? ACADEMY_ITEMS.slice(0, 2) : ACADEMY_ITEMS

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border/80 shadow-sm', compact && 'rounded-md')}>
      <div className={cn('flex bg-background text-foreground', compact ? 'min-h-[220px]' : 'min-h-[340px]')}>
        <PreviewTokenTarget
          token="background"
          onSelect={onTokenSelect}
          className={cn('shrink-0', compact ? 'w-[118px]' : 'w-[148px]')}
        >
          <aside className="flex h-full flex-col border-r border-border/80 bg-background px-2.5 py-3">
            <PreviewTokenTarget token="foreground" onSelect={onTokenSelect}>
              <p className="mb-3 truncate px-2 text-[10px] font-semibold tracking-tight text-foreground">
                {appLabel}
              </p>
            </PreviewTokenTarget>

            <nav className="dashboard-sidebar-nav flex-1 space-y-0">
              <div className="dashboard-sidebar-group">
                <PreviewTokenTarget token="primary" onSelect={onTokenSelect}>
                  <p className="mb-2 px-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Menu
                  </p>
                </PreviewTokenTarget>
                <ul className="flex flex-col gap-0.5">
                  {menuItems.map((label, index) => (
                    <li key={label}>
                      <PreviewTokenTarget
                        token={index === 0 ? 'primary' : 'foreground'}
                        onSelect={onTokenSelect}
                        className="block"
                      >
                        <span
                          className={cn(
                            'dashboard-sidebar-link block px-2.5 py-1.5 text-[9px] font-medium leading-snug',
                            index === 0 ? 'dashboard-sidebar-link-active' : 'text-foreground/80',
                          )}
                        >
                          {label}
                        </span>
                      </PreviewTokenTarget>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dashboard-sidebar-group">
                <PreviewTokenTarget token="primary" onSelect={onTokenSelect}>
                  <p className="mb-2 px-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Academy
                  </p>
                </PreviewTokenTarget>
                <ul className="flex flex-col gap-0.5">
                  {academyItems.map((label) => (
                    <li key={label}>
                      <PreviewTokenTarget token="foreground" onSelect={onTokenSelect} className="block">
                        <span className="dashboard-sidebar-link block px-2.5 py-1.5 text-[9px] font-medium leading-snug text-foreground/80">
                          {label}
                        </span>
                      </PreviewTokenTarget>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>
        </PreviewTokenTarget>

        <div className="flex min-w-0 flex-1 flex-col">
          <PreviewTokenTarget token="border" onSelect={onTokenSelect}>
            <WorkspaceHeader
              className={cn('border-border/80 bg-background px-3', compact ? 'h-8' : 'h-10')}
              leading={
                <PreviewTokenTarget token="foreground" onSelect={onTokenSelect} className="inline-flex">
                  <Menu className="h-3.5 w-3.5 text-foreground" />
                </PreviewTokenTarget>
              }
              trailing={
                <>
                  <PreviewTokenTarget token="primary" onSelect={onTokenSelect} className="inline-flex">
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-2 py-0.5 text-[8px] font-semibold text-primary-foreground shadow-sm">
                      <Shield className="h-2.5 w-2.5 shrink-0" />
                      Super Admin
                    </span>
                  </PreviewTokenTarget>

                  <PreviewTokenTarget token="accent" onSelect={onTokenSelect} className="inline-flex">
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent px-2 py-0.5 text-[8px] font-semibold text-accent-foreground shadow-sm">
                      <Award className="h-2.5 w-2.5 shrink-0" />
                      {themeName?.trim() || 'Pioneer'}
                    </span>
                  </PreviewTokenTarget>

                  <PreviewTokenTarget token="secondary" onSelect={onTokenSelect} className="inline-flex">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[8px] font-semibold text-secondary-foreground">
                      IO
                    </span>
                  </PreviewTokenTarget>
                </>
              }
            />
          </PreviewTokenTarget>

          <PreviewTokenTarget token="background" onSelect={onTokenSelect} className="flex-1">
            <main className={cn('space-y-2.5 bg-background', compact ? 'p-2' : 'p-3')}>
              <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
                <PreviewTokenTarget token="card" onSelect={onTokenSelect}>
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <PreviewTokenTarget token="card-foreground" onSelect={onTokenSelect}>
                      <p className="text-[10px] font-semibold text-card-foreground">Overview</p>
                    </PreviewTokenTarget>
                    <PreviewTokenTarget token="muted-foreground" onSelect={onTokenSelect}>
                      <p className="mt-0.5 text-[8px] text-muted-foreground">Card surface with body text</p>
                    </PreviewTokenTarget>
                  </div>
                </PreviewTokenTarget>

                {!compact ? (
                  <PreviewTokenTarget token="muted" onSelect={onTokenSelect}>
                    <div className="rounded-lg bg-muted p-2.5">
                      <PreviewTokenTarget token="foreground" onSelect={onTokenSelect}>
                        <p className="text-[10px] font-semibold text-foreground">Stats</p>
                      </PreviewTokenTarget>
                      <PreviewTokenTarget token="muted-foreground" onSelect={onTokenSelect}>
                        <p className="mt-0.5 text-[8px] text-muted-foreground">Muted panel background</p>
                      </PreviewTokenTarget>
                    </div>
                  </PreviewTokenTarget>
                ) : null}
              </div>

              {!compact ? (
                <>
                  <div className="flex flex-wrap items-center gap-1.5">
                <PreviewTokenTarget token="primary" onSelect={onTokenSelect} className="inline-flex">
                  <Button size="sm" className="h-6 px-2 text-[9px]">
                    Primary action
                  </Button>
                </PreviewTokenTarget>
                <PreviewTokenTarget token="secondary" onSelect={onTokenSelect} className="inline-flex">
                  <Button size="sm" variant="secondary" className="h-6 px-2 text-[9px]">
                    Secondary
                  </Button>
                </PreviewTokenTarget>
                <PreviewTokenTarget token="border" onSelect={onTokenSelect} className="inline-flex">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[9px]">
                    Outline
                  </Button>
                </PreviewTokenTarget>
              </div>

              <PreviewTokenTarget token="popover" onSelect={onTokenSelect}>
                <div className="inline-flex rounded-md border border-border bg-popover px-2 py-1 shadow-md">
                  <PreviewTokenTarget token="popover-foreground" onSelect={onTokenSelect} className="inline-flex">
                    <span className="flex items-center gap-1 text-[8px] text-popover-foreground">
                      Profile menu
                      <ChevronDown className="h-2.5 w-2.5 opacity-70" />
                    </span>
                  </PreviewTokenTarget>
                </div>
              </PreviewTokenTarget>
                </>
              ) : (
                <PreviewTokenTarget token="primary" onSelect={onTokenSelect} className="inline-flex">
                  <Button size="sm" className="h-6 px-2 text-[9px]">
                    Primary action
                  </Button>
                </PreviewTokenTarget>
              )}
            </main>
          </PreviewTokenTarget>
        </div>
      </div>
    </div>
  )
}
