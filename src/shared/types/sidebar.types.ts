export interface SidebarMenuItemDto {
  id: string
  label: string
  path: string
  resourceName?: string
  resourceType?: 'PAGE' | 'COMPONENT'
  permissionResource?: string
  permissionAction?: 'read' | 'create' | 'update' | 'delete' | 'manage'
  groupTitle?: string
  sortOrder: number
  isActive?: boolean
  icon?: string
}

export interface CreateSidebarItemInput {
  label: string
  path: string
  resourceName?: string
  resourceType?: 'PAGE' | 'COMPONENT'
  permissionResource?: string
  permissionAction?: 'read' | 'create' | 'update' | 'delete' | 'manage'
  groupTitle?: string
  sortOrder?: number
  icon?: string
}

export interface UpdateSidebarItemInput {
  label?: string
  path?: string
  resourceName?: string | null
  resourceType?: 'PAGE' | 'COMPONENT'
  permissionResource?: string | null
  permissionAction?: 'read' | 'create' | 'update' | 'delete' | 'manage' | null
  groupTitle?: string | null
  sortOrder?: number
  isActive?: boolean
  icon?: string | null
}
