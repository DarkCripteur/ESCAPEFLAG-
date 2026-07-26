import { useContext } from 'react'
import { QuizContext } from '../contexts/QuizContext'

export function useQuizGame() {
  const context = useContext(QuizContext)
  if (!context) throw new Error('useQuizGame doit être utilisé à l’intérieur de <QuizProvider>.')
  return context
}
