// [SMASH OR PASS] Upload de photos + votes.
import { API_URL, apiGet, apiPost, apiSend, parseJsonResponse } from './apiClient'

// Upload multipart : ne passe pas par apiPost (qui JSON.stringify le corps), le
// navigateur doit fixer lui-même le Content-Type multipart/form-data avec sa boundary.
export async function uploadPhoto(file, token) {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await fetch(`${API_URL}/api/smash-pass/photos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.message || 'Envoi impossible.')
  return data.photo
}

export async function fetchFeed(token) {
  const data = await apiGet('/api/smash-pass/photos/feed', { token })
  return data.photos || []
}

export async function fetchMyPhotos(token) {
  const data = await apiGet('/api/smash-pass/photos/mine', { token })
  return data.photos || []
}

export function castVote(photoId, choice, comment, token) {
  return apiPost('/api/smash-pass/votes', { photoId, choice, comment: comment || undefined }, { token })
}

export function deletePhoto(id, token) {
  return apiSend('DELETE', `/api/smash-pass/photos/${id}`, undefined, { token })
}

export function photoUrl(imageUrl) {
  return imageUrl?.startsWith('/uploads/') ? `${API_URL}${imageUrl}` : imageUrl
}
