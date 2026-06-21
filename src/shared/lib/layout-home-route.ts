import type { LayoutSummary, UserAuthorization } from '@/shared/types/auth.types'
import { resolveIsSuperAdmin } from '@/shared/services/permission/super-admin'

const ROUTE_BY_RESOURCE: Record<string, string> = {
  FeedPage: '/home',
  DashboardPage: '/dashboard',
  ExplorePage: '/explore',
  ReleasesPage: '/releases',
  EditorDashboardPage: '/editor',
  ArtistDashboardPage: '/artist',
  LabelDashboardPage: '/label',
  AdminTracksPage: '/music/tracks',
}

function routeForResource(name: string, authorization?: UserAuthorization | null): string | undefined {
  const fromCatalog = authorization?.resources?.find((resource) => resource.name === name)?.path
  return fromCatalog?.trim() || ROUTE_BY_RESOURCE[name]
}

function canAccessRoute(route: string, authorization?: UserAuthorization | null): boolean {
  if (!authorization || resolveIsSuperAdmin(authorization)) return true

  const resourceNames = new Set(authorization.resourceNames ?? [])
  const resourceForRoute = authorization.resources?.find((resource) => resource.path === route)
  if (resourceForRoute) return resourceNames.has(resourceForRoute.name)

  const resourceName = Object.entries(ROUTE_BY_RESOURCE).find(([, path]) => path === route)?.[0]
  if (!resourceName) return true

  return resourceNames.has(resourceName)
}

function resolveAccessibleHomeRoute(authorization?: UserAuthorization | null): string {
  if (!authorization) return '/explore'

  const preferred = authorization.activeLayout?.defaultRoute?.trim()
  if (preferred && canAccessRoute(preferred, authorization)) {
    return preferred
  }

  const resourceNames = new Set(authorization.resourceNames ?? [])
  const navItems = authorization.activeLayout?.navGroups?.flatMap((group) => group.items) ?? []

  for (const item of navItems) {
    if (!item.resourceName || !resourceNames.has(item.resourceName)) continue
    const route = routeForResource(item.resourceName, authorization)
    if (route) return route
  }

  for (const resource of authorization.resources ?? []) {
    if (resourceNames.has(resource.name) && resource.path?.trim()) {
      return resource.path.trim()
    }
  }

  return '/explore'
}

export function getLayoutHomeRoute(authorization?: UserAuthorization | null): string {
  return resolveAccessibleHomeRoute(authorization)
}

export function getLayoutHomeRouteFromLayout(
  layout?: LayoutSummary | null,
  authorization?: UserAuthorization | null,
): string {
  if (authorization) {
    return resolveAccessibleHomeRoute({
      ...authorization,
      activeLayout: layout ?? authorization.activeLayout,
    })
  }

  return layout?.defaultRoute?.trim() || '/explore'
}
