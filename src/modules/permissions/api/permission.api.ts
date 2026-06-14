import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { ResourceSummary, ScopeSummary } from '@/shared/types/auth.types'

import type { SidebarMenuItemDto } from '@/shared/types/sidebar.types'

export interface FeatureDto {
  id: string
  slug: string
  name: string
  description?: string
  scopeIds: string[]
  resourceIds: string[]
}

export interface LayoutDto {
  id: string
  slug: string
  name: string
  shell: string
  defaultRoute: string
  defaultSidebarItemId?: string
  config: import('@/shared/types/layout.types').LayoutConfig
  sidebarItemIds: string[]
  isActive?: boolean
}

export interface CatalogDto {
  scopes: ScopeSummary[]
  resources: ResourceSummary[]
  features: FeatureDto[]
  layouts: LayoutDto[]
  sidebarItems: SidebarMenuItemDto[]
}

export interface PermissionGroupMeta {
  slug: string
  name: string
}

export interface PermissionItem {
  id: string
  slug: string
  name: string
}

export interface PermissionsResponse {
  groups: PermissionGroupMeta[]
  permissions: PermissionItem[]
}

export function groupPermissionsByCategory(data: PermissionsResponse) {
  const buckets = new Map<string, PermissionItem[]>()
  for (const g of data.groups ?? []) {
    buckets.set(g.slug, [])
  }
  const other: PermissionItem[] = []

  for (const p of data.permissions ?? []) {
    const prefix = p.slug.split('.')[0] ?? ''
    const bucket = buckets.get(prefix)
    if (bucket) bucket.push(p)
    else other.push(p)
  }

  const grouped = (data.groups ?? [])
    .map((g) => ({
      label: g.name,
      slug: g.slug,
      permissions: buckets.get(g.slug) ?? [],
    }))
    .filter((g) => g.permissions.length > 0)

  if (other.length > 0) {
    grouped.push({ label: 'Other', slug: 'other', permissions: other })
  }

  return grouped
}

export interface AuditLogEntry {
  id: string
  action: string
  actorEmail?: string
  targetType?: string
  targetId?: string
  createdAt: string
}

export async function getCatalog() {
  const { data } = await apiClient.get<ApiSuccessResponse<CatalogDto>>(`${API_V1}/admin/catalog`)
  return data.data
}

export async function getPermissions() {
  const { data } = await apiClient.get<ApiSuccessResponse<PermissionsResponse>>(
    `${API_V1}/admin/permissions`,
  )
  return data.data
}

export async function getAuditLogs(limit = 50) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ logs: AuditLogEntry[] }>>(
    `${API_V1}/admin/audit-logs`,
    { params: { limit } },
  )
  return data.data.logs
}
