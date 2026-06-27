export const HEADER_NAV_PATHS = new Set(['/home', '/feed', '/reels', '/dashboard'])

export type HeaderNavTab = {
  label: string
  path: string
  icon: string
  resourceName: string
  permission?: { resource: string; action: 'read' | 'create' | 'update' | 'delete' | 'manage' }
}

export const HEADER_NAV_TABS: HeaderNavTab[] = [
  {
    label: 'Feed',
    path: '/home',
    icon: 'Rss',
    resourceName: 'FeedPage',
    permission: { resource: 'feed', action: 'read' },
  },
  {
    label: 'Reels',
    path: '/reels',
    icon: 'Clapperboard',
    resourceName: 'FeedPage',
    permission: { resource: 'feed', action: 'read' },
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    resourceName: 'DashboardPage',
  },
]

export function isHeaderNavTabActive(pathname: string, tabPath: string): boolean {
  if (tabPath === '/home') {
    return pathname === '/home' || pathname === '/feed' || pathname.startsWith('/feed/')
  }
  return pathname === tabPath || pathname.startsWith(`${tabPath}/`)
}
