// [ADMIN] État de la console d'administration : onglet actif, utilisateurs, photos,
// commentaires. Local à la page (pas de contexte global) puisque /admin n'est jamais
// visité en tâche de fond comme Undercover ou les invitations.
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import * as adminService from '../services/adminService'
import { fetchSuggestions } from '../services/suggestionService'

export function useAdminPanel() {
  const { accessToken } = useAuth()
  const { notify } = useToast()

  const [tab, setTab] = useState('dashboard')
  const [players, setPlayers] = useState([])
  const [metrics, setMetrics] = useState({})
  const [userQuery, setUserQuery] = useState('')
  const [photos, setPhotos] = useState([])
  const [comments, setComments] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const loadOverview = async () => {
    setLoading(true)
    try {
      const { players: list, metrics: m } = await adminService.fetchOverview(accessToken)
      setPlayers(list)
      setMetrics(m)
    } catch (error) {
      notify(error.message)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query = userQuery) => {
    try {
      setPlayers(await adminService.searchUsers(query, accessToken))
    } catch (error) {
      notify(error.message)
    }
  }

  const loadPhotos = async () => {
    try {
      setPhotos(await adminService.fetchAllPhotos(accessToken))
    } catch (error) {
      notify(error.message)
    }
  }

  const loadComments = async () => {
    try {
      setComments(await adminService.fetchAllComments(accessToken))
    } catch (error) {
      notify(error.message)
    }
  }

  useEffect(() => {
    if (!accessToken) return
    loadOverview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  const loadSuggestions = async () => {
    try {
      setSuggestions(await fetchSuggestions(accessToken))
    } catch (error) {
      notify(error.message)
    }
  }

  useEffect(() => {
    if (!accessToken) return
    if (tab === 'photos') loadPhotos()
    if (tab === 'comments') loadComments()
    if (tab === 'suggestions') loadSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, accessToken])

  const toggleBan = async (user) => {
    try {
      const updated = await adminService.setUserBan(user.id, !user.banned, undefined, accessToken)
      setPlayers((previous) => previous.map((p) => (p.id === user.id ? updated : p)))
      notify(updated.banned ? `${user.name} a été banni.` : `${user.name} n’est plus banni.`)
    } catch (error) {
      notify(error.message)
    }
  }

  const changeRole = async (user, role) => {
    try {
      const updated = await adminService.setUserRole(user.id, role, accessToken)
      setPlayers((previous) => previous.map((p) => (p.id === user.id ? updated : p)))
      notify(`Rôle de ${user.name} mis à jour : ${role}.`)
    } catch (error) {
      notify(error.message)
    }
  }

  const removePhoto = async (photo) => {
    try {
      await adminService.deleteAnyPhoto(photo.id, accessToken)
      setPhotos((previous) => previous.filter((p) => p.id !== photo.id))
      notify('Photo supprimée.')
    } catch (error) {
      notify(error.message)
    }
  }

  const removeComment = async (comment) => {
    try {
      await adminService.deleteComment(comment.id, accessToken)
      setComments((previous) => previous.filter((c) => c.id !== comment.id))
      notify('Commentaire supprimé.')
    } catch (error) {
      notify(error.message)
    }
  }

  return {
    tab,
    setTab,
    players,
    metrics,
    loading,
    userQuery,
    setUserQuery,
    searchUsers,
    photos,
    comments,
    suggestions,
    toggleBan,
    changeRole,
    removePhoto,
    removeComment,
  }
}
