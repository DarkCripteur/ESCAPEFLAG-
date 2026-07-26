// [QUIZ] Badges (section 7). Définis comme des seuils calculés à partir du profil ;
// une fois atteints, ils sont mémorisés définitivement (voir QuizContext) pour ne pas
// « disparaître » si la statistique sous-jacente (ex. la série en cours) redescend.
export const badgeDefinitions = [
  { id: 'premier-pas', label: 'Premier pas', icon: '🥇', description: 'Répondre correctement à une première question.', test: (profile) => profile.completed >= 1 },
  { id: 'serie-5', label: 'Série de 5', icon: '🔥', description: 'Enchaîner 5 bonnes réponses d’affilée.', test: (profile) => profile.streak >= 5 },
  { id: 'serie-10', label: 'Série de 10', icon: '⚡', description: 'Enchaîner 10 bonnes réponses d’affilée.', test: (profile) => profile.streak >= 10 },
  { id: 'vingt-cinq-questions', label: 'Vingt-cinq questions', icon: '📘', description: 'Répondre correctement à 25 questions au total.', test: (profile) => profile.completed >= 25 },
  { id: 'cinquante-questions', label: 'Cinquante questions', icon: '📚', description: 'Répondre correctement à 50 questions au total.', test: (profile) => profile.completed >= 50 },
  { id: 'cent-questions', label: 'Cent questions', icon: '💯', description: 'Répondre correctement à 100 questions au total.', test: (profile) => profile.completed >= 100 },
  { id: 'niveau-3', label: 'Niveau 3', icon: '🎖️', description: 'Atteindre le niveau 3.', test: (_profile, level) => level >= 3 },
  { id: 'niveau-5', label: 'Niveau 5', icon: '🏅', description: 'Atteindre le niveau 5.', test: (_profile, level) => level >= 5 },
  { id: 'niveau-10', label: 'Niveau 10', icon: '👑', description: 'Atteindre le niveau 10.', test: (_profile, level) => level >= 10 },
]

export function computeQualifyingBadgeIds(profile, level) {
  return badgeDefinitions.filter((badge) => badge.test(profile, level)).map((badge) => badge.id)
}
