import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),
  xp: z.number().int().min(0).max(10000000),
  level: z.number().int().min(1).max(1000),
  streak: z.number().int().min(0).max(100000),
  completed: z.number().int().min(0).max(100000),
  challenges: z.number().int().min(0).max(100000),
  bestTime: z.string().regex(/^\d{2}:\d{2}$/),
  country: z.string().trim().max(80),
  countryCode: z.string().trim().max(8),
})
