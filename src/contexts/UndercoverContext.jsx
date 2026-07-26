// [UNDERCOVER] Fournit l'état du jeu au niveau de l'app (pas seulement de la page)
// pour qu'une partie en cours (surtout un salon en ligne) survive à la navigation
// entre les onglets Jouer/Profil/Classement/Défis.
import { createContext } from 'react'
import { useUndercoverGame } from '../hooks/useUndercoverGame'

export const UndercoverContext = createContext(null)

export function UndercoverProvider({ children }) {
  const value = useUndercoverGame()
  return <UndercoverContext.Provider value={value}>{children}</UndercoverContext.Provider>
}
