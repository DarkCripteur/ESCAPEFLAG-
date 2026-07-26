// [QUIZ] Banque de questions, regroupée par catégorie (section 7 du cahier des
// charges). ~150 questions réparties sur 10 catégories et 4 niveaux de difficulté —
// une base solide, pas la promesse littérale de « plusieurs centaines » : à enrichir
// au fil du temps en ajoutant des questions dans les fichiers de ce dossier.
import { geographie } from './geographie'
import { histoire } from './histoire'
import { sciences } from './sciences'
import { culture } from './culture'
import { sport } from './sport'
import { cinema } from './cinema'
import { musique } from './musique'
import { litterature } from './litterature'
import { nature } from './nature'
import { technologie } from './technologie'

export const categories = [
  { id: 'Géographie', label: 'Géographie', icon: '🌍' },
  { id: 'Histoire', label: 'Histoire', icon: '🏛️' },
  { id: 'Sciences', label: 'Sciences', icon: '🔬' },
  { id: 'Culture générale', label: 'Culture générale', icon: '🌐' },
  { id: 'Sport', label: 'Sport', icon: '⚽' },
  { id: 'Cinéma', label: 'Cinéma', icon: '🎬' },
  { id: 'Musique', label: 'Musique', icon: '🎵' },
  { id: 'Littérature', label: 'Littérature', icon: '📖' },
  { id: 'Nature', label: 'Nature', icon: '🐾' },
  { id: 'Technologie', label: 'Technologie', icon: '💻' },
]

export const allQuizQuestions = [
  ...geographie,
  ...histoire,
  ...sciences,
  ...culture,
  ...sport,
  ...cinema,
  ...musique,
  ...litterature,
  ...nature,
  ...technologie,
]
