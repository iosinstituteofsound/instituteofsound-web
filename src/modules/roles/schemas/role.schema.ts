import { z } from 'zod'
import { ROLE_DISCOVER_CATEGORIES } from '@/shared/data/role-discover-categories'
import {
  DISCOVER_CLICK_ROUTE_NONE,
  ROLE_DISCOVER_CLICK_ROUTES,
  discoverClickRouteToApiValue,
} from '@/shared/data/role-discover-click-routes'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')

const discoverCategorySchema = z.enum(
  ROLE_DISCOVER_CATEGORIES.map((category) => category.id) as [
    (typeof ROLE_DISCOVER_CATEGORIES)[number]['id'],
    ...(typeof ROLE_DISCOVER_CATEGORIES)[number]['id'][],
  ],
)

const discoverClickRouteFormSchema = z.enum(
  ROLE_DISCOVER_CLICK_ROUTES.map((route) => route.value) as [
    (typeof ROLE_DISCOVER_CLICK_ROUTES)[number]['value'],
    ...(typeof ROLE_DISCOVER_CLICK_ROUTES)[number]['value'][],
  ],
)

const discoverClickRouteSchema = discoverClickRouteFormSchema
  .optional()
  .default(DISCOVER_CLICK_ROUTE_NONE)
  .transform(discoverClickRouteToApiValue)

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
  discoverClickRoute: discoverClickRouteSchema,
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
  discoverClickRoute: discoverClickRouteFormSchema
    .optional()
    .transform((value) => (value === undefined ? undefined : discoverClickRouteToApiValue(value))),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>
