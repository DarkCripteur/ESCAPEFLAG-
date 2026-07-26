// Liste des Joueurs (Leaderboard) + [AMIS] recherche instantanée par pseudo
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile } from '../services/dataStore.js'
import { publicProfile } from '../services/profileSerializers.js'
import { searchPlayersSchema } from '../validators/friendValidators.js'

export async function listPlayers(_req, res, next) {
  try {
    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(8)
        if (!error && data) {
          return res.json({ players: data.map(publicProfile) })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const profiles = readJsonFile('profiles.json')
    const activePlayers = profiles.slice(-8).reverse().map(publicProfile)
    res.json({ players: activePlayers })
  } catch (error) {
    next(error)
  }
}

export async function searchPlayers(req, res, next) {
  try {
    const { q } = searchPlayersSchema.parse(req.query)

    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').ilike('username', `%${q}%`).limit(10)
        if (!error && data) {
          return res.json({ players: data.filter((p) => p.username).map(publicProfile) })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const profiles = readJsonFile('profiles.json')
    const matches = profiles
      .filter((p) => (p.username || '').toLowerCase().includes(q.toLowerCase()))
      .slice(0, 10)
      .map(publicProfile)
    res.json({ players: matches })
  } catch (error) {
    next(error)
  }
}
