import { z } from 'zod'

export const profileOverviewSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
})

export const profileBioSchema = z.object({
  bio: z.string().trim().max(500).optional(),
  linkUrl: z.union([z.literal(''), z.string().trim().url('Enter a valid URL')]).optional(),
})

export const profileUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
})

export const profilePrivacySchema = z.object({
  showEmail: z.boolean(),
  showBio: z.boolean(),
  showListeningActivity: z.boolean(),
  allowDirectMessages: z.boolean(),
})

export const profileAccountSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
})

export type ProfileOverviewValues = z.infer<typeof profileOverviewSchema>
export type ProfileBioValues = z.infer<typeof profileBioSchema>
export type ProfileUsernameValues = z.infer<typeof profileUsernameSchema>
export type ProfilePrivacyValues = z.infer<typeof profilePrivacySchema>
export type ProfileAccountValues = z.infer<typeof profileAccountSchema>
