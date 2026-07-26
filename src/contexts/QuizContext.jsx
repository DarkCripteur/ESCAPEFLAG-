// [QUIZ] Logique du quiz de culture générale (minuteur, progression, XP, catégories,
// badges, gain de niveau). Le minuteur tourne en continu quel que soit l'écran affiché
// (comportement d'origine), c'est pourquoi cet état vit dans un contexte partagé
// plutôt que dans la seule page Jouer.
import { createContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { createQuestionQueue, quizQuestions, QUESTIONS_PER_ROUND } from '../utils/quizData'
import { badgeDefinitions, computeQualifyingBadgeIds } from '../utils/badges'

export const QuizContext = createContext(null)

export function QuizProvider({ children }) {
  const { user, profile, setProfile, persistProfile } = useAuth()
  const { notify } = useToast()

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [question, setQuestion] = useState(0)
  const [questionQueue, setQuestionQueue] = useState(() => createQuestionQueue())
  const [selected, setSelected] = useState(null)
  const [errors, setErrors] = useState(0)
  const [hints, setHints] = useState(2)
  const [seconds, setSeconds] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState(false)

  const [earnedBadgeIds, setEarnedBadgeIds] = useState([])
  const [leveledUp, setLeveledUp] = useState(false)
  const previousLevelRef = useRef(null)

  useEffect(() => {
    if (finished) return undefined
    const tick = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(tick)
  }, [finished])

  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const level = Math.max(1, Math.floor(profile.xp / 900) + 1)
  const nextLevel = level * 900
  const availableQuestions = questionQueue.map((index) => quizQuestions[index])
  const current = availableQuestions[question] || availableQuestions[0]
  const progress = Math.round((question / Math.max(1, questionQueue.length)) * 100)

  // [QUIZ] Badges : mémorisés par compte (localStorage), l'ensemble ne grandit jamais
  // à l'envers même si la statistique déclenchante (ex. streak) redescend ensuite.
  const badgeStorageKey = user?.id ? `escape-flag-badges-${user.id}` : null

  useEffect(() => {
    if (!badgeStorageKey || typeof window === 'undefined') return
    try {
      setEarnedBadgeIds(JSON.parse(window.localStorage.getItem(badgeStorageKey) || '[]'))
    } catch {
      setEarnedBadgeIds([])
    }
  }, [badgeStorageKey])

  useEffect(() => {
    if (!badgeStorageKey) return
    const qualifying = computeQualifyingBadgeIds(profile, level)
    const newlyEarned = qualifying.filter((id) => !earnedBadgeIds.includes(id))
    if (newlyEarned.length) {
      const updated = [...earnedBadgeIds, ...newlyEarned]
      setEarnedBadgeIds(updated)
      window.localStorage.setItem(badgeStorageKey, JSON.stringify(updated))
      newlyEarned.forEach((id) => {
        const badge = badgeDefinitions.find((b) => b.id === id)
        if (badge) notify(`🏅 Nouveau badge : ${badge.label} !`)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.completed, profile.streak, level, badgeStorageKey])

  // [QUIZ] Animation « Gain de niveau », auto-masquée après quelques secondes.
  useEffect(() => {
    if (previousLevelRef.current !== null && level > previousLevelRef.current) {
      setLeveledUp(true)
      const timeout = setTimeout(() => setLeveledUp(false), 3500)
      previousLevelRef.current = level
      return () => clearTimeout(timeout)
    }
    previousLevelRef.current = level
    return undefined
  }, [level])

  const dismissLevelUp = () => setLeveledUp(false)

  const choose = (choice) => {
    if (selected || finished) return
    setSelected(choice)
    if (choice === current.answer) {
      const nextXp = profile.xp + 250
      const nextProfile = {
        xp: nextXp,
        // Le serveur exige `level` (voir server/validators/profileValidators.js) ; il
        // manquait ici, ce qui faisait échouer silencieusement CHAQUE sauvegarde
        // d'XP en base (rejetée en 400, avalée par le catch de persistProfile) —
        // bug préexistant, découvert en testant la Phase 4.
        level: Math.max(1, Math.floor(nextXp / 900) + 1),
        streak: profile.streak + 1,
        completed: profile.completed + 1,
        challenges: profile.challenges,
        bestTime: time,
      }
      setProfile(nextProfile)
      void persistProfile(nextProfile)
      setTimeout(() => {
        if (question === questionQueue.length - 1) {
          setFinished(true)
          notify('Évasion réussie !')
        } else {
          setQuestion((value) => value + 1)
          setSelected(null)
          setShowHint(false)
          notify('Porte ouverte +250 XP')
        }
      }, 650)
    } else {
      setErrors((value) => value + 1)
      setProfile((previous) => ({ ...previous, streak: 0 }))
      setTimeout(() => setSelected(null), 650)
    }
  }

  const useHint = () => {
    if (!hints || showHint) return
    setHints((value) => value - 1)
    setShowHint(true)
    setProfile((previous) => ({ ...previous, xp: Math.max(0, previous.xp - 40) }))
    void persistProfile({ ...profile, xp: Math.max(0, profile.xp - 40), streak: profile.streak })
    notify('Indice révélé')
  }

  const restart = () => {
    setQuestionQueue(createQuestionQueue(level, categoryFilter))
    setQuestion(0)
    setSelected(null)
    setErrors(0)
    setHints(2)
    setSeconds(0)
    setFinished(false)
    setShowHint(false)
  }

  const setCategory = (categoryId) => {
    setCategoryFilter(categoryId)
    setQuestionQueue(createQuestionQueue(level, categoryId))
    setQuestion(0)
    setSelected(null)
    setShowHint(false)
    setFinished(false)
  }

  const value = {
    question,
    questionQueue,
    questionsPerRound: QUESTIONS_PER_ROUND,
    categoryFilter,
    setCategory,
    selected,
    errors,
    hints,
    seconds,
    showHint,
    finished,
    time,
    level,
    nextLevel,
    availableQuestions,
    current,
    progress,
    earnedBadgeIds,
    leveledUp,
    dismissLevelUp,
    choose,
    useHint,
    restart,
  }

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}
