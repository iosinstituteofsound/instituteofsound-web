export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage'

const ACTION_MAP: Record<PermissionAction, string> = {
  read: 'view',
  create: 'create',
  update: 'edit',
  delete: 'delete',
  manage: 'manage',
}

export function toPermissionSlug(resource: string, action: PermissionAction): string {
  return `${resource}.${ACTION_MAP[action]}`
}

export function matchPermission(permissions: string[], slug: string): boolean {
  if (permissions.includes('*.*')) return true

  const [resource, action] = slug.split('.')
  if (!resource || !action) return false

  const candidates = [
    slug,
    `${resource}.*`,
    `*.${action}`,
  ]

  return candidates.some((c) => permissions.includes(c))
}

export function canAccess(
  permissions: string[],
  isSuperAdmin: boolean,
  resource: string,
  action: PermissionAction,
): boolean {
  if (isSuperAdmin) return true
  return matchPermission(permissions, toPermissionSlug(resource, action))
}

export function canAccessAny(
  permissions: string[],
  isSuperAdmin: boolean,
  checks: Array<[string, PermissionAction]>,
): boolean {
  return checks.some(([resource, action]) => canAccess(permissions, isSuperAdmin, resource, action))
}

export function canAccessAll(
  permissions: string[],
  isSuperAdmin: boolean,
  checks: Array<[string, PermissionAction]>,
): boolean {
  return checks.every(([resource, action]) => canAccess(permissions, isSuperAdmin, resource, action))
}
