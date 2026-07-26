// [SUGGESTIONS] Formulaire de suggestion (section 11) : toujours persisté, e-mail
// envoyé en plus si RESEND_API_KEY est configurée.
import crypto from 'crypto'
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { emailConfigured, sendSuggestionEmail } from '../services/emailService.js'
import { submitSuggestionSchema } from '../validators/suggestionValidators.js'

export async function submitSuggestion(req, res, next) {
  try {
    const { message } = submitSuggestionSchema.parse(req.body)
    const userId = req.user.id
    const name = req.user.name || req.user.user_metadata?.name || 'Joueur'
    const email = req.user.email || req.user.user_metadata?.email || ''
    // `req.ip` reflète X-Forwarded-For une fois `trust proxy` activé (app.js) — utile
    // derrière un hébergeur avec reverse proxy (Render, Vercel...). Sinon repli sur
    // l'en-tête brut, puis sur l'adresse socket directe.
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || ''
    const userAgent = req.headers['user-agent'] || ''
    const createdAt = new Date().toISOString()

    let emailed = false
    try {
      const result = await sendSuggestionEmail({ name, email, message, ip, userAgent, createdAt })
      emailed = result.sent
    } catch (err) {
      console.warn('Echec envoi e-mail de suggestion (persistée quand même) :', err.message)
    }

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('suggestions')
          .insert({ user_id: userId, name, email, message, emailed })
          .select()
          .single()
        if (!error && data) return res.status(201).json({ suggestion: data, emailSent: emailed, emailConfigured })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const suggestions = readJsonFile('suggestions.json')
    const suggestion = { id: crypto.randomUUID(), userId, name, email, message, emailed, createdAt }
    suggestions.push(suggestion)
    writeJsonFile('suggestions.json', suggestions)
    res.status(201).json({ suggestion, emailSent: emailed, emailConfigured })
  } catch (error) {
    next(error)
  }
}

// [ADMIN]
export async function listSuggestions(_req, res, next) {
  try {
    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false }).limit(200)
        if (!error && data) return res.json({ suggestions: data })
      } catch {
        // Repli local ci-dessous.
      }
    }
    const suggestions = readJsonFile('suggestions.json')
    res.json({ suggestions: [...suggestions].reverse().slice(0, 200) })
  } catch (error) {
    next(error)
  }
}
