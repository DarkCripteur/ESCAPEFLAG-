// [LOGIN] [REGISTER] Schémas Zod pour l'authentification par pseudo.
import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(3, 'Veuillez saisir votre pseudo.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
})

const usernamePattern = /^[a-zA-Z0-9_]{3,24}$/

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  username: z.string().trim().regex(usernamePattern, 'Le pseudo doit contenir entre 3 et 24 caractères (lettres, chiffres, underscore).'),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z.string().trim().min(1, 'Le numéro de téléphone est requis.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  country: z.string().trim().default('Sénégal'),
  countryCode: z.string().trim().default('+221'),
  avatar: z.string().trim().optional(),
})

export const resendSchema = z.object({ email: z.string().trim().email() })
