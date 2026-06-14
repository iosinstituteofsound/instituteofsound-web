import { z } from 'zod'

export const devLoginSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
})

export type DevLoginFormValues = z.infer<typeof devLoginSchema>
