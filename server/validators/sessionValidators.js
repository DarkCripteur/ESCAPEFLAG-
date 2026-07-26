import { z } from 'zod'

export const modeSchema = z.enum(['solo', 'duel', 'group', 'coop']).default('solo')

export const finishSessionSchema = z.object({
  elapsedSeconds: z.number().int().min(1).max(7200),
  errors: z.number().int().min(0).max(100),
  hintsUsed: z.number().int().min(0).max(30),
  doorsOpened: z.number().int().min(0).max(50),
})
