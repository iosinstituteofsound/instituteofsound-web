import { z } from 'zod'

export const createResourceSchema = z.object({
  type: z.enum(['PAGE', 'COMPONENT']),
  name: z.string().trim().min(1, 'Name is required'),
  path: z.string().trim().min(1, 'Path is required'),
})

export type CreateResourceFormValues = z.infer<typeof createResourceSchema>
