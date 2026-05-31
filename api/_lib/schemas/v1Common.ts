import { z } from 'zod'

export const zUuid = z.string().uuid('Invalid id')

export const zSlug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'Invalid slug')

export const zShortText = z.string().trim().max(280)
export const zMediumText = z.string().trim().max(2000)
export const zLongText = z.string().trim().max(10_000)

export const zOptionalUrl = z
  .union([z.string().url('Invalid URL').max(2048), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v && String(v).trim() ? String(v).trim() : undefined))

export const zOptionalUuid = z
  .union([zUuid, z.literal(''), z.null()])
  .optional()
  .transform((v) => (v && String(v).trim() ? String(v) : undefined))

export const zReaction = z.enum(['fire', 'headphones', 'bolt'])

export const zUuidBody = (field: string) =>
  z.object({ [field]: zUuid } as Record<string, typeof zUuid>)

export const zProfileIdBody = z.object({ profileId: zUuid })

export const zProfileIdWithInput = z.object({
  profileId: zUuid,
  input: z.record(z.string(), z.unknown()),
})

export const zIdWithInput = (idField: string) =>
  z.object({
    [idField]: zUuid,
    input: z.record(z.string(), z.unknown()),
  } as Record<string, z.ZodTypeAny>)
