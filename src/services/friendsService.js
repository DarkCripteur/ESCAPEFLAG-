// [AMIS] Recherche de joueurs par pseudo, invitations et liste d'amis.
import { apiGet, apiPost, apiSend } from './apiClient'

export async function searchPlayersByUsername(query) {
  const data = await apiGet(`/api/players/search?q=${encodeURIComponent(query)}`)
  return data.players || []
}

export async function fetchFriends(token) {
  const data = await apiGet('/api/friends', { token })
  return data.friends || []
}

export async function fetchFriendRequests(token) {
  const data = await apiGet('/api/friends/requests', { token })
  return { sent: data.sent || [], received: data.received || [] }
}

export function sendFriendRequest(username, token) {
  return apiPost('/api/friends/requests', { username }, { token })
}

export function respondToFriendRequest(id, action, token) {
  return apiPost(`/api/friends/requests/${id}/respond`, { action }, { token })
}

export function removeFriendRequest(id, token) {
  return apiSend('DELETE', `/api/friends/requests/${id}`, undefined, { token })
}
