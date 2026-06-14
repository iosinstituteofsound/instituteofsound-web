import { apiFetch } from './client'

export type PermissionGroup = {
  id: string
  slug: string
  name: string
  description?: string
  sort_order: number
}

export type Permission = {
  id: string
  slug: string
  name: string
  description?: string
  group_id?: string
}

export type Role = {
  id: string
  slug: string
  name: string
  description?: string
  is_system: boolean
  default_route?: string
}

export type AccessPolicy = {
  id: string
  name: string
  priority: number
  is_active: boolean
  conditions: unknown[]
  effect: 'allow' | 'deny'
  permission_slug?: string
  role_slug?: string
}

export async function fetchPermissionCatalog() {
  return apiFetch<{ groups: PermissionGroup[]; permissions: Permission[] }>(
    '/admin/permissions',
  )
}

export async function fetchRoles() {
  return apiFetch<{ roles: Role[] }>('/admin/roles')
}

export async function createRole(input: { name: string; description?: string; slug?: string }) {
  return apiFetch<{ role: Role }>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateRole(
  id: string,
  input: { name?: string; description?: string; permissionSlugs?: string[]; defaultRoute?: string },
) {
  return apiFetch<{ role: Role }>(`/admin/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteRole(id: string) {
  return apiFetch<{ ok: boolean }>(`/admin/roles/${id}`, { method: 'DELETE' })
}

export async function fetchRolePermissions(roleId: string) {
  return apiFetch<{ permissions: { effect: string; permissions: { slug: string; name: string } }[] }>(
    `/admin/roles/${roleId}/permissions`,
  )
}

export async function fetchPolicies() {
  return apiFetch<{ policies: AccessPolicy[] }>('/admin/policies')
}

export async function createPolicy(input: Partial<AccessPolicy>) {
  return apiFetch<{ policy: AccessPolicy }>('/admin/policies', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function searchUsers(q: string) {
  return apiFetch<{ users: { id: string; email: string; name: string; username?: string }[] }>(
    `/admin/users/search?q=${encodeURIComponent(q)}`,
  )
}

export async function assignUserRole(userId: string, roleId: string) {
  return apiFetch(`/admin/users/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ roleId }),
  })
}

export async function revokeUserRole(userId: string, roleId: string) {
  return apiFetch(`/admin/users/${userId}/roles`, {
    method: 'DELETE',
    body: JSON.stringify({ roleId }),
  })
}

export async function fetchUserRoles(userId: string) {
  return apiFetch<{ roles: unknown[] }>(`/admin/users/${userId}/roles`)
}

export async function fetchAuditLogs(limit = 50) {
  return apiFetch<{ logs: unknown[] }>(`/admin/audit-logs?limit=${limit}`)
}

export async function fetchCatalog() {
  return apiFetch<{
    scopes: unknown[]
    resources: unknown[]
    features: unknown[]
    layouts: unknown[]
  }>('/admin/catalog')
}

export async function updatePreferredLayout(layoutId: string) {
  return apiFetch<{
    preferredLayoutId?: string
    activeLayout?: unknown
    availableLayouts?: unknown[]
  }>('/me/layout', {
    method: 'PATCH',
    body: JSON.stringify({ layoutId }),
  })
}

export async function fetchTribes() {
  return apiFetch<{ tribes: unknown[] }>('/admin/tribes')
}

export async function fetchRegions() {
  return apiFetch<{ regions: unknown[] }>('/admin/regions')
}
