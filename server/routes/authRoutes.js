// [LOGIN] [REGISTER]
import { Router } from 'express'
import { login, register, resend } from '../controllers/authController.js'

export const authRoutes = Router()

authRoutes.get('/auth/login', (_req, res) => {
  res.status(405).json({ message: 'Cet endpoint d’API requiert une requête POST. Accédez à l’application web sur http://localhost:5173' })
})
authRoutes.post('/auth/login', login)
authRoutes.post('/auth/register', register)
authRoutes.post('/auth/resend', resend)
