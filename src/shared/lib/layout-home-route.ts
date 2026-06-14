import type { LayoutSummary, UserAuthorization } from '@/shared/types/auth.types'

export function getLayoutHomeRoute(authorization?: UserAuthorization | null): string {
  return authorization?.activeLayout?.defaultRoute?.trim() || '/dashboard'
}

export function getLayoutHomeRouteFromLayout(layout?: LayoutSummary | null): string {
  return layout?.defaultRoute?.trim() || '/dashboard'
}
