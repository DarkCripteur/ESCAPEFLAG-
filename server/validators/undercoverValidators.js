import { z } from 'zod'

export const recordMatchSchema = z.object({
  mode: z.enum(['local', 'online']),
  winner: z.string().trim().min(1).max(60),
  civilWord: z.string().trim().min(1).max(60),
  undercoverWord: z.string().trim().min(1).max(60),
  players: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        role: z.string().trim().max(20),
        eliminated: z.boolean(),
      })
    )
    .max(30),
})

export const sendGameInviteSchema = z.object({
  roomId: z.string().trim().min(4).max(10),
  senderName: z.string().trim().min(1).max(60),
  receiverId: z.string().trim().min(1),
})
