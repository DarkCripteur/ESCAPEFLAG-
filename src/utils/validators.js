// Validation légère côté client pour guider l'utilisateur en temps réel dans les formulaires.
export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isValidUsername(value = '') {
  return /^[a-zA-Z0-9_]{3,24}$/.test(value.trim())
}

export function getPasswordStrength(value = '') {
  if (!value) return { label: '', percent: 0, level: '' }
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  if (score <= 1) return { label: 'Faible', percent: 30, level: 'weak' }
  if (score <= 3) return { label: 'Moyen', percent: 65, level: 'medium' }
  return { label: 'Fort', percent: 100, level: 'strong' }
}

