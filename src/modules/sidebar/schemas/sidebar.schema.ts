import { z } from 'zod'

const lucideIconNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[A-Z][a-zA-Z0-9]*$/, 'Icon must be a Lucide PascalCase name')

export const createSidebarItemSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  path: z.string().trim().min(1, 'Path is required'),
  resourceName: z.string().trim().optional(),
  resourceType: z.enum(['PAGE', 'COMPONENT']).optional(),
  permissionResource: z.string().trim().optional(),
  permissionAction: z.enum(['read', 'create', 'update', 'delete', 'manage']).optional(),
  groupTitle: z.string().trim().optional(),
  icon: lucideIconNameSchema.optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export type CreateSidebarItemFormValues = z.infer<typeof createSidebarItemSchema>
