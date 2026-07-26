// [SUGGESTIONS]
import { apiGet, apiPost } from './apiClient'

export function submitSuggestion(message, token) {
  return apiPost('/api/suggestions', { message }, { token })
}

export async function fetchSuggestions(token) {
  const data = await apiGet('/api/admin/suggestions', { token })
  return data.suggestions || []
}
