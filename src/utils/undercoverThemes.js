// [UNDERCOVER] Thèmes prédéfinis (section 6 du cahier des charges) : chaque thème a
// une description affichée au distributeur et une liste de paires civil/undercover.
// Le thème "Personnalisé" n'a pas de paires ici : il pioche dans les paires ajoutées
// par les joueurs (customWordPairs, gérées dans useUndercoverGame).
export const undercoverThemes = [
  {
    id: 'objets',
    label: 'Objets du quotidien',
    icon: '🧦',
    // TODO(section 19): description du thème "Objets du quotidien" à personnaliser.
    description: 'Des objets et habitudes de tous les jours, faciles à décrire sans se faire piéger.',
    pairs: [
      { civil: 'Chocolat', undercover: 'Nutella' },
      { civil: 'Lait', undercover: 'Eau' },
      { civil: 'Ordinateur', undercover: 'Téléphone' },
      { civil: 'Chat', undercover: 'Lion' },
      { civil: 'Chien', undercover: 'Loup' },
      { civil: 'Pizza', undercover: 'Burger' },
      { civil: 'Taxi', undercover: 'Uber' },
      { civil: 'Football', undercover: 'Rugby' },
      { civil: 'Livre', undercover: 'Cahier' },
      { civil: 'Soleil', undercover: 'Lune' },
      { civil: 'Coca-cola', undercover: 'Pepsi' },
      { civil: 'Guitare', undercover: 'Violon' },
      { civil: 'Stylo', undercover: 'Crayon' },
      { civil: 'Café', undercover: 'Thé' },
    ],
  },
  {
    id: 'animaux',
    label: 'Animaux',
    icon: '🐾',
    description: 'Des animaux proches en apparence ou en habitat, à décrire sans citer leur nom.',
    pairs: [
      { civil: 'Lion', undercover: 'Tigre' },
      { civil: 'Dauphin', undercover: 'Requin' },
      { civil: 'Aigle', undercover: 'Faucon' },
      { civil: 'Cheval', undercover: 'Zèbre' },
      { civil: 'Grenouille', undercover: 'Crapaud' },
      { civil: 'Éléphant', undercover: 'Rhinocéros' },
      { civil: 'Papillon', undercover: 'Libellule' },
      { civil: 'Renard', undercover: 'Chacal' },
    ],
  },
  {
    id: 'pays',
    label: 'Pays',
    icon: '🌍',
    description: 'Des pays voisins ou souvent confondus, à décrire par leur culture ou leur géographie.',
    pairs: [
      { civil: 'Sénégal', undercover: 'Mali' },
      { civil: 'France', undercover: 'Belgique' },
      { civil: 'Maroc', undercover: 'Algérie' },
      { civil: 'Japon', undercover: 'Corée du Sud' },
      { civil: 'Brésil', undercover: 'Argentine' },
      { civil: 'Côte d’Ivoire', undercover: 'Ghana' },
      { civil: 'Espagne', undercover: 'Portugal' },
      { civil: 'Canada', undercover: 'États-Unis' },
    ],
  },
  {
    id: 'metiers',
    label: 'Métiers',
    icon: '💼',
    description: 'Des métiers aux missions proches, à décrire par les tâches du quotidien.',
    pairs: [
      { civil: 'Médecin', undercover: 'Infirmier' },
      { civil: 'Professeur', undercover: 'Instituteur' },
      { civil: 'Pompier', undercover: 'Policier' },
      { civil: 'Boulanger', undercover: 'Pâtissier' },
      { civil: 'Chauffeur', undercover: 'Pilote' },
      { civil: 'Avocat', undercover: 'Juge' },
      { civil: 'Chanteur', undercover: 'Musicien' },
      { civil: 'Développeur', undercover: 'Ingénieur' },
    ],
  },
  {
    id: 'films',
    label: 'Films',
    icon: '🎬',
    description: 'Des films ou franchises du même genre, à décrire sans donner le titre.',
    pairs: [
      { civil: 'Titanic', undercover: 'La La Land' },
      { civil: 'Batman', undercover: 'Spider-Man' },
      { civil: 'Star Wars', undercover: 'Star Trek' },
      { civil: 'Le Roi Lion', undercover: 'Madagascar' },
      { civil: 'Harry Potter', undercover: 'Le Seigneur des Anneaux' },
      { civil: 'Fast & Furious', undercover: 'John Wick' },
      { civil: 'Avatar', undercover: 'Interstellar' },
    ],
  },
]

export function pickRandomPairFromTheme(themeId) {
  const theme = undercoverThemes.find((item) => item.id === themeId)
  if (!theme || !theme.pairs.length) return null
  return theme.pairs[Math.floor(Math.random() * theme.pairs.length)]
}
