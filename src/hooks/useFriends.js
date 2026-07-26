import { useContext } from 'react'
import { FriendsContext } from '../contexts/FriendsContext'

export function useFriends() {
  const context = useContext(FriendsContext)
  if (!context) throw new Error('useFriends doit être utilisé à l’intérieur de <FriendsProvider>.')
  return context
}
