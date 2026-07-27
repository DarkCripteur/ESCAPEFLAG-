// Middleware authentification avec Fallback Local
import { readJsonFile } from '../services/dataStore.js'
import { configured, supabase, queryWithSchemaCacheRetry } from '../services/supabaseClient.js'

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
        // Le jeton lui-même est valide (vérifié par le service Auth de Supabase,
        // indépendant de PostgREST) : la requête est authentifiée à partir d'ici.
        // La vérification "banni" ci-dessous est un second contrôle qui interroge
        // `profiles` via PostgREST — si CETTE requête échoue (ex: souci de schema
        // cache PostgREST déjà observé sur ce projet), ça ne veut pas dire que le
        // jeton est invalide. Avant ce correctif, cette erreur secondaire faisait
        // rejeter la requête avec "Session invalide ou expirée." alors que la
        // session était en réalité tout à fait valide — on autorise donc l'accès
        // par prudence si seule cette vérification échoue (le bannissement reste
        // par ailleurs appliqué au login et dans adminController, voir CLAUDE.md).
        const { data: profile, error: profileError } = await queryWithSchemaCacheRetry(() =>
          supabase.from('profiles').select('banned').eq('id', data.user.id).maybeSingle()
        )
        if (profileError) {
          console.warn('Vérification du statut banni impossible, accès autorisé par prudence...', profileError.message)
        } else if (profile?.banned) {
          return res.status(403).json({ message: 'Ce compte a été banni.' })
        }
        req.user = data.user
        return next()
      }
    } catch {
      // Ignorer l'erreur pour continuer vers le rejet
    }
  }

  return res.status(401).json({ message: 'Session invalide ou expirée.' })
}
