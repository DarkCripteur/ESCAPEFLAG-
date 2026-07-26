// [AMIS] Invitations entre joueurs par pseudo : recherche, envoi, acceptation/refus,
// annulation et liste d'amis. Une même ligne `friend_requests` sert de demande en
// attente puis, une fois status='accepted', de relation d'amitié.
import crypto from 'crypto'
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { publicProfile } from '../services/profileSerializers.js'
import { sendFriendRequestSchema } from '../validators/friendValidators.js'

async function getProfilesByIds(ids) {
  if (!ids.length) return new Map()
  if (configured && supabase) {
    const { data, error } = await supabase.from('profiles').select('*').in('id', ids)
    if (!error && data) return new Map(data.map((p) => [p.id, publicProfile(p)]))
  }
  const profiles = readJsonFile('profiles.json')
  return new Map(profiles.filter((p) => ids.includes(p.id)).map((p) => [p.id, publicProfile(p)]))
}

function enrich(request, profilesById) {
  return {
    id: request.id,
    status: request.status,
    createdAt: request.createdAt || request.created_at,
    senderId: request.senderId || request.sender_id,
    receiverId: request.receiverId || request.receiver_id,
    sender: profilesById.get(request.senderId || request.sender_id) || null,
    receiver: profilesById.get(request.receiverId || request.receiver_id) || null,
  }
}

export async function sendRequest(req, res, next) {
  try {
    const { username } = sendFriendRequestSchema.parse(req.body)
    const senderId = req.user.id

    if (configured && supabase) {
      try {
        const { data: receiverProfile } = await supabase.from('profiles').select('id').ilike('username', username).maybeSingle()
        if (!receiverProfile) return res.status(404).json({ message: 'Aucun joueur ne possède ce pseudo.' })
        if (receiverProfile.id === senderId) return res.status(400).json({ message: 'Vous ne pouvez pas vous inviter vous-même.' })

        const { data: existing } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverProfile.id}),and(sender_id.eq.${receiverProfile.id},receiver_id.eq.${senderId})`)
          .maybeSingle()
        if (existing) {
          if (existing.status === 'accepted') return res.status(400).json({ message: 'Vous êtes déjà amis avec ce joueur.' })
          if (existing.status === 'pending') return res.status(400).json({ message: 'Une invitation est déjà en attente avec ce joueur.' })
          // Une précédente demande refusée est réactivée plutôt que d'empêcher tout nouvel envoi.
          const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'pending', sender_id: senderId, receiver_id: receiverProfile.id, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single()
          if (!error && data) return res.status(201).json({ request: data })
        } else {
          const { data, error } = await supabase
            .from('friend_requests')
            .insert({ sender_id: senderId, receiver_id: receiverProfile.id })
            .select()
            .single()
          if (!error && data) return res.status(201).json({ request: data })
        }
      } catch (err) {
        console.warn('Echec envoi invitation Supabase, repli local...', err.message)
      }
    }

    // Repli Local
    const profiles = readJsonFile('profiles.json')
    const receiverProfile = profiles.find((p) => (p.username || '').toLowerCase() === username.toLowerCase())
    if (!receiverProfile) return res.status(404).json({ message: 'Aucun joueur ne possède ce pseudo.' })
    if (receiverProfile.id === senderId) return res.status(400).json({ message: 'Vous ne pouvez pas vous inviter vous-même.' })

    const requests = readJsonFile('friendRequests.json')
    const existingIdx = requests.findIndex(
      (r) => (r.senderId === senderId && r.receiverId === receiverProfile.id) || (r.senderId === receiverProfile.id && r.receiverId === senderId)
    )
    if (existingIdx !== -1) {
      const existing = requests[existingIdx]
      if (existing.status === 'accepted') return res.status(400).json({ message: 'Vous êtes déjà amis avec ce joueur.' })
      if (existing.status === 'pending') return res.status(400).json({ message: 'Une invitation est déjà en attente avec ce joueur.' })
      requests[existingIdx] = { ...existing, status: 'pending', senderId, receiverId: receiverProfile.id, updatedAt: new Date().toISOString() }
      writeJsonFile('friendRequests.json', requests)
      return res.status(201).json({ request: requests[existingIdx] })
    }

    const newRequest = {
      id: crypto.randomUUID(),
      senderId,
      receiverId: receiverProfile.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    requests.push(newRequest)
    writeJsonFile('friendRequests.json', requests)
    res.status(201).json({ request: newRequest })
  } catch (error) {
    next(error)
  }
}

export async function listRequests(req, res, next) {
  try {
    const userId = req.user.id
    let requests = []
    let fromSupabase = false

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .eq('status', 'pending')
        if (!error && data) {
          requests = data
          fromSupabase = true
        }
      } catch {
        // Repli local ci-dessous.
      }
    }
    if (!fromSupabase) {
      const all = readJsonFile('friendRequests.json')
      requests = all.filter((r) => r.status === 'pending' && (r.senderId === userId || r.receiverId === userId))
    }

    const otherIds = requests.map((r) => ((r.senderId || r.sender_id) === userId ? r.receiverId || r.receiver_id : r.senderId || r.sender_id))
    const profilesById = await getProfilesByIds(otherIds)
    const enriched = requests.map((r) => enrich(r, profilesById))

    res.json({
      sent: enriched.filter((r) => r.senderId === userId),
      received: enriched.filter((r) => r.receiverId === userId),
    })
  } catch (error) {
    next(error)
  }
}

export async function listFriends(req, res, next) {
  try {
    const userId = req.user.id
    let requests = []
    let fromSupabase = false

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .eq('status', 'accepted')
        if (!error && data) {
          requests = data
          fromSupabase = true
        }
      } catch {
        // Repli local ci-dessous.
      }
    }
    if (!fromSupabase) {
      const all = readJsonFile('friendRequests.json')
      requests = all.filter((r) => r.status === 'accepted' && (r.senderId === userId || r.receiverId === userId))
    }

    const otherIds = requests.map((r) => ((r.senderId || r.sender_id) === userId ? r.receiverId || r.receiver_id : r.senderId || r.sender_id))
    const profilesById = await getProfilesByIds(otherIds)
    // `friendshipId` est l'id de la ligne friend_requests (status='accepted'), pas
    // l'id du profil : c'est ce qu'attend DELETE /api/friends/requests/:id pour
    // rompre l'amitié.
    const friends = requests
      .map((r, idx) => {
        const profile = profilesById.get(otherIds[idx])
        return profile ? { ...profile, friendshipId: r.id } : null
      })
      .filter(Boolean)

    res.json({ friends })
  } catch (error) {
    next(error)
  }
}

export async function respondToRequest(req, res, next) {
  try {
    const { id } = req.params
    const { action } = req.body
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ message: 'Action invalide.' })
    const nextStatus = action === 'accept' ? 'accepted' : 'declined'
    const userId = req.user.id

    if (configured && supabase) {
      try {
        const { data: existing } = await supabase.from('friend_requests').select('*').eq('id', id).maybeSingle()
        if (!existing) return res.status(404).json({ message: 'Invitation introuvable.' })
        if (existing.receiver_id !== userId) return res.status(403).json({ message: 'Seul le destinataire peut répondre à cette invitation.' })

        const { data, error } = await supabase
          .from('friend_requests')
          .update({ status: nextStatus, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (!error && data) return res.json({ request: data })
      } catch (err) {
        console.warn('Echec réponse invitation Supabase, repli local...', err.message)
      }
    }

    const requests = readJsonFile('friendRequests.json')
    const idx = requests.findIndex((r) => r.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Invitation introuvable.' })
    if (requests[idx].receiverId !== userId) return res.status(403).json({ message: 'Seul le destinataire peut répondre à cette invitation.' })

    requests[idx] = { ...requests[idx], status: nextStatus, updatedAt: new Date().toISOString() }
    writeJsonFile('friendRequests.json', requests)
    res.json({ request: requests[idx] })
  } catch (error) {
    next(error)
  }
}

export async function removeRequest(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id

    if (configured && supabase) {
      try {
        const { data: existing } = await supabase.from('friend_requests').select('*').eq('id', id).maybeSingle()
        if (!existing) return res.status(404).json({ message: 'Invitation introuvable.' })
        if (existing.sender_id !== userId && existing.receiver_id !== userId) {
          return res.status(403).json({ message: 'Action non autorisée.' })
        }
        const { error } = await supabase.from('friend_requests').delete().eq('id', id)
        if (!error) return res.json({ success: true })
      } catch (err) {
        console.warn('Echec suppression invitation Supabase, repli local...', err.message)
      }
    }

    const requests = readJsonFile('friendRequests.json')
    const existing = requests.find((r) => r.id === id)
    if (!existing) return res.status(404).json({ message: 'Invitation introuvable.' })
    if (existing.senderId !== userId && existing.receiverId !== userId) {
      return res.status(403).json({ message: 'Action non autorisée.' })
    }
    writeJsonFile('friendRequests.json', requests.filter((r) => r.id !== id))
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
