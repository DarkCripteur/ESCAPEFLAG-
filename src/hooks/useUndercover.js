import { useContext } from 'react'
import { UndercoverContext } from '../contexts/UndercoverContext'

export function useUndercover() {
  const context = useContext(UndercoverContext)
  if (!context) throw new Error('useUndercover doit être utilisé à l’intérieur de <UndercoverProvider>.')
  return context
}
