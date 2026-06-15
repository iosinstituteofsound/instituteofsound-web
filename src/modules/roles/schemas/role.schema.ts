import { z } from 'zod'
import { ROLE_DISCOVER_CATEGORIES } from '@/shared/data/role-discover-categories'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')

const discoverCategorySchema = z.enum(
  ROLE_DISCOVER_CATEGORIES.map((category) => category.id) as [
    (typeof ROLE_DISCOVER_CATEGORIES)[number]['id'],
    ...(typeof ROLE_DISCOVER_CATEGORIES)[number]['id'][],
  ],
)

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  layoutId: objectId,
  featureIds: z.array(objectId).optional(),
  extraScopeIds: z.array(objectId).optional(),
  extraResourceIds: z.array(objectId).optional(),
  discoverable: z.boolean().optional().default(false),
  discoverCategory: discoverCategorySchema.optional().default('other'),
})

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  layoutId: objectId.optional(),
  featureIds: z.array(objectId).optional(),
  extraScopeIds: z.array(objectId).optional(),
  extraResourceIds: z.array(objectId).optional(),
  permissionSlugs: z.array(z.string().trim().min(1)).optional(),
  discoverable: z.boolean().optional(),
  discoverCategory: discoverCategorySchema.optional(),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>
