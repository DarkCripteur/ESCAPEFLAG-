import { z } from 'zod'

export const submitSuggestionSchema = z.object({
  message: z.string().trim().min(10, 'Votre suggestion doit contenir au moins 10 caractères.').max(2000),
})
