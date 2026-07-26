// [LOGIN] [REGISTER] Appels réseau pour l'authentification par pseudo.
import { apiPost } from './apiClient'

export function loginRequest(username, password) {
  return apiPost('/api/auth/login', { username, password })
}

export function registerRequest(payload) {
  return apiPost('/api/auth/register', payload)
}

export function resendConfirmationRequest(email) {
  return apiPost('/api/auth/resend', { email })
}
