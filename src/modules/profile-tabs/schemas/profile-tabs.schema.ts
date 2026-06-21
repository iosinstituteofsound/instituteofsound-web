import { z } from 'zod'

export const createProfileTabSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'Slug is required')
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens'),
  label: z.string().trim().min(1, 'Display name is required').max(80),
  panelKey: z.enum([
    'overview',
    'all',
    'posts',
    'about',
    'photos',
    'discography',
    'artist-submissions',
    'editorial',
    'editor-drafts',
    'editor-wire',
    'editor-submissions',
    'curator-overview',
  ]),
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export type CreateProfileTabFormValues = z.infer<typeof createProfileTabSchema>

