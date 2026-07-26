import { z } from 'zod'

export const searchUsersSchema = z.object({
  q: z.string().trim().max(50).optional().default(''),
})

export const setBanSchema = z.object({
  banned: z.boolean(),
  reason: z.string().trim().max(200).optional(),
})

export const setRoleSchema = z.object({
  role: z.enum(['player', 'moderator', 'admin']),
})
