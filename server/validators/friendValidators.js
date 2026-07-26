import { z } from 'zod'

export const searchPlayersSchema = z.object({
  q: z.string().trim().min(1).max(24),
})

export const sendFriendRequestSchema = z.object({
  username: z.string().trim().min(3).max(24),
})
