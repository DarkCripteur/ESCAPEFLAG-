// [SUGGESTIONS] Formulaire de suggestion (section 11) : toujours persisté, message
// WhatsApp envoyé en plus si Twilio est configuré (voir whatsappService.js). Remplace
// l'envoi par e-mail — l'équipe reçoit désormais l'alerte directement sur WhatsApp.
import crypto from 'crypto'
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { whatsappConfigured, sendSuggestionWhatsapp } from '../services/whatsappService.js'
import { submitSuggestionSchema } from '../validators/suggestionValidators.js'

export async function submitSuggestion(req, res, next) {
  try {
    const { message } = submitSuggestionSchema.parse(req.body)
    const userId = req.user.id
    const name = req.user.name || req.user.user_metadata?.name || 'Joueur'
    const email = req.user.email || req.user.user_metadata?.email || ''
    const createdAt = new Date().toISOString()

    // Nom de champ conservé tel quel (`emailed`) côté base de données pour éviter une
    // migration Supabase : il représente désormais "notification envoyée" (WhatsApp),
    // pas spécifiquement un e-mail.
    let notified = false
    try {
      const result = await sendSuggestionWhatsapp({ name, message, createdAt })
      notified = result.sent
    } catch (err) {
      console.warn('Echec envoi WhatsApp de suggestion (persistée quand même) :', err.message)
    }

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('suggestions')
          .insert({ user_id: userId, name, email, message, emailed: notified })
          .select()
          .single()
        if (!error && data) return res.status(201).json({ suggestion: data, whatsappSent: notified, whatsappConfigured })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const suggestions = readJsonFile('suggestions.json')
    const suggestion = { id: crypto.randomUUID(), userId, name, email, message, emailed: notified, createdAt }
    suggestions.push(suggestion)
    writeJsonFile('suggestions.json', suggestions)
    res.status(201).json({ suggestion, whatsappSent: notified, whatsappConfigured })
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
