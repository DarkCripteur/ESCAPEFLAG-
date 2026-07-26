// [API] Client HTTP partagé par tous les services. Centralise l'URL de base et le
// parsing défensif des réponses.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Le backend peut répondre avec du HTML (page 404, etc.) s'il n'est pas démarré
// ou si VITE_API_URL est mal configuré. On évite le crash "Unexpected token '<'"
// et on donne un message clair à la place.
export async function parseJsonResponse(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Le serveur API n’a pas répondu correctement (backend éteint ou VITE_API_URL mal configuré). Lancez "npm run server" et vérifiez votre fichier .env.')
  }
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet(path, { token } = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { ...authHeaders(token) } })
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.message || 'Requête impossible.')
  return data
}

export async function apiSend(method, path, body, { token } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(body ?? {}),
  })
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.message || 'Requête impossible.')
  return data
}

export const apiPost = (path, body, options) => apiSend('POST', path, body, options)
export const apiPut = (path, body, options) => apiSend('PUT', path, body, options)
