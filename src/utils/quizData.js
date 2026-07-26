// [QUIZ] Données auxiliaires (pays) + logique de tirage des questions. La banque de
// questions elle-même vit dans data/quizQuestions/ (section 7 du cahier des charges :
// catégories, difficulté, manches de 10 questions).
import { allQuizQuestions, categories } from '../data/quizQuestions'

export const quizQuestions = allQuizQuestions
export { categories }

export const QUESTIONS_PER_ROUND = 10

// La liste des pays/indicatifs vit désormais dans data/countries.js, utilisée par
// PhoneCountryPicker (sélecteur téléphone international complet, section 12).

// Les paires de mots Undercover vivent désormais dans utils/undercoverThemes.js
// (thèmes catégorisés : objets, animaux, pays, métiers, films — section 6).

export const colors = ['#9f65ff', '#f5b441', '#ec5a7a', '#55ae9a', '#6b8ee9', '#d778b7']

// Tire une manche de QUESTIONS_PER_ROUND questions, en priorisant celles dont la
// difficulté est proche du niveau du joueur, filtrées par catégorie si demandé.
export function createQuestionQueue(level = 1, categoryId = 'all') {
  const currentDifficulty = Math.min(4, Math.floor(level / 3) + 1)
  const pool = categoryId === 'all' ? quizQuestions : quizQuestions.filter((q) => q.category === categoryId)
  const source = pool.length ? pool : quizQuestions

  const byDifficulty = [...source].sort((left, right) => {
    const leftDistance = Math.abs(left.difficulty - currentDifficulty)
    const rightDistance = Math.abs(right.difficulty - currentDifficulty)
    return leftDistance - rightDistance || Math.random() - 0.5
  })
  return byDifficulty.slice(0, QUESTIONS_PER_ROUND).map((item) => quizQuestions.indexOf(item))
}
