// [SUGGESTIONS] Envoi d'e-mail via l'API Resend (section 11 : "prévoir un service
// SMTP ou API e-mail (Resend / SendGrid)"). La clé n'est jamais codée en dur — elle
// vient uniquement de la variable d'environnement RESEND_API_KEY (voir .env.example).
// Sans elle, l'envoi est simplement ignoré : la suggestion reste persistée en base
// (voir suggestionController.js), rien n'est jamais perdu.
const RESEND_API_KEY = process.env.RESEND_API_KEY
const MAIL_FROM = process.env.MAIL_FROM || 'onboarding@resend.dev'
// TODO(section 19): adresse de réception par défaut, personnalisable via MAIL_TO.
const MAIL_TO = process.env.MAIL_TO || 'fustelamio2208@gmail.com'

export const emailConfigured = Boolean(RESEND_API_KEY)

// `ip` et `userAgent` sont facultatifs (le contrôleur les extrait de la requête quand
// c'est possible) — l'e-mail reste envoyé même s'ils sont absents.
export async function sendSuggestionEmail({ name, email, message, ip, userAgent, createdAt }) {
  if (!emailConfigured) return { sent: false, reason: 'RESEND_API_KEY non configurée.' }

  const sentAt = (createdAt ? new Date(createdAt) : new Date()).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

  const textLines = [
    message,
    '',
    '---',
    `Nom : ${name || 'Non renseigné'}`,
    `E-mail : ${email || 'Non renseigné'}`,
    `Date d'envoi : ${sentAt}`,
    `Adresse IP : ${ip || 'Non disponible'}`,
    `Navigateur (User-Agent) : ${userAgent || 'Non disponible'}`,
  ]

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Escape Flag <${MAIL_FROM}>`,
      to: [MAIL_TO],
      reply_to: email || undefined,
      subject: `Nouvelle suggestion Escape Flag de ${name || 'un joueur'}`,
      text: textLines.join('\n'),
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Echec de l’envoi Resend (${response.status}) : ${body}`)
  }

  return { sent: true }
}
