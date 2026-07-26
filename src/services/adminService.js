// [ADMIN] Appels réseau de la console d'administration (section 10).
import { apiGet, apiPut, apiSend } from './apiClient'

export async function fetchOverview(token) {
  const data = await apiGet('/api/admin/overview', { token })
  return { players: data.players || [], metrics: data.metrics || {} }
}

export async function searchUsers(query, token) {
  const data = await apiGet(`/api/admin/users?q=${encodeURIComponent(query)}`, { token })
  return data.users || []
}

export async function setUserBan(id, banned, reason, token) {
  const data = await apiPut(`/api/admin/users/${id}/ban`, { banned, reason }, { token })
  return data.user
}

export async function setUserRole(id, role, token) {
  const data = await apiPut(`/api/admin/users/${id}/role`, { role }, { token })
  return data.user
}

export async function fetchAllPhotos(token) {
  const data = await apiGet('/api/admin/smash-pass/photos', { token })
  return data.photos || []
}

export function deleteAnyPhoto(id, token) {
  return apiSend('DELETE', `/api/admin/smash-pass/photos/${id}`, undefined, { token })
}

export async function fetchAllComments(token) {
  const data = await apiGet('/api/admin/smash-pass/comments', { token })
  return data.comments || []
}

export function deleteComment(id, token) {
  return apiSend('DELETE', `/api/admin/smash-pass/comments/${id}`, undefined, { token })
}
