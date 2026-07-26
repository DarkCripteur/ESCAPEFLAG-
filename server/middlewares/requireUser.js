// Middleware authentification avec Fallback Local
import { readJsonFile } from '../services/dataStore.js'
import { configured, supabase } from '../services/supabaseClient.js'

export async function requireUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ message: 'Authentification requise.' })

  // 1. Tenter l'authentification locale
  if (token.startsWith('local-token-')) {
    const userId = token.replace('local-token-', '')
    const users = readJsonFile('users.json')
    const user = users.find((u) => u.id === userId)
    if (user) {
      // [ADMIN] Un compte banni perd l'accès immédiatement, même avec un jeton valide.
      if (user.banned) return res.status(403).json({ message: 'Ce compte a été banni.' })
      req.user = user
      return next()
    }
  }

  // 2. Fallback Supabase
  if (configured && supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data.user) {
        const { data: profile } = await supabase.from('profiles').select('banned').eq('id', data.user.id).maybeSingle()
        if (profile?.banned) return res.status(403).json({ message: 'Ce compte a été banni.' })
        req.user = data.user
        return next()
      }
    } catch {
      // Ignorer l'erreur pour continuer vers le rejet
    }
  }

  return res.status(401).json({ message: 'Session invalide ou expirée.' })
}
