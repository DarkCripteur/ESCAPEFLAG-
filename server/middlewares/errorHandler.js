import { z } from 'zod'

export function errorHandler(error, _req, res, _next) {
  if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0]?.message || 'Données invalides.' })
  console.error(error)
  res.status(500).json({ message: 'Erreur serveur.' })
}
