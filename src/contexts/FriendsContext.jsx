// [AMIS] État partagé des amis et invitations, rafraîchi dès qu'une session démarre.
import { createContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import * as friendsService from '../services/friendsService'

export const FriendsContext = createContext(null)

export function FriendsProvider({ children }) {
  const { user, accessToken } = useAuth()
  const { notify } = useToast()

  const [friends, setFriends] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user?.id || !accessToken) return
    try {
      const [friendsList, requests] = await Promise.all([
        friendsService.fetchFriends(accessToken),
        friendsService.fetchFriendRequests(accessToken),
      ])
      setFriends(friendsList)
      setSentRequests(requests.sent)
      setReceivedRequests(requests.received)
    } catch (error) {
      console.warn('Chargement des amis impossible', error)
    }
  }, [user?.id, accessToken])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 1) {
      setSearchResults([])
      return undefined
    }
    setSearchLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const results = await friendsService.searchPlayersByUsername(query)
        setSearchResults(results.filter((player) => player.id !== user?.id))
      } catch (error) {
        notify(error.message)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery, user?.id, notify])

  const sendRequest = async (username) => {
    try {
      await friendsService.sendFriendRequest(username, accessToken)
      notify(`Invitation envoyée à ${username}`)
      await refresh()
    } catch (error) {
      notify(error.message)
    }
  }

  const respondToRequest = async (id, action) => {
    try {
      await friendsService.respondToFriendRequest(id, action, accessToken)
      notify(action === 'accept' ? 'Invitation acceptée' : 'Invitation refusée')
      await refresh()
    } catch (error) {
      notify(error.message)
    }
  }

  // Une invitation annulée, une invitation refusée et une amitié rompue sont la même
  // opération côté API (suppression de la ligne `friend_requests`) : seul le message
  // affiché à l'utilisateur diffère selon le contexte d'où il l'a déclenchée.
  const removeRequest = async (id, successMessage) => {
    try {
      await friendsService.removeFriendRequest(id, accessToken)
      notify(successMessage)
      await refresh()
    } catch (error) {
      notify(error.message)
    }
  }

  const cancelRequest = (id) => removeRequest(id, 'Invitation annulée')
  const removeFriend = (id) => removeRequest(id, 'Ami retiré')

  const value = {
    friends,
    sentRequests,
    receivedRequests,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    sendRequest,
    respondToRequest,
    cancelRequest,
    removeFriend,
  }

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
}
