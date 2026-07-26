import { z } from 'zod'

export const castVoteSchema = z.object({
  photoId: z.string().trim().min(1, 'Photo invalide.'),
  choice: z.enum(['smash', 'pass']),
  comment: z.string().trim().max(300).optional(),
})
