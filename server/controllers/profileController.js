// Mettre à jour le Profil
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { publicProfile } from '../services/profileSerializers.js'
import { updateProfileSchema } from '../validators/profileValidators.js'

export async function updateProfile(req, res, next) {
  try {
    if (req.params.id !== req.user.id) return res.status(403).json({ message: 'Modification non autorisée.' })

    const input = updateProfileSchema.parse(req.body)

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            name: input.name,
            xp: input.xp,
            level: input.level,
            streak: input.streak,
            completed: input.completed,
            challenges: input.challenges,
            best_time: input.bestTime,
            country: input.country,
            country_code: input.countryCode,
            updated_at: new Date().toISOString(),
          })
          .eq('id', req.user.id)
          .select()
          .single()

        if (!error && data) {
          return res.json({ profile: publicProfile(data) })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const profiles = readJsonFile('profiles.json')
    const idx = profiles.findIndex((p) => p.id === req.user.id)
    if (idx !== -1) {
      profiles[idx] = {
        ...profiles[idx],
        name: input.name,
        xp: input.xp,
        level: input.level,
        streak: input.streak,
        completed: input.completed,
        challenges: input.challenges,
        bestTime: input.bestTime,
        country: input.country,
        countryCode: input.countryCode,
        updatedAt: new Date().toISOString(),
      }
      writeJsonFile('profiles.json', profiles)
      return res.json({ profile: publicProfile(profiles[idx]) })
    }

    res.status(404).json({ message: 'Profil introuvable.' })
  } catch (error) {
    next(error)
  }
}
