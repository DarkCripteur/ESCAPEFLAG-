// Sessions de jeu
import crypto from 'crypto'
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { modeSchema, finishSessionSchema } from '../validators/sessionValidators.js'

export async function createSession(req, res, next) {
  try {
    const mode = modeSchema.parse(req.body?.mode || 'solo')

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .insert({ user_id: req.user.id, mode, status: 'active', started_at: new Date().toISOString() })
          .select()
          .single()
        if (!error && data) {
          return res.status(201).json({ session: data })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const sessions = readJsonFile('sessions.json')
    const newSession = {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      mode,
      status: 'active',
      started_at: new Date().toISOString(),
    }
    sessions.push(newSession)
    writeJsonFile('sessions.json', sessions)
    res.status(201).json({ session: newSession })
  } catch (error) {
    next(error)
  }
}

export async function finishSession(req, res, next) {
  try {
    const score = finishSessionSchema.parse(req.body)

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .update({
            elapsed_seconds: score.elapsedSeconds,
            errors: score.errors,
            hints_used: score.hintsUsed,
            doors_opened: score.doorsOpened,
            status: 'finished',
            finished_at: new Date().toISOString(),
          })
          .eq('id', req.params.id)
          .eq('user_id', req.user.id)
          .eq('status', 'active')
          .select()
          .single()

        if (!error && data) {
          return res.json({ session: data })
        }
      } catch {
        // Repli local ci-dessous.
      }
    }

    const sessions = readJsonFile('sessions.json')
    const idx = sessions.findIndex((s) => s.id === req.params.id && s.user_id === req.user.id && s.status === 'active')
    if (idx !== -1) {
      sessions[idx] = {
        ...sessions[idx],
        elapsed_seconds: score.elapsedSeconds,
        errors: score.errors,
        hints_used: score.hintsUsed,
        doors_opened: score.doorsOpened,
        status: 'finished',
        finished_at: new Date().toISOString(),
      }
      writeJsonFile('sessions.json', sessions)
      return res.json({ session: sessions[idx] })
    }

    res.status(404).json({ message: 'Session active introuvable.' })
  } catch (error) {
    next(error)
  }
}
