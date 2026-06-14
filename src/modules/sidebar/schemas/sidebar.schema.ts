import { z } from 'zod'

export const createSidebarItemSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  path: z.string().trim().min(1, 'Path is required'),
  resourceName: z.string().trim().optional(),
  resourceType: z.enum(['PAGE', 'COMPONENT']).optional(),
  permissionResource: z.string().trim().optional(),
  permissionAction: z.enum(['read', 'create', 'update', 'delete', 'manage']).optional(),
  groupTitle: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export type CreateSidebarItemFormValues = z.infer<typeof createSidebarItemSchema>
