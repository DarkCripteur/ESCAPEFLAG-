// [PROFIL] [API] Appels réseau pour le classement et le profil joueur (la vue admin
// est dans services/adminService.js).
import { apiGet, apiPut } from './apiClient'

export async function fetchPlayers() {
  const data = await apiGet('/api/players')
  return data.players || []
}

export async function updateProfile(userId, token, payload) {
  const data = await apiPut(`/api/profile/${userId}`, payload, { token })
  return data.profile
}
