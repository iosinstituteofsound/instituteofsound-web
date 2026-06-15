import { Award, Menu, Shield } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { SIDEBAR_WIDTH_CLASS } from '@/shared/lib/layout-config'
import type { LayoutConfig } from '@/shared/types/layout.types'
import type { SidebarMenuItemDto } from '@/shared/types/sidebar.types'
import { SidebarNavIcon } from '@/modules/sidebar/components/sidebar-nav-icon'
import '@/styles/dashboard-sidebar.css'

interface LayoutDashboardPreviewProps {
  layoutName?: string
  config: LayoutConfig['dashboard']
  sidebarItems?: SidebarMenuItemDto[]
  compact?: boolean
}

function groupSidebarItems(items: SidebarMenuItemDto[]) {
  const groups: { title?: string; items: SidebarMenuItemDto[] }[] = []
  const indexByTitle = new Map<string, number>()

  for (const item of items) {
    const title = item.groupTitle?.trim() || ''
    const existingIndex = indexByTitle.get(title)
    if (existingIndex === undefined) {
      indexByTitle.set(title, groups.length)
      groups.push({ title: title || undefined, items: [item] })
    } else {
      groups[existingIndex]?.items.push(item)
    }
  }

  return groups
}

export function LayoutDashboardPreview({
  layoutName,
  config,
  sidebarItems = [],
  compact = false,
}: LayoutDashboardPreviewProps) {
  const brand = config.header.brandTitle?.trim() || layoutName?.trim() || 'Institute of Sound'
  const groups = groupSidebarItems(sidebarItems)
  const sidebarWidth = compact ? 'w-[118px]' : SIDEBAR_WIDTH_CLASS[config.sidebar.width].expanded

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border/80 shadow-sm', compact && 'rounded-md')}>
      <div className={cn('flex bg-background text-foreground', compact ? 'min-h-[220px]' : 'min-h-[320px]')}>
        {config.sidebar.visible ? (
          <aside className={cn('shrink-0 border-r border-border/80 bg-background px-2.5 py-3', sidebarWidth)}>
            <p className="mb-3 truncate px-2 text-[10px] font-semibold tracking-tight text-foreground">{brand}</p>
            <nav className="dashboard-sidebar-nav space-y-0">
              {groups.map((group) => (
                <div key={group.title ?? 'default'} className="dashboard-sidebar-group">
                  {group.title ? (
                    <p className="mb-2 px-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {group.title}
                    </p>
                  ) : null}
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item, index) => (
                      <li key={item.id}>
                        <span
                          className={cn(
                            'dashboard-sidebar-link flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-medium leading-snug',
                            index === 0 && group === groups[0] ? 'dashboard-sidebar-link-active' : 'text-foreground/80',
                          )}
                        >
                          <SidebarNavIcon icon={item.icon} size="sm" className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {config.header.visible ? (
            <header
              className={cn(
                'flex shrink-0 items-center justify-between border-b border-border/80 bg-background px-3',
                compact ? 'h-8' : 'h-10',
              )}
            >
              {config.header.showMenuToggle ? <Menu className="h-3.5 w-3.5 text-foreground" /> : <span />}
              <div className="flex items-center gap-1.5">
                {config.header.showIdentity ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-2 py-0.5 text-[8px] font-semibold text-primary-foreground">
                      <Shield className="h-2.5 w-2.5" />
                      Super Admin
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent px-2 py-0.5 text-[8px] font-semibold text-accent-foreground">
                      <Award className="h-2.5 w-2.5" />
                      {layoutName?.trim() || 'Badge'}
                    </span>
                  </>
                ) : null}
                {config.header.showProfileMenu ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[8px] font-semibold text-secondary-foreground">
                    IO
                  </span>
                ) : null}
              </div>
            </header>
          ) : null}

          <main className={cn('flex-1 space-y-2 bg-background', compact ? 'p-2' : 'p-3')}>
            <div className="rounded-lg border border-border bg-card p-2.5">
              <p className="text-[10px] font-semibold text-card-foreground">Overview</p>
              <p className="mt-0.5 text-[8px] text-muted-foreground">Main content area</p>
            </div>
            <Button size="sm" className="h-6 px-2 text-[9px]">
              Primary action
            </Button>
          </main>
        </div>
      </div>
    </div>
  )
}
