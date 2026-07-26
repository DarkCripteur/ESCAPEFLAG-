// [ADMIN] Tableau de bord, gestion utilisateurs, modération photos/commentaires
// (section 10). Toutes les routes de ce contrôleur sont montées derrière
// requireUser + requireAdmin (voir routes/adminRoutes.js).
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { adminProfile } from '../services/profileSerializers.js'
import { deleteLocalUploadIfPresent } from '../services/uploadService.js'
import { searchUsersSchema, setBanSchema, setRoleSchema } from '../validators/adminValidators.js'

export async function overview(_req, res, next) {
  try {
    if (configured && supabase) {
      try {
        const [profilesResult, sessionsResult, activeResult, photosResult, votesResult, suggestionsResult] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
          supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
          supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('smash_pass_photos').select('*', { count: 'exact', head: true }),
          supabase.from('smash_pass_votes').select('*', { count: 'exact', head: true }),
          supabase.from('suggestions').select('*', { count: 'exact', head: true }),
        ])
        if (!profilesResult.error) {
          return res.json({
            players: profilesResult.data.map(adminProfile),
            metrics: {
              users: profilesResult.data.length,
              sessions: sessionsResult.count || 0,
              activeSessions: activeResult.count || 0,
              photos: photosResult.count || 0,
              votes: votesResult.count || 0,
              bannedUsers: profilesResult.data.filter((p) => p.banned).length,
              suggestions: suggestionsResult.count || 0,
            },
          })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const profiles = readJsonFile('profiles.json')
    const sessions = readJsonFile('sessions.json')
    const photos = readJsonFile('smashPassPhotos.json')
    const votes = readJsonFile('smashPassVotes.json')
    const suggestions = readJsonFile('suggestions.json')
    res.json({
      players: profiles.map(adminProfile),
      metrics: {
        users: profiles.length,
        sessions: sessions.length,
        activeSessions: sessions.filter((s) => s.status === 'active').length,
        photos: photos.length,
        votes: votes.length,
        bannedUsers: profiles.filter((p) => p.banned).length,
        suggestions: suggestions.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

// [ADMIN] Recherche/liste des utilisateurs par nom ou pseudo.
export async function listUsers(req, res, next) {
  try {
    const { q } = searchUsersSchema.parse(req.query)

    if (configured && supabase) {
      try {
        let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200)
        if (q) query = query.or(`username.ilike.%${q}%,name.ilike.%${q}%`)
        const { data, error } = await query
        if (!error && data) return res.json({ users: data.map(adminProfile) })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const profiles = readJsonFile('profiles.json')
    const filtered = q
      ? profiles.filter((p) => (p.username || '').toLowerCase().includes(q.toLowerCase()) || (p.name || '').toLowerCase().includes(q.toLowerCase()))
      : profiles
    res.json({ users: filtered.map(adminProfile) })
  } catch (error) {
    next(error)
  }
}

export async function setUserBan(req, res, next) {
  try {
    const { id } = req.params
    const input = setBanSchema.parse(req.body)
    if (id === req.user.id) return res.status(400).json({ message: 'Vous ne pouvez pas vous bannir vous-même.' })

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ banned: input.banned, banned_reason: input.banned ? input.reason || null : null })
          .eq('id', id)
          .select()
          .single()
        if (!error && data) return res.json({ user: adminProfile(data) })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const profiles = readJsonFile('profiles.json')
    const idx = profiles.findIndex((p) => p.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    profiles[idx] = { ...profiles[idx], banned: input.banned, bannedReason: input.banned ? input.reason || '' : '' }
    writeJsonFile('profiles.json', profiles)

    const users = readJsonFile('users.json')
    const userIdx = users.findIndex((u) => u.id === id)
    if (userIdx !== -1) {
      users[userIdx] = { ...users[userIdx], banned: input.banned }
      writeJsonFile('users.json', users)
    }

    res.json({ user: adminProfile(profiles[idx]) })
  } catch (error) {
    next(error)
  }
}

export async function setUserRole(req, res, next) {
  try {
    const { id } = req.params
    const input = setRoleSchema.parse(req.body)
    // Seul un administrateur (pas un modérateur) peut changer les rôles.
    if (req.adminRole !== 'admin') return res.status(403).json({ message: 'Seul un administrateur peut modifier les rôles.' })
    if (id === req.user.id) return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre rôle.' })

    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').update({ role: input.role }).eq('id', id).select().single()
        if (!error && data) return res.json({ user: adminProfile(data) })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const profiles = readJsonFile('profiles.json')
    const idx = profiles.findIndex((p) => p.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    profiles[idx] = { ...profiles[idx], role: input.role }
    writeJsonFile('profiles.json', profiles)

    const users = readJsonFile('users.json')
    const userIdx = users.findIndex((u) => u.id === id)
    if (userIdx !== -1) {
      users[userIdx] = { ...users[userIdx], role: input.role }
      writeJsonFile('users.json', users)
    }

    res.json({ user: adminProfile(profiles[idx]) })
  } catch (error) {
    next(error)
  }
}

// Résout un lot d'ids de profils en { id -> pseudo }, pour afficher qui a uploadé une
// photo / posté un commentaire dans la console d'admin sans jointure SQL explicite.
async function getUsernamesByIds(ids) {
  const uniqueIds = [...new Set(ids)].filter(Boolean)
  if (!uniqueIds.length) return {}
  if (configured && supabase) {
    const { data } = await supabase.from('profiles').select('id, username, name').in('id', uniqueIds)
    return Object.fromEntries((data || []).map((p) => [p.id, p.username || p.name]))
  }
  const profiles = readJsonFile('profiles.json')
  return Object.fromEntries(profiles.filter((p) => uniqueIds.includes(p.id)).map((p) => [p.id, p.username || p.name]))
}

// [ADMIN] Gestion photos : toutes les photos, pas seulement celles de l'admin.
export async function listAllPhotos(_req, res, next) {
  try {
    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('smash_pass_photos').select('*').order('created_at', { ascending: false }).limit(200)
        if (!error && data) {
          const usernames = await getUsernamesByIds(data.map((p) => p.uploader_id))
          return res.json({ photos: data.map((p) => ({ ...p, uploaderUsername: usernames[p.uploader_id] || 'Inconnu' })) })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }
    const photos = readJsonFile('smashPassPhotos.json').slice().reverse().slice(0, 200)
    const usernames = await getUsernamesByIds(photos.map((p) => p.uploaderId))
    res.json({ photos: photos.map((p) => ({ ...p, uploaderUsername: usernames[p.uploaderId] || 'Inconnu' })) })
  } catch (error) {
    next(error)
  }
}

export async function deleteAnyPhoto(req, res, next) {
  try {
    const { id } = req.params

    if (configured && supabase) {
      try {
        const { data: photo } = await supabase.from('smash_pass_photos').select('*').eq('id', id).maybeSingle()
        if (!photo) return res.status(404).json({ message: 'Photo introuvable.' })
        const { error } = await supabase.from('smash_pass_photos').delete().eq('id', id)
        if (!error) {
          deleteLocalUploadIfPresent(photo.image_url)
          return res.json({ success: true })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const photos = readJsonFile('smashPassPhotos.json')
    const photo = photos.find((p) => p.id === id)
    if (!photo) return res.status(404).json({ message: 'Photo introuvable.' })
    writeJsonFile('smashPassPhotos.json', photos.filter((p) => p.id !== id))
    const votes = readJsonFile('smashPassVotes.json')
    writeJsonFile('smashPassVotes.json', votes.filter((v) => v.photoId !== id))
    deleteLocalUploadIfPresent(photo.imageUrl)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// [ADMIN] Gestion commentaires : les votes Smash or Pass qui portent un commentaire.
export async function listAllComments(_req, res, next) {
  try {
    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('smash_pass_votes')
          .select('*')
          .not('comment', 'is', null)
          .neq('comment', '')
          .order('created_at', { ascending: false })
          .limit(200)
        if (!error && data) {
          const usernames = await getUsernamesByIds(data.map((v) => v.voter_id))
          return res.json({ comments: data.map((v) => ({ ...v, voterUsername: usernames[v.voter_id] || 'Inconnu' })) })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }
    const votes = readJsonFile('smashPassVotes.json').filter((v) => v.comment).slice().reverse().slice(0, 200)
    const usernames = await getUsernamesByIds(votes.map((v) => v.voterId))
    res.json({ comments: votes.map((v) => ({ ...v, voterUsername: usernames[v.voterId] || 'Inconnu' })) })
  } catch (error) {
    next(error)
  }
}

export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params

    if (configured && supabase) {
      try {
        const { error } = await supabase.from('smash_pass_votes').update({ comment: null }).eq('id', id)
        if (!error) return res.json({ success: true })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const votes = readJsonFile('smashPassVotes.json')
    const idx = votes.findIndex((v) => v.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Commentaire introuvable.' })
    votes[idx] = { ...votes[idx], comment: '' }
    writeJsonFile('smashPassVotes.json', votes)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
