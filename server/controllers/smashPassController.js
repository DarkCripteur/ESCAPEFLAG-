// [SMASH OR PASS] Upload de photos + votes Smash/Pass (sections 8-9).
import crypto from 'crypto'
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { storeUploadedPhoto, deleteLocalUploadIfPresent } from '../services/uploadService.js'
import { castVoteSchema } from '../validators/smashPassValidators.js'

export async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image reçue.' })
    const imageUrl = await storeUploadedPhoto(req.file)
    const uploaderId = req.user.id

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('smash_pass_photos')
          .insert({ uploader_id: uploaderId, image_url: imageUrl })
          .select()
          .single()
        if (!error && data) return res.status(201).json({ photo: data })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const photos = readJsonFile('smashPassPhotos.json')
    const photo = { id: crypto.randomUUID(), uploaderId, imageUrl, createdAt: new Date().toISOString() }
    photos.push(photo)
    writeJsonFile('smashPassPhotos.json', photos)
    res.status(201).json({ photo })
  } catch (error) {
    next(error)
  }
}

export async function getFeed(req, res, next) {
  try {
    const userId = req.user.id
    const limit = 20

    if (configured && supabase) {
      try {
        const { data: votes } = await supabase.from('smash_pass_votes').select('photo_id').eq('voter_id', userId)
        const votedIds = (votes || []).map((v) => v.photo_id)
        let query = supabase.from('smash_pass_photos').select('*').neq('uploader_id', userId).order('created_at', { ascending: false }).limit(100)
        const { data, error } = await query
        if (!error && data) {
          const remaining = data.filter((p) => !votedIds.includes(p.id))
          return res.json({ photos: shuffle(remaining).slice(0, limit) })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const photos = readJsonFile('smashPassPhotos.json')
    const votes = readJsonFile('smashPassVotes.json')
    const votedIds = votes.filter((v) => v.voterId === userId).map((v) => v.photoId)
    const remaining = photos.filter((p) => p.uploaderId !== userId && !votedIds.includes(p.id))
    res.json({ photos: shuffle(remaining).slice(0, limit) })
  } catch (error) {
    next(error)
  }
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5)
}

export async function castVote(req, res, next) {
  try {
    const input = castVoteSchema.parse(req.body)
    const voterId = req.user.id

    if (configured && supabase) {
      try {
        const { data: photo } = await supabase.from('smash_pass_photos').select('uploader_id').eq('id', input.photoId).maybeSingle()
        if (!photo) return res.status(404).json({ message: 'Photo introuvable.' })
        if (photo.uploader_id === voterId) return res.status(400).json({ message: 'Vous ne pouvez pas voter sur votre propre photo.' })

        const { data, error } = await supabase
          .from('smash_pass_votes')
          .insert({ photo_id: input.photoId, voter_id: voterId, choice: input.choice, comment: input.comment || null })
          .select()
          .single()
        if (!error && data) return res.status(201).json({ vote: data })
        if (error?.code === '23505') return res.status(400).json({ message: 'Vous avez déjà voté sur cette photo.' })
      } catch (err) {
        console.warn('Echec vote Supabase, repli local...', err.message)
      }
    }

    const photos = readJsonFile('smashPassPhotos.json')
    const photo = photos.find((p) => p.id === input.photoId)
    if (!photo) return res.status(404).json({ message: 'Photo introuvable.' })
    if (photo.uploaderId === voterId) return res.status(400).json({ message: 'Vous ne pouvez pas voter sur votre propre photo.' })

    const votes = readJsonFile('smashPassVotes.json')
    if (votes.some((v) => v.photoId === input.photoId && v.voterId === voterId)) {
      return res.status(400).json({ message: 'Vous avez déjà voté sur cette photo.' })
    }

    const vote = {
      id: crypto.randomUUID(),
      photoId: input.photoId,
      voterId,
      choice: input.choice,
      comment: input.comment || '',
      createdAt: new Date().toISOString(),
    }
    votes.push(vote)
    writeJsonFile('smashPassVotes.json', votes)
    res.status(201).json({ vote })
  } catch (error) {
    next(error)
  }
}

export async function listMine(req, res, next) {
  try {
    const userId = req.user.id

    if (configured && supabase) {
      try {
        const { data: photos, error } = await supabase.from('smash_pass_photos').select('*').eq('uploader_id', userId).order('created_at', { ascending: false })
        if (!error && photos) {
          const { data: votes } = await supabase.from('smash_pass_votes').select('photo_id, choice').in('photo_id', photos.map((p) => p.id))
          return res.json({ photos: photos.map((p) => withTally(p, votes || [], 'photo_id')) })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const photos = readJsonFile('smashPassPhotos.json').filter((p) => p.uploaderId === userId)
    const votes = readJsonFile('smashPassVotes.json')
    res.json({ photos: photos.map((p) => withTally(p, votes, 'photoId', 'id')) })
  } catch (error) {
    next(error)
  }
}

function withTally(photo, votes, photoKey, idKey = 'id') {
  const photoVotes = votes.filter((v) => v[photoKey] === photo[idKey])
  return {
    ...photo,
    smashCount: photoVotes.filter((v) => v.choice === 'smash').length,
    passCount: photoVotes.filter((v) => v.choice === 'pass').length,
  }
}

export async function deletePhoto(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id

    if (configured && supabase) {
      try {
        const { data: photo } = await supabase.from('smash_pass_photos').select('*').eq('id', id).maybeSingle()
        if (!photo) return res.status(404).json({ message: 'Photo introuvable.' })
        if (photo.uploader_id !== userId) return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres photos.' })
        const { error } = await supabase.from('smash_pass_photos').delete().eq('id', id)
        if (!error) {
          deleteLocalUploadIfPresent(photo.image_url)
          return res.json({ success: true })
        }
      } catch (err) {
        console.warn('Echec suppression Supabase, repli local...', err.message)
      }
    }

    const photos = readJsonFile('smashPassPhotos.json')
    const photo = photos.find((p) => p.id === id)
    if (!photo) return res.status(404).json({ message: 'Photo introuvable.' })
    if (photo.uploaderId !== userId) return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres photos.' })

    writeJsonFile('smashPassPhotos.json', photos.filter((p) => p.id !== id))
    const votes = readJsonFile('smashPassVotes.json')
    writeJsonFile('smashPassVotes.json', votes.filter((v) => v.photoId !== id))
    deleteLocalUploadIfPresent(photo.imageUrl)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
