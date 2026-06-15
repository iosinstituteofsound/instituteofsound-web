export const DISCOVER_CLICK_ROUTE_NONE = '__none__' as const

export const ROLE_DISCOVER_CLICK_ROUTES = [
  { value: DISCOVER_CLICK_ROUTE_NONE, label: 'No link', apiValue: '' },
  { value: '/profile/{{userId}}', label: 'Public profile', apiValue: '/profile/{{userId}}' },
  { value: '/users/{{userId}}', label: 'Admin user detail', apiValue: '/users/{{userId}}' },
  { value: '/home', label: 'Home feed', apiValue: '/home' },
  { value: '/dashboard', label: 'Dashboard', apiValue: '/dashboard' },
] as const

export type DiscoverClickRouteFormValue = (typeof ROLE_DISCOVER_CLICK_ROUTES)[number]['value']

export function discoverClickRouteToFormValue(apiValue?: string | null): DiscoverClickRouteFormValue {
  const normalized = apiValue?.trim() ?? ''
  if (!normalized) return DISCOVER_CLICK_ROUTE_NONE
  const match = ROLE_DISCOVER_CLICK_ROUTES.find((route) => route.apiValue === normalized)
  return match?.value ?? DISCOVER_CLICK_ROUTE_NONE
}

export function discoverClickRouteToApiValue(formValue?: string | null): string {
  if (!formValue || formValue === DISCOVER_CLICK_ROUTE_NONE) return ''
  const match = ROLE_DISCOVER_CLICK_ROUTES.find((route) => route.value === formValue)
  return match?.apiValue ?? ''
}

export function resolveDiscoverClickRoute(
  template: string | null | undefined,
  user: { id: string; username?: string | null },
): string | null {
  const normalized = template?.trim()
  if (!normalized) return null

  return normalized
    .replace(/\{\{userId\}\}/g, user.id)
    .replace(/\{\{username\}\}/g, user.username?.trim() || user.id)
}
