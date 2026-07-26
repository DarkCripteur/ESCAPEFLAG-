// [UNDERCOVER] Appels réseau pour le mode multijoueur en ligne (salons en mémoire côté serveur).
import { API_URL, apiGet, apiPost, apiSend, parseJsonResponse } from './apiClient'

export const createRoom = (hostName, hostId) => apiPost('/api/undercover/room/create', { hostName, hostId })

export const joinRoom = (roomId, playerName, playerId) =>
  apiPost('/api/undercover/room/join', { roomId, playerName, playerId })

export const leaveRoom = (roomId, playerId) => apiPost('/api/undercover/room/leave', { roomId, playerId })

export const chooseDistributor = (roomId, distributorId, hostId) =>
  apiPost('/api/undercover/room/choose-distributor', { roomId, distributorId, hostId })

// `assignments` (optionnel) : { [playerId]: role } pour l'attribution manuelle (section 6).
export const setWords = (roomId, distributorId, civilWord, undercoverWord, undercoversCount, whitesCount, assignments) =>
  apiPost('/api/undercover/room/set-words', { roomId, distributorId, civilWord, undercoverWord, undercoversCount, whitesCount, assignments })

export const submitClue = (roomId, playerId, clue) =>
  apiPost('/api/undercover/room/submit-clue', { roomId, playerId, clue })

export const submitVote = (roomId, voterId, targetId) =>
  apiPost('/api/undercover/room/submit-vote', { roomId, voterId, targetId })

export const sendChat = (roomId, sender, message) =>
  apiPost('/api/undercover/room/chat', { roomId, sender, message })

export const resetRoom = (roomId, hostId) => apiPost('/api/undercover/room/reset', { roomId, hostId })

// Utilisé par le polling : on ignore silencieusement les échecs (salon pas encore prêt, etc.)
// plutôt que de faire planter l'intervalle.
export async function fetchRoom(roomId, playerId) {
  const response = await fetch(`${API_URL}/api/undercover/room/${roomId}?playerId=${playerId}`)
  if (!response.ok) return null
  return parseJsonResponse(response)
}

// [UNDERCOVER] Historique des parties.
export const recordMatch = (match, token) => apiPost('/api/undercover/matches', match, { token })
export async function fetchMatches(token) {
  const data = await apiGet('/api/undercover/matches', { token })
  return data.matches || []
}

// [UNDERCOVER] Invitations par pseudo à rejoindre un salon en ligne.
export const sendGameInvite = (roomId, senderName, receiverId) =>
  apiPost('/api/undercover/invite', { roomId, senderName, receiverId })

export async function fetchGameInvites(userId) {
  if (!userId) return []
  const response = await fetch(`${API_URL}/api/undercover/invites/${userId}`)
  if (!response.ok) return []
  const data = await parseJsonResponse(response)
  return data.invites || []
}

export const dismissGameInvite = (userId, inviteId) => apiSend('DELETE', `/api/undercover/invites/${userId}/${inviteId}`)
