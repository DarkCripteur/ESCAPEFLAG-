// [SUGGESTIONS] Envoi d'un message WhatsApp via l'API Twilio (même compte que pour un
// SMS classique : Twilio envoie sur WhatsApp en préfixant simplement les numéros
// From/To par "whatsapp:"). La clé n'est jamais codée en dur — elle vient uniquement
// des variables d'environnement TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN /
// TWILIO_WHATSAPP_FROM (voir .env.example). Sans elles, l'envoi est simplement ignoré :
// la suggestion reste persistée en base (voir suggestionController.js), rien n'est
// jamais perdu.
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
// Numéro Twilio activé pour WhatsApp, SANS le préfixe "whatsapp:" (ajouté plus bas) —
// par défaut le numéro du sandbox WhatsApp partagé de Twilio, pratique pour tester
// sans numéro WhatsApp Business approuvé (voir .env.example pour la procédure "join").
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || '+14155238886'
// TODO(section 19): numéro de réception par défaut, personnalisable via SUGGESTION_WHATSAPP_TO.
const SUGGESTION_WHATSAPP_TO = process.env.SUGGESTION_WHATSAPP_TO || '+221786840156'

export const whatsappConfigured = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)

export async function sendSuggestionWhatsapp({ name, message, createdAt }) {
  if (!whatsappConfigured) return { sent: false, reason: 'Twilio WhatsApp non configuré (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN).' }

  const sentAt = (createdAt ? new Date(createdAt) : new Date()).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
  // WhatsApp tolère des messages bien plus longs qu'un SMS classique (pas de découpe
  // en segments de 160 caractères) : troncature large, juste pour rester raisonnable.
  const truncated = message.length > 800 ? `${message.slice(0, 797)}…` : message
  const body = `[Escape Flag] Suggestion de ${name || 'un joueur'} (${sentAt}) :\n${truncated}`

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      To: `whatsapp:${SUGGESTION_WHATSAPP_TO}`,
      Body: body,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Echec de l’envoi WhatsApp Twilio (${response.status}) : ${errorBody}`)
  }

  return { sent: true }
}
