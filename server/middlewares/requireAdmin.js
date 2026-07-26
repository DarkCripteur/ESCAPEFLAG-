// Middleware administrateur
import { readJsonFile } from '../services/dataStore.js'
import { configured, supabase } from '../services/supabaseClient.js'

export async function requireAdmin(req, res, next) {
  const userId = req.user.id

  // 1. Vérifier les utilisateurs locaux
  const users = readJsonFile('users.json')
  const localUser = users.find((u) => u.id === userId)
  if (localUser && ['admin', 'moderator'].includes(localUser.role)) {
    req.adminRole = localUser.role
    return next()
  }

  // 2. Vérifier Supabase
  if (configured && supabase) {
    try {
      const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (!error && profile && ['admin', 'moderator'].includes(profile.role)) {
        req.adminRole = profile.role
        return next()
      }
    } catch {
      // Ignorer pour continuer
    }
  }

  return res.status(403).json({ message: 'Accès administrateur requis.' })
}
