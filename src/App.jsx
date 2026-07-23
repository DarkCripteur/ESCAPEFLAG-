import { useEffect, useState } from 'react'
import './App.css'

// Données de quiz de culture générale. Les questions deviennent plus exigeantes lorsque le niveau monte.
const quizQuestions = [
  { prompt: 'Quelle est la capitale du Sénégal ?', options: ['Dakar', 'Bamako', 'Conakry', 'Abidjan'], answer: 'Dakar', explanation: 'Dakar est la capitale du Sénégal.', theme: 'Géographie', icon: '🌍', difficulty: 1 },
  { prompt: 'Quel océan borde la côte ouest de l’Afrique ?', options: ['Atlantique', 'Pacifique', 'Indien', 'Arctique'], answer: 'Atlantique', explanation: 'L’océan Atlantique borde la côte ouest de l’Afrique.', theme: 'Géographie', icon: '🌊', difficulty: 1 },
  { prompt: 'Qui a peint la Joconde ?', options: ['Leonardo da Vinci', 'Michel-Ange', 'Raphaël', 'Botticelli'], answer: 'Leonardo da Vinci', explanation: 'La Joconde est un chef-d’œuvre de Léonard de Vinci.', theme: 'Art', icon: '🎨', difficulty: 1 },
  { prompt: 'Quel est le plus grand désert du monde ?', options: ['Sahara', 'Gobi', 'Kalahari', 'Antarctique'], answer: 'Antarctique', explanation: 'Le désert antarctique est le plus grand désert du monde.', theme: 'Nature', icon: '🏜️', difficulty: 2 },
  { prompt: 'Combien de continents compte le monde ?', options: ['5', '6', '7', '8'], answer: '7', explanation: 'Le monde est généralement divisé en 7 continents.', theme: 'Monde', icon: '🗺️', difficulty: 2 },
  { prompt: 'Quel pays est connu pour la Tour Eiffel ?', options: ['France', 'Espagne', 'Italie', 'Allemagne'], answer: 'France', explanation: 'La Tour Eiffel est un monument emblématique de France.', theme: 'Culture', icon: '🏛️', difficulty: 2 },
  { prompt: 'Quelle langue est parlée au Brésil ?', options: ['Portugais', 'Espagnol', 'Français', 'Italien'], answer: 'Portugais', explanation: 'Le portugais est la langue officielle du Brésil.', theme: 'Langues', icon: '🗣️', difficulty: 3 },
  { prompt: 'Quel élément est essentiel pour la photosynthèse ?', options: ['Lumière', 'Argile', 'Sel', 'Sable'], answer: 'Lumière', explanation: 'Les plantes utilisent la lumière du soleil pour produire leur énergie.', theme: 'Science', icon: '☀️', difficulty: 3 },
  { prompt: 'Quel festin célèbre l’année nouvelle au Japon ?', options: ['Hanami', 'Obon', 'Shōgatsu', 'Matsuri'], answer: 'Shōgatsu', explanation: 'Shōgatsu est le Nouvel An japonais.', theme: 'Culture', icon: '🎎', difficulty: 3 },
  { prompt: 'Quelle planète est surnommée la planète rouge ?', options: ['Mars', 'Vénus', 'Jupiter', 'Mercure'], answer: 'Mars', explanation: 'Mars est appelée la planète rouge à cause de son sol riche en oxyde de fer.', theme: 'Science', icon: '🪐', difficulty: 4 },
  { prompt: 'Quelle invention est attribuée à Thomas Edison ?', options: ['Lampe électrique', 'Aéroplane', 'Téléphone', 'Internet'], answer: 'Lampe électrique', explanation: 'Thomas Edison a largement contribué au développement de la lampe électrique.', theme: 'Innovation', icon: '💡', difficulty: 4 },
  { prompt: 'Quel pays a pour capitale Nairobi ?', options: ['Kenya', 'Nigeria', 'Éthiopie', 'Tanzanie'], answer: 'Kenya', explanation: 'Nairobi est la capitale du Kenya.', theme: 'Géographie', icon: '🌐', difficulty: 4 },
]

const countries = [
  { name: 'Sénégal', flag: '🇸🇳', dialCode: '+221', continent: 'Afrique' },
  { name: 'France', flag: '🇫🇷', dialCode: '+33', continent: 'Europe' },
  { name: 'Côte d’Ivoire', flag: '🇨🇮', dialCode: '+225', continent: 'Afrique' },
  { name: 'Maroc', flag: '🇲🇦', dialCode: '+212', continent: 'Afrique' },
  { name: 'Japon', flag: '🇯🇵', dialCode: '+81', continent: 'Asie' },
  { name: 'Inde', flag: '🇮🇳', dialCode: '+91', continent: 'Asie' },
  { name: 'Canada', flag: '🇨🇦', dialCode: '+1', continent: 'Amérique du Nord' },
  { name: 'États-Unis', flag: '🇺🇸', dialCode: '+1', continent: 'Amérique du Nord' },
  { name: 'Brésil', flag: '🇧🇷', dialCode: '+55', continent: 'Amérique du Sud' },
  { name: 'Chili', flag: '🇨🇱', dialCode: '+56', continent: 'Amérique du Sud' },
  { name: 'Allemagne', flag: '🇩🇪', dialCode: '+49', continent: 'Europe' },
  { name: 'Italie', flag: '🇮🇹', dialCode: '+39', continent: 'Europe' },
  { name: 'Australie', flag: '🇦🇺', dialCode: '+61', continent: 'Océanie' },
  { name: 'Nouvelle-Zélande', flag: '🇳🇿', dialCode: '+64', continent: 'Océanie' },
]

const ucWordPairs = [
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
  { civil: 'Café', undercover: 'Thé' }
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Le backend peut répondre avec du HTML (page 404, etc.) s'il n'est pas démarré
// ou si VITE_API_URL est mal configuré. On évite le crash "Unexpected token '<'"
// et on donne un message clair à la place.
async function parseJsonResponse(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Le serveur API n’a pas répondu correctement (backend éteint ou VITE_API_URL mal configuré). Lancez "npm run server" et vérifiez votre fichier .env.')
  }
}
const colors = ['#9f65ff', '#f5b441', '#ec5a7a', '#55ae9a', '#6b8ee9', '#d778b7']
const AUTH_STORAGE_KEY = 'escape-flag-auth'
// [ESCAPEFLAG AUTH] Ajout du champ login aux états par défaut
const defaultAuthState = { name: '', email: '', phone: '', login: '', password: '', country: 'Sénégal', countryCode: '+221' }

function createQuestionQueue(level = 1) {
  const currentDifficulty = Math.min(4, Math.floor(level / 3) + 1)
  const byDifficulty = [...quizQuestions].sort((left, right) => {
    const leftDistance = Math.abs(left.difficulty - currentDifficulty)
    const rightDistance = Math.abs(right.difficulty - currentDifficulty)
    return leftDistance - rightDistance || Math.random() - 0.5
  })
  return byDifficulty.map((item) => quizQuestions.indexOf(item))
}

function Icon({ children, size = 20 }) {
  return <span className="icon" style={{ fontSize: size }}>{children}</span>
}

function isAdminCandidate(candidate = {}) {
  const content = `${candidate.name || ''} ${candidate.email || ''} ${candidate.phone || ''} ${candidate.role || ''}`.toLowerCase()
  if (content.includes('adminfg') || content.includes('fustel2208@gmail.com') || content.includes('+221786840156')) return true
  return /admin|moderator|fustel/.test(content)
}

// Validation légère côté client pour guider l'utilisateur en temps réel dans les formulaires.
function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}


function getPasswordStrength(value = '') {
  if (!value) return { label: '', percent: 0, level: '' }
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  if (score <= 1) return { label: 'Faible', percent: 30, level: 'weak' }
  if (score <= 3) return { label: 'Moyen', percent: 65, level: 'medium' }
  return { label: 'Fort', percent: 100, level: 'strong' }
}

const fieldIconPaths = {
  user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2.24V6h16v.24l-8 5.99-8-5.99ZM20 8.76l-7.4 5.55a1 1 0 0 1-1.2 0L4 8.76V18h16V8.76Z',
  phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z',
  lock: 'M12 2a4 4 0 0 1 4 4v3h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4Zm-2 6h4V6a2 2 0 0 0-4 0v2Z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 8h-3.02a15 15 0 0 0-1.1-4.4A8.03 8.03 0 0 1 18.9 10ZM12 4c.7 1 1.6 2.9 1.9 6h-3.8c.3-3.1 1.2-5 1.9-6ZM9.22 5.6A15 15 0 0 0 8.12 10H5.1a8.03 8.03 0 0 1 4.12-4.4ZM5.1 12h3.02c.1 1.6.5 3.1 1.1 4.4A8.03 8.03 0 0 1 5.1 12Zm5.02 0h3.8c-.3 3.1-1.2 5-1.9 6-.7-1-1.6-2.9-1.9-6Zm5.02 4.4c.6-1.3 1-2.8 1.1-4.4h3.02a8.03 8.03 0 0 1-4.12 4.4Z',
  check: 'm9 16.2-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5L9 16.2Z',
  alert: 'M12 2 1 21h22L12 2Zm0 5 7.5 12h-15L12 7Zm-1 4v4h2v-4h-2Zm0 5v2h2v-2h-2Z',
}

function FieldIcon({ name, className = 'field-icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" d={fieldIconPaths[name] || fieldIconPaths.user} />
    </svg>
  )
}

function App() {
  // État du jeu, du profil et des défis.
  const [question, setQuestion] = useState(0)
  const [questionQueue, setQuestionQueue] = useState(() => createQuestionQueue())
  const [selected, setSelected] = useState(null)
  const [errors, setErrors] = useState(0)
  const [hints, setHints] = useState(2)
  const [seconds, setSeconds] = useState(0)
  const [toast, setToast] = useState('')
  const [sound, setSound] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState(false)
  const [activeView, setActiveView] = useState('jouer')
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ xp: 0, level: 1, streak: 0, completed: 0, challenges: 0, bestTime: '00:00' })
  const [players, setPlayers] = useState([])
  const [adminPlayers, setAdminPlayers] = useState([])
  const [adminMetrics, setAdminMetrics] = useState({ users: 0, sessions: 0, activeSessions: 0 })
  const [auth, setAuth] = useState(() => {
    if (typeof window === 'undefined') return defaultAuthState
    try {
      const saved = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (!saved) return defaultAuthState
      return { ...defaultAuthState, ...JSON.parse(saved) }
    } catch {
      return defaultAuthState
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberAuth, setRememberAuth] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY))
    } catch {
      return false
    }
  })
  const [authMode, setAuthMode] = useState('login')
  const [authMethod, setAuthMethod] = useState('email')
  const [accessToken, setAccessToken] = useState('')
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)
  const [challengeTarget, setChallengeTarget] = useState(null)
  const [challengeDraft, setChallengeDraft] = useState('')
  const [challengeInvites, setChallengeInvites] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(window.localStorage.getItem('escape-flag-challenges') || '[]')
    } catch {
      return []
    }
  })

  // --- LOGIQUE DU JEU UNDERCOVER (LOCAL & MULTIJOUEURS) ---
  const [ucPlayers, setUcPlayers] = useState([
    { id: 1, name: 'Joueur 1', role: '', word: '', isEliminated: false },
    { id: 2, name: 'Joueur 2', role: '', word: '', isEliminated: false },
    { id: 3, name: 'Joueur 3', role: '', word: '', isEliminated: false }
  ])
  const [ucNewPlayerName, setUcNewPlayerName] = useState('')
  const [ucState, setUcState] = useState('setup')
  const [ucRevealIndex, setUcRevealIndex] = useState(0)
  const [ucShowWord, setUcShowWord] = useState(false)
  const [ucUndercoversCount, setUcUndercoversCount] = useState(1)
  const [ucWhitesCount, setUcWhitesCount] = useState(0)
  const [ucSelectedPair, setUcSelectedPair] = useState({ civil: 'Chocolat', undercover: 'Nutella' })
  const [ucWinner, setUcWinner] = useState('')
  const [ucRound, setUcRound] = useState(1)

  // ÉTATS DE JEU MULTIJOUEURS
  const [ucMode, setUcMode] = useState('local')
  const [ucRoomId, setUcRoomId] = useState('')
  const [ucRoom, setUcRoom] = useState(null)
  const [ucJoinIdInput, setUcJoinIdInput] = useState('')
  const [ucClueInput, setUcClueInput] = useState('')
  const [ucChatInput, setUcChatInput] = useState('')
  const [customWordPairs, setCustomWordPairs] = useState([])
  const [newCivilWord, setNewCivilWord] = useState('')
  const [newUndercoverWord, setNewUndercoverWord] = useState('')

  const getLocalPlayerId = () => {
    return user?.id || 'guest-' + (user?.name || 'anonyme')
  }

  const createOnlineRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: user?.name || 'Hôte', hostId: getLocalPlayerId() })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
      setUcRoomId(data.id)
      setUcMode('online')
      notify(`Salon créé : ${data.id}`)
    } catch (err) {
      notify(err.message)
    }
  }

  const joinOnlineRoom = async (rid = ucJoinIdInput) => {
    if (!rid.trim()) return
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: rid.toUpperCase(), playerName: user?.name || 'Joueur', playerId: getLocalPlayerId() })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
      setUcRoomId(data.id)
      setUcMode('online')
      notify(`Vous avez rejoint le salon : ${data.id}`)
    } catch (err) {
      notify(err.message)
    }
  }

  const leaveOnlineRoom = async () => {
    if (!ucRoomId) return
    try {
      await fetch(`${API_URL}/api/undercover/room/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: ucRoomId, playerId: getLocalPlayerId() })
      })
    } catch { }
    setUcRoomId('')
    setUcRoom(null)
    setUcMode('local')
    setUcState('setup')
  }

  const chooseOnlineDistributor = async (distributorId) => {
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/choose-distributor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: ucRoomId, distributorId, hostId: getLocalPlayerId() })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
    } catch (err) {
      notify(err.message)
    }
  }

  const setOnlineWords = async (civilWord, undercoverWord, undercovers, whites) => {
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/set-words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: ucRoomId,
          distributorId: getLocalPlayerId(),
          civilWord,
          undercoverWord,
          undercoversCount: undercovers,
          whitesCount: whites
        })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
    } catch (err) {
      notify(err.message)
    }
  }

  const submitOnlineClue = async () => {
    if (!ucClueInput.trim()) return
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/submit-clue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: ucRoomId, playerId: getLocalPlayerId(), clue: ucClueInput.trim() })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
      setUcClueInput('')
    } catch (err) {
      notify(err.message)
    }
  }

  const submitOnlineVote = async (targetId) => {
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/submit-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: ucRoomId, voterId: getLocalPlayerId(), targetId })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
    } catch (err) {
      notify(err.message)
    }
  }

  const sendOnlineChatMessage = async (e) => {
    e?.preventDefault()
    if (!ucChatInput.trim()) return
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: ucRoomId, sender: user?.name || 'Joueur', message: ucChatInput.trim() })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
      setUcChatInput('')
    } catch (err) {
      notify(err.message)
    }
  }

  const resetOnlineRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/undercover/room/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: ucRoomId, hostId: getLocalPlayerId() })
      })
      const data = await parseJsonResponse(response)
      setUcRoom(data)
    } catch (err) {
      notify(err.message)
    }
  }

  // Effet de scrutation périodique (polling)
  useEffect(() => {
    if (!ucRoomId || ucMode !== 'online') return undefined
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/undercover/room/${ucRoomId}?playerId=${getLocalPlayerId()}`)
        if (response.ok) {
          const data = await parseJsonResponse(response)
          setUcRoom(data)
        }
      } catch { }
    }, 1500)
    return () => clearInterval(interval)
  }, [ucRoomId, ucMode])

  const addUcPlayer = (e) => {
    e?.preventDefault()
    if (!ucNewPlayerName.trim()) return
    setUcPlayers([
      ...ucPlayers,
      { id: Date.now(), name: ucNewPlayerName.trim(), role: '', word: '', isEliminated: false }
    ])
    setUcNewPlayerName('')
  }

  const removeUcPlayer = (id) => {
    if (ucPlayers.length <= 3) {
      notify('Il faut au moins 3 joueurs !')
      return
    }
    setUcPlayers(ucPlayers.filter(p => p.id !== id))
  }

  const startUndercover = () => {
    if (ucPlayers.length < 3) {
      notify('Il faut au moins 3 joueurs !')
      return
    }
    const totalSpecial = Number(ucUndercoversCount) + Number(ucWhitesCount)
    if (totalSpecial >= ucPlayers.length) {
      notify('Il doit y avoir au moins un Civil dans le jeu !')
      return
    }

    const pair = ucWordPairs[Math.floor(Math.random() * ucWordPairs.length)]
    setUcSelectedPair(pair)

    const roles = []
    for (let i = 0; i < ucUndercoversCount; i++) roles.push('undercover')
    for (let i = 0; i < ucWhitesCount; i++) roles.push('mrwhite')
    while (roles.length < ucPlayers.length) roles.push('civil')

    roles.sort(() => Math.random() - 0.5)

    const updated = ucPlayers.map((player, idx) => {
      const role = roles[idx]
      let word = ''
      if (role === 'civil') word = pair.civil
      else if (role === 'undercover') word = pair.undercover
      else word = 'M. White (Vous n’avez pas de mot !)'
      return { ...player, role, word, isEliminated: false }
    })

    setUcPlayers(updated)
    setUcState('reveal')
    setUcRevealIndex(0)
    setUcShowWord(false)
    setUcWinner('')
    setUcRound(1)
  }

  const eliminateUcPlayer = (id) => {
    const updated = ucPlayers.map(p => p.id === id ? { ...p, isEliminated: true } : p)
    setUcPlayers(updated)

    const activeCivils = updated.filter(p => !p.isEliminated && p.role === 'civil')
    const activeUndercovers = updated.filter(p => !p.isEliminated && p.role === 'undercover')
    const activeWhites = updated.filter(p => !p.isEliminated && p.role === 'mrwhite')

    if (activeUndercovers.length === 0 && activeWhites.length === 0) {
      setUcWinner('Civils')
      setUcState('result')
    } else if (activeCivils.length <= (activeUndercovers.length + activeWhites.length)) {
      setUcWinner('Undercovers / M. White')
      setUcState('result')
    } else {
      setUcState('describe')
      setUcRound(r => r + 1)
    }
  }

  useEffect(() => {
    if (finished) return undefined
    const tick = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(tick)
  }, [finished])

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('escape-flag-challenges', JSON.stringify(challengeInvites))
    }
  }, [challengeInvites])

  useEffect(() => {
    fetch(`${API_URL}/api/health`).then((response) => setServerOnline(response.ok)).catch(() => setServerOnline(false))
  }, [])

  const loadPlayers = async () => {
    const response = await fetch(`${API_URL}/api/players`)
    const data = await parseJsonResponse(response)
    setPlayers(data.players || [])
  }

  const loadAdminPlayers = async (token = accessToken) => {
    const response = await fetch(`${API_URL}/api/admin/overview`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await parseJsonResponse(response)
    setAdminPlayers(data.players || [])
    setAdminMetrics(data.metrics || { users: 0, sessions: 0, activeSessions: 0 })
  }

  const persistProfile = async (nextProfile, currentUser = user) => {
    if (!currentUser?.id) return
    try {
      const response = await fetch(`${API_URL}/api/profile/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          ...nextProfile,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          country: auth.country,
          countryCode: auth.countryCode,
        }),
      })
      if (response.ok) {
        const data = await parseJsonResponse(response)
        setProfile(data.profile || nextProfile)
      }
    } catch (error) {
      console.warn('Profil non synchronisé', error)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadPlayers().catch((error) => console.warn('Chargement des joueurs impossible', error))
    if (['admin', 'moderator'].includes(user.role)) {
      loadAdminPlayers().catch((error) => console.warn('Chargement admin impossible', error))
      setActiveView('admin')
    }
  }, [user?.id])

  useEffect(() => {
    if (!user || typeof window === 'undefined' || window.location.pathname !== '/admin') return
    if (['admin', 'moderator'].includes(user.role)) setActiveView('admin')
    else window.history.replaceState({}, '', '/')
  }, [user])

  // Logique commune une fois la session obtenue (login réussi OU inscription avec
  // confirmation e-mail désactivée côté Supabase).
  const finalizeAuthSuccess = async (data) => {
    const nextUser = { ...data.user }
    setUser(nextUser)
    setAccessToken(data.session.access_token)
    setProfile(data.profile || { xp: 0, level: 1, streak: 0, completed: 0, challenges: 0, bestTime: '00:00' })
    if (typeof window !== 'undefined') {
      const savedAuth = { ...auth, password: auth.password }
      if (rememberAuth) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(savedAuth))
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    await loadPlayers()
    if (nextUser.role === 'admin' || nextUser.role === 'moderator') {
      await loadAdminPlayers(data.session.access_token)
      setActiveView('admin')
    }
    notify(`Bienvenue, ${data.user.name} !`)
  }

  // Connexion : appelle exclusivement POST /api/auth/login avec { login, password }.
  const loginAccount = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    setAuthLoading(true)
    try {
      // =========================
      // ESCAPEFLAG UPDATE START
      // Login avec Email ou Téléphone
      // =========================
      let loginValue = auth.login || ''
      const isNumericPhone = /^[0-9\s\-()]+$/.test(loginValue.trim())
      if (loginValue && isNumericPhone && !loginValue.startsWith('+') && auth.countryCode) {
        loginValue = auth.countryCode + loginValue.replace(/\s+/g, '')
      }
      // =========================
      // ESCAPEFLAG UPDATE END
      // =========================

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginValue, password: auth.password }),
      })
      const data = await parseJsonResponse(response)
      if (!response.ok) throw new Error(data.message || 'Connexion impossible.')
      await finalizeAuthSuccess(data)
    } catch (error) {
      setAuthError(error.message === 'Failed to fetch' ? 'Backend indisponible. Lancez npm run server.' : error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  // Inscription : appelle exclusivement POST /api/auth/register avec le profil complet.
  const registerAccount = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    setAuthLoading(true)

    try {
      // =========================
      // ESCAPEFLAG UPDATE START
      // Inscription avec Email ou Téléphone
      // =========================
      let emailValue = ''
      let phoneValue = ''
      const registerLogin = auth.login || ''
      if (registerLogin.includes('@')) {
        emailValue = registerLogin.trim()
      } else {
        phoneValue = registerLogin.trim()
        if (phoneValue && !phoneValue.startsWith('+') && auth.countryCode) {
          phoneValue = auth.countryCode + phoneValue.replace(/\s+/g, '')
        }
      }
      // =========================
      // ESCAPEFLAG UPDATE END
      // =========================

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...auth,
          email: emailValue,
          phone: phoneValue,
          avatar: (auth.name || '').trim().slice(0, 1).toUpperCase() || 'U'
        })
      })

      const data = await parseJsonResponse(response)

      if (!response.ok) {
        throw new Error(
          data.message || "Inscription impossible."
        )
      }

      if (!data.session?.access_token) {
        setAuthMode('login')
        setAuth((previous) => ({ ...previous, password: '' }))
        setAuthNotice(`Compte créé pour ${emailValue || phoneValue} ! Vérifiez votre boîte e-mail pour confirmer votre adresse, puis connectez-vous.`)
        return
      }

      // Connexion automatique après inscription
      await finalizeAuthSuccess(data)

    } catch (error) {
      setAuthError(
        error.message === 'Failed to fetch'
          ? "Backend indisponible. Lancez npm run server."
          : error.message
      )
    } finally {
      setAuthLoading(false)
    }

  }
  // Le formulaire est unique dans l'UI (identique visuellement) mais délègue à la
  // bonne fonction selon le mode actif, sans jamais mélanger les deux logiques.
  const submitAuth = (event) => (authMode === 'register' ? registerAccount(event) : loginAccount(event))


  const passwordStrength = getPasswordStrength(auth.password)

  const resendConfirmation = async () => {
    if (!auth.email || resendLoading) return
    setResendLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: auth.email }),
      })
      const data = await parseJsonResponse(response)
      if (!response.ok) throw new Error(data.message || 'Envoi impossible.')
      setAuthNotice(`E-mail de confirmation renvoyé à ${auth.email}.`)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setResendLoading(false)
    }
  }
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const level = Math.max(1, Math.floor(profile.xp / 900) + 1)
  const nextLevel = level * 900
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator'
  const availableQuestions = questionQueue.map((index) => quizQuestions[index])
  const current = availableQuestions[question] || availableQuestions[0]
  const progress = Math.round((question / Math.max(1, questionQueue.length)) * 100)
  const rankedPlayers = [...players].sort((left, right) => (right.xp || 0) - (left.xp || 0))
  const userRank = rankedPlayers.findIndex((player) => player.id === user?.id) + 1 || rankedPlayers.length + 1

  const notify = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 1800)
  }

  const choose = (choice) => {
    if (selected || finished) return
    setSelected(choice)
    if (choice === current.answer) {
      const nextProfile = {
        xp: profile.xp + 250,
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
    setQuestionQueue(createQuestionQueue(level))
    setQuestion(0)
    setSelected(null)
    setErrors(0)
    setHints(2)
    setSeconds(0)
    setFinished(false)
    setShowHint(false)
    setActiveView('jouer')
  }

  const challengePlayer = (player) => {
    setChallengeTarget(player)
    notify(`Défi envoyé à ${player.name}`)
    setActiveView('defis')
  }

  const sendChallengeInvite = (event) => {
    event.preventDefault()
    const trimmed = challengeDraft.trim()
    if (!trimmed || !user) return
    const invite = {
      id: Date.now(),
      type: 'sent',
      recipient: trimmed,
      sender: user.name,
      status: 'En attente',
      createdAt: new Date().toLocaleString('fr-FR'),
    }
    setChallengeInvites((previous) => [invite, ...previous])
    setChallengeDraft('')
    setChallengeTarget({ name: trimmed })
    notify(`Invitation envoyée à ${trimmed}`)
  }

  const receiveChallengeInvite = () => {
    const sample = ['amira@email.com', 'samba@email.com', 'mariam@email.com']
    const randomEmail = sample[Math.floor(Math.random() * sample.length)]
    const invite = {
      id: Date.now() + 1,
      type: 'received',
      recipient: user?.name || 'Vous',
      sender: 'Système',
      status: 'À valider',
      createdAt: new Date().toLocaleString('fr-FR'),
      email: randomEmail,
    }
    setChallengeInvites((previous) => [invite, ...previous])
    notify(`Défi reçu de ${randomEmail}`)
  }

  const resolveInvite = (id, action) => {
    setChallengeInvites((previous) => previous.map((invite) => invite.id === id ? { ...invite, status: action === 'accept' ? 'Accepté' : 'Refusé' } : invite))
    notify(action === 'accept' ? 'Défi accepté' : 'Défi refusé')
  }

  return (
    <main className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Escape Flag"><span className="brand-mark"><i /><i /><i /><b>★</b></span><span>ESCAPE<span>FLAG</span></span></a>
        <nav>
          <button type="button" className={`nav-link ${activeView === 'jouer' ? 'active' : ''}`} onClick={() => setActiveView('jouer')}>JOUER</button>
          <button type="button" className={`nav-link ${activeView === 'profil' ? 'active' : ''}`} onClick={() => setActiveView('profil')}>PROFIL</button>
          <button type="button" className={`nav-link ${activeView === 'classement' ? 'active' : ''}`} onClick={() => setActiveView('classement')}>CLASSEMENT</button>
          <button type="button" className={`nav-link ${activeView === 'defis' ? 'active' : ''}`} onClick={() => setActiveView('defis')}>DÉFIS</button>
          <button type="button" className={`nav-link ${activeView === 'undercover' ? 'active' : ''}`} onClick={() => { setActiveView('undercover'); setUcState('setup'); }}>NOUVEAU JEU</button>
          {isAdmin && <button type="button" className={`nav-link ${activeView === 'admin' ? 'active' : ''}`} onClick={() => setActiveView('admin')}>ADMIN</button>}
        </nav>
        <div className="top-actions">
          <button type="button" className="theme-toggle" onClick={() => setTheme((value) => value === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '☾' : '☀'}</button>
          <button className="sound" onClick={() => setSound((value) => !value)} aria-label="Son"><Icon>{sound ? '♬' : '♪̸'}</Icon></button>
          {user && <button type="button" className="profile" onClick={() => setActiveView('profil')}><span className="avatar small">{user.avatar}</span><span className="online" /> {user.name}</button>}
        </div>
      </header>

      <section className="game-meta">
        <div className="room-title"><span className={serverOnline ? 'live-dot' : 'offline-dot'} /> {serverOnline ? 'SALLE CONNECTÉE' : 'SALLE HORS LIGNE'} <b>•</b> {players.length} JOUEUR .{players.length !== 1 ? 'S' : ''}</div>
        <div className="puzzle-tag"><span>QUESTION {String(question + 1).padStart(2, '0')}</span> <b>•</b> CULTURE GÉNÉRALE</div>
      </section>

      <section className="dashboard">
        {/* <div className="status-card time-card"><span className="status-label">TEMPS ÉCOULÉ</span><strong>{time}</strong><small>Record : {profile.bestTime}</small></div> */}
        <div className="status-card progress-card"><span className="status-label">PROGRESSION</span><div className="progress-figure"><strong>{progress}%</strong><span>{question}/12 questions</span></div><div className="bar"><i style={{ width: `${progress}%` }} /></div></div>
        <div className="status-card score-card"><span className="status-label">SCORE</span><strong>{Math.max(0, 900 - errors * 45 + profile.streak * 10)}</strong><small><span className="coin">✦</span> +250 XP par bonne réponse</small></div>
      </section>

      {activeView === 'jouer' && (
        <section className="content-grid" id="jouer">
          <article className="game-card">
            {!finished ? <>
              <div className="room-line"><span>QUESTION {question + 1} SUR {availableQuestions.length}</span><span className="difficulty">{current.theme}</span></div>
              <div className="question-intro"><span className="mini-star">✦</span><div><span className="eyebrow">QUIZ DE CULTURE GÉNÉRALE</span><h1>{current.prompt}</h1></div></div>
              <div className="question-stage"><div className="question-icon">{current.icon}</div><div className="question-meta"><h3>{current.theme}</h3><p>{current.explanation}</p></div></div>
              <div className="answers">
                {current.options.map((choice, index) => <button key={choice} onClick={() => choose(choice)} className={`answer ${selected === choice ? (choice === current.answer ? 'correct' : 'wrong') : ''}`}><span>{String.fromCharCode(65 + index)}</span>{choice}{selected === choice && choice === current.answer && <b>✓</b>}</button>)}
              </div>
              <div className="card-foot"><span>Choisis la bonne réponse pour monter de niveau.</span><button onClick={useHint} disabled={!hints || showHint} className="hint"><Icon>☼</Icon> {showHint ? current.explanation : `INDICE (${hints})`}</button></div>
            </> : <div className="escape-result"><div className="escape-stars">✧ </div><div className="open-door">🚪</div><span className="eyebrow">MISSION TERMINÉE</span><h1>Vous êtes devenu·e un expert !</h1><p>Temps final <b>{time}</b> · {errors} erreur{errors !== 1 ? 's' : ''}</p><button className="primary" onClick={restart}>REJOUER <span>→</span></button></div>}
          </article>

          <aside className="side-panel">
            <div className="side-head"><div><span className="eyebrow">EN DIRECT</span><h2>Joueurs connectés <span>{players.length}</span></h2></div><button className="more">•••</button></div>
            <div className="you-row"><span className="rank">1</span><span className="avatar">{user?.avatar}</span><div><b>Vous</b><small>{profile.completed}/12 questions</small></div><strong>{time}</strong></div>
            <div className="mini-bar"><i style={{ width: `${Math.max(progress, 6)}%` }} /></div>
            <div className="player-list">{players.filter((player) => player.id !== user?.id).length ? players.filter((player) => player.id !== user?.id).map((player, idx) => <div className="player" key={player.id}><span className="rank">{idx + 2}</span><span className="avatar" style={{ background: colors[idx % colors.length] }}>{player.avatar}</span><div><b>{player.name}</b><small>{player.country || 'Joueur actif'}</small></div><strong>{player.xp || 0} XP</strong><div className="player-progress"><i style={{ width: `${Math.min(100, (player.xp || 0) / 10)}%` }} /></div></div>) : <p className="empty-players">Aucun autre joueur connecté pour le moment.</p>}</div>
            <button className="view-all" onClick={() => setActiveView('classement')}>VOIR LE CLASSEMENT <span>→</span></button>
            <div className="tips"><span>✦</span><p><b>Astuce du jour</b>Plus le niveau grimpe, plus les questions deviennent exigeantes.</p></div>
          </aside>
        </section>
      )}

      {activeView === 'profil' && (
        <section className="detail-layout">
          <article className="detail-card">
            <div className="section-head"><div><span className="eyebrow">PROFIL</span><h2>Profil personnel</h2></div><span className="pill">{user?.name || 'Joueur'}</span></div>
            <div className="profile-hero">
              <div className="avatar large">{user?.avatar || 'U'}</div>
              <div>
                <h3>{user?.name || 'Nom à renseigner'}</h3>
                <p>{user?.country ? `${user.country} • ${user.countryCode || ''}` : 'Connexion en cours'}</p>
                <div className="profile-badges"><span>XP {profile.xp}</span><span>Niveau {level}</span><span>Série {profile.streak}</span></div>
              </div>
            </div>
            <div className="stats-grid">
              <div className="mini-stat"><strong>{profile.completed}</strong><span>Questions réussies</span></div>
              <div className="mini-stat"><strong>{profile.challenges}</strong><span>Défis lancés</span></div>
              <div className="mini-stat"><strong>{errors}</strong><span>Erreurs</span></div>
              <div className="mini-stat"><strong>{hints}</strong><span>Indices restants</span></div>
            </div>
            <div className="info-block">
              <h3>Profil professionnel</h3>
              <p>Ce tableau suit votre montée en niveau, vos performances et vos défis en cours.</p>
              <ul>
                <li>Objectif : atteindre le rang supérieur du classement.</li>
                <li>Compétence : répondre rapidement aux questions de culture générale.</li>
                <li>Statut : {profile.completed >= 6 ? 'Expert' : 'En apprentissage'}</li>
              </ul>
            </div>
          </article>
          <aside className="detail-card side-card">
            <div className="section-head"><div><span className="eyebrow">OBJECTIFS</span><h2>Prochain palier</h2></div></div>
            <div className="goal-card">
              <h3>{nextLevel} XP</h3>
              <p>Encore {Math.max(0, nextLevel - profile.xp)} XP avant le niveau suivant.</p>
              <div className="bar"><i style={{ width: `${Math.min(100, (profile.xp / nextLevel) * 100)}%` }} /></div>
            </div>
            <div className="goal-card accent">
              <h3>Rang actuel</h3>
              <p>{userRank > 0 ? `Vous êtes au rang #${userRank} sur ${rankedPlayers.length || 1} joueurs.` : 'Le classement se remplit au fur et à mesure des connexions.'}</p>
            </div>
          </aside>
        </section>
      )}

      {activeView === 'classement' && (
        <section className="detail-layout">
          <article className="detail-card">
            <div className="section-head"><div><span className="eyebrow">CLASSEMENT</span><h2>Classement global</h2></div><span className="pill">Visible pour tous</span></div>
            <div className="leaderboard-list">
              {rankedPlayers.length ? rankedPlayers.map((player, index) => <div className={`leaderboard-row ${player.id === user?.id ? 'is-self' : ''}`} key={player.id}><span className="rank-pill">#{index + 1}</span><div className="leaderboard-person"><span className="avatar" style={{ background: colors[index % colors.length] }}>{player.avatar}</span><div><b>{player.name}</b><small>{player.country || 'Joueur connecté'}</small></div></div><div className="leaderboard-meta"><strong>{player.xp || 0} XP</strong><span>{player.completed || 0}/12 questions • Niveau {Math.max(1, Math.floor((player.xp || 0) / 900) + 1)}</span></div></div>) : <p className="empty-players">Le classement sera visible dès qu’un autre joueur se connecte.</p>}
            </div>
          </article>
          <aside className="detail-card side-card">
            <div className="section-head"><div><span className="eyebrow">VOTRE PLACE</span><h2>Votre rang</h2></div></div>
            <div className="goal-card">
              <h3>#{userRank || '—'}</h3>
              <p>Vous êtes {userRank > 0 ? `au rang ${userRank}` : 'en attente de classement'} parmi les joueurs connectés.</p>
            </div>
            <div className="goal-card accent">
              <h3>Niveau {level}</h3>
              <p>Le niveau augmente avec vos bonnes réponses et votre progression dans le quiz.</p>
            </div>
          </aside>
        </section>
      )}

      {activeView === 'defis' && (
        <section className="detail-layout">
          <article className="detail-card">
            <div className="section-head"><div><span className="eyebrow">DÉFIS</span><h2>Envoyer et recevoir</h2></div><span className="pill">Mail</span></div>
            <form className="challenge-form" onSubmit={sendChallengeInvite}>
              <label htmlFor="challenge-email">Envoyer un défi par e-mail</label>
              <div className="challenge-form-row">
                <div className={`field ${challengeDraft ? (isValidEmail(challengeDraft) ? 'valid' : 'invalid') : ''}`}>
                  <FieldIcon name="mail" />
                  <input
                    id="challenge-email"
                    type="email"
                    value={challengeDraft}
                    onChange={(event) => setChallengeDraft(event.target.value)}
                    placeholder="prenom@email.com"
                  />
                  {challengeDraft && isValidEmail(challengeDraft) && <FieldIcon name="check" className="field-icon field-icon-right" />}
                </div>
                <button type="submit" className="primary small" disabled={!challengeDraft.trim() || !isValidEmail(challengeDraft)}>Envoyer</button>
              </div>
              {challengeDraft && !isValidEmail(challengeDraft) && <span className="field-hint">Format d’e-mail invalide</span>}
            </form>
            <button type="button" className="secondary" onClick={receiveChallengeInvite}>Recevoir un défi</button>
            <div className="challenge-list">
              {challengeInvites.length ? challengeInvites.map((invite) => <div className="challenge-item" key={invite.id}><div><b>{invite.type === 'sent' ? `Envoyé à ${invite.recipient}` : `${invite.sender} vous a défié`}</b><small>{invite.email || invite.recipient} • {invite.status} • {invite.createdAt}</small></div>{invite.type === 'received' ? <div className="challenge-actions"><button type="button" className="primary small" onClick={() => resolveInvite(invite.id, 'accept')}>Accepter</button><button type="button" className="secondary small" onClick={() => resolveInvite(invite.id, 'reject')}>Refuser</button></div> : <span className="pill subtle">{invite.status}</span>}</div>) : <p className="empty-players">Aucun défi pour le moment.</p>}
            </div>
          </article>
          <aside className="detail-card side-card">
            <div className="section-head"><div><span className="eyebrow">STATUT</span><h2>Défi courant</h2></div></div>
            <div className="goal-card accent">
              <h3>{challengeTarget ? `Défi ciblé : ${challengeTarget.name}` : 'Sélectionnez un joueur'}</h3>
              <p>Les invitations sont gérées depuis l’application avec un suivi simple de réception et d’envoi.</p>
            </div>
          </aside>
        </section>
      )}

      {activeView === 'undercover' && (
        <section className="detail-layout" id="undercover">
          <article className="detail-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">UNDERCOVER • JEU MULTIJOUEUR</span>
                <h2>Jeu de déduction et d’espionnage</h2>
              </div>
              <span className="pill">{ucMode === 'local' ? 'Local / Un seul appareil' : `En Ligne / Salon ${ucRoomId}`}</span>
            </div>

            <div className="auth-switch" style={{ marginBottom: '20px' }}>
              <button type="button" className={ucMode === 'local' ? 'selected' : ''} onClick={() => { leaveOnlineRoom(); setUcMode('local'); }}>🖥️ Mode Local</button>
              <button type="button" className={ucMode === 'online' ? 'selected' : ''} onClick={() => setUcMode('online')}>🌐 Mode En Ligne</button>
            </div>

            {/* --- MODE EN LIGNE (ONLINE) --- */}
            {ucMode === 'online' && !ucRoomId && (
              <div className="challenge-form">
                <h3>Rejoindre ou créer un salon de jeu en ligne</h3>
                <p style={{ color: '#767890', fontSize: '13px', marginBottom: '20px' }}>
                  Jouez en ligne avec vos amis sur plusieurs appareils en temps réel.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '20px' }}>
                  <button type="button" onClick={createOnlineRoom} className="primary" style={{ height: '48px' }}>
                    Créer un nouveau salon en ligne
                  </button>
                </div>

                <div style={{ borderTop: '1px solid #efeadd', paddingTop: '20px', marginTop: '10px' }}>
                  <h3>Rejoindre avec un code de salon</h3>
                  <div className="challenge-form-row">
                    <input
                      type="text"
                      placeholder="Code du salon (ex: AB3D9E)"
                      value={ucJoinIdInput}
                      onChange={(e) => setUcJoinIdInput(e.target.value.toUpperCase())}
                    />
                    <button type="button" onClick={() => joinOnlineRoom()} className="secondary" disabled={!ucJoinIdInput.trim()}>
                      Rejoindre
                    </button>
                  </div>
                </div>
              </div>
            )}

            {ucMode === 'online' && ucRoomId && ucRoom && (
              <div>
                {/* 1. SETUP / LOBBY PHASE */}
                {ucRoom.state === 'setup' && (
                  <div className="challenge-form">
                    <div className="goal-card accent" style={{ marginBottom: '20px' }}>
                      <span className="eyebrow">CODE D'INVITATION</span>
                      <h2 style={{ fontSize: '28px', margin: '5px 0', color: '#7253db', cursor: 'pointer' }} onClick={() => {
                        navigator.clipboard.writeText(ucRoomId);
                        notify('Code copié !');
                      }}>
                        {ucRoomId} 📋
                      </h2>
                      <p style={{ fontSize: '11px', color: '#a68c68' }}>Cliquez sur le code pour le copier et le partager avec vos amis.</p>
                    </div>

                    <h3>Joueurs présents ({ucRoom.players.length})</h3>
                    <div className="player-list" style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '20px' }}>
                      {ucRoom.players.map((player, idx) => (
                        <div key={player.id} className="player">
                          <span className="rank">{idx + 1}</span>
                          <span className="avatar" style={{ background: colors[idx % colors.length] }}>
                            {player.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <b>{player.name}</b>
                            {player.isHost && <small style={{ color: '#ab843e' }}>👑 Hôte</small>}
                          </div>
                          {ucRoom.distributorId === player.id && (
                            <span className="pill" style={{ marginLeft: 'auto', background: '#eaf6ee', color: '#2f6b45' }}>Distributeur</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Hôte Controls */}
                    {ucRoom.hostId === getLocalPlayerId() ? (
                      <div style={{ borderTop: '1px solid #efeadd', paddingTop: '15px' }}>
                        <h3>Paramètres de la partie (Hôte)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                          <label>
                            Distributeur des mots
                            <select
                              value={ucRoom.distributorId || ''}
                              onChange={(e) => chooseOnlineDistributor(e.target.value)}
                            >
                              <option value="">-- Choisir un joueur --</option>
                              {ucRoom.players.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Nombre d'Undercovers
                            <select
                              value={ucUndercoversCount}
                              onChange={(e) => setUcUndercoversCount(Number(e.target.value))}
                            >
                              <option value="1">1 Undercover</option>
                              <option value="2">2 Undercovers</option>
                            </select>
                          </label>
                        </div>

                        <button
                          type="button"
                          className="primary"
                          style={{ width: '100%' }}
                          disabled={!ucRoom.distributorId}
                          onClick={() => {
                            if (ucRoom.distributorId === getLocalPlayerId()) {
                              // If host is also distributor, open choice panel directly or seed automatically
                              const pair = ucWordPairs[Math.floor(Math.random() * ucWordPairs.length)]
                              setOnlineWords(pair.civil, pair.undercover, ucUndercoversCount, ucWhitesCount)
                            } else {
                              // Distributor is another player: set empty words, let them set it
                              setOnlineWords('?', '?', ucUndercoversCount, ucWhitesCount)
                            }
                          }}
                        >
                          Lancer la distribution <span>→</span>
                        </button>
                      </div>
                    ) : (
                      <div className="goal-card" style={{ background: '#f8f5ee', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#767890' }}>
                          En attente que l'hôte lance la partie et désigne le distributeur des mots...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DISTRIBUTOR PANEL */}
                {ucRoom.state === 'reveal' && ucRoom.distributorId === getLocalPlayerId() && (ucRoom.civilWord === '?' || !ucRoom.civilWord) && (
                  <div className="challenge-form">
                    <h3>Panneau du Distributeur</h3>
                    <p style={{ color: '#767890', fontSize: '13px', marginBottom: '15px' }}>
                      Vous êtes le distributeur désigné ! Choisissez le mot des Civils et le mot des Undercovers.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                      <label>
                        Mot des Civils
                        <input
                          type="text"
                          placeholder="Ex: Banane"
                          value={newCivilWord}
                          onChange={(e) => setNewCivilWord(e.target.value)}
                        />
                      </label>
                      <label>
                        Mot des Undercovers
                        <input
                          type="text"
                          placeholder="Ex: Mangue"
                          value={newUndercoverWord}
                          onChange={(e) => setNewUndercoverWord(e.target.value)}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      className="primary"
                      style={{ width: '100%', marginBottom: '20px' }}
                      disabled={!newCivilWord.trim() || !newUndercoverWord.trim()}
                      onClick={() => {
                        setOnlineWords(newCivilWord.trim(), newUndercoverWord.trim(), ucRoom.undercoversCount, ucRoom.whitesCount);
                        setNewCivilWord('');
                        setNewUndercoverWord('');
                      }}
                    >
                      Distribuer les mots secrets <span>→</span>
                    </button>
                  </div>
                )}

                {/* 3. REVEAL & CLUE SUBMIT PHASE */}
                {ucRoom.state === 'reveal' && (ucRoom.distributorId !== getLocalPlayerId() || (ucRoom.civilWord !== '?' && ucRoom.civilWord)) && (
                  <div style={{ textAlign: 'center', padding: '15px 0' }}>
                    <span className="eyebrow">PHASE D'INDICE & RÉVÉLATION</span>

                    <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '380px', textAlign: 'center' }}>
                      <span className="eyebrow">VOTRE MOT SECRET</span>
                      <h2 style={{ fontSize: '28px', margin: '10px 0', color: '#ab843e' }}>
                        {ucRoom.players.find(p => p.id === getLocalPlayerId())?.role === 'mrwhite' ? '🕵️‍♂️ Vous êtes M. White !' : ucRoom.players.find(p => p.id === getLocalPlayerId())?.word}
                      </h2>
                      {ucRoom.players.find(p => p.id === getLocalPlayerId())?.role === 'mrwhite' ? (
                        <p style={{ fontSize: '11px', color: '#a68c68' }}>Vous n'avez pas de mot secret. Écoutez attentivement les autres pour deviner le mot des Civils.</p>
                      ) : (
                        <p style={{ fontSize: '11px', color: '#a68c68' }}>Décrivez ce mot avec un seul indice sans le prononcer directement.</p>
                      )}
                    </div>

                    {!ucRoom.clues[getLocalPlayerId()] ? (
                      <div className="challenge-form" style={{ maxWidth: '380px', margin: '0 auto' }}>
                        <input
                          type="text"
                          placeholder="Entrez votre indice (un seul mot)"
                          value={ucClueInput}
                          onChange={(e) => setUcClueInput(e.target.value)}
                        />
                        <button type="button" onClick={submitOnlineClue} className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={!ucClueInput.trim()}>
                          Soumettre mon indice
                        </button>
                      </div>
                    ) : (
                      <div className="goal-card" style={{ background: '#eaf6ee', color: '#2f6b45', maxWidth: '380px', margin: '0 auto' }}>
                        <p style={{ margin: 0 }}>✓ Votre indice a été soumis : <strong>{ucRoom.clues[getLocalPlayerId()]}</strong></p>
                      </div>
                    )}

                    <h3 style={{ marginTop: '30px' }}>Indicateur de soumission ({Object.keys(ucRoom.clues).length} / {ucRoom.players.filter(p => !p.isEliminated).length})</h3>
                    <div className="player-list">
                      {ucRoom.players.map((p, idx) => (
                        <div key={p.id} className="player" style={{ opacity: p.isEliminated ? 0.4 : 1 }}>
                          <span className="avatar" style={{ background: colors[idx % colors.length] }}>
                            {p.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <b>{p.name}</b>
                            <small>{p.isEliminated ? 'Éliminé' : ucRoom.clues[p.id] ? '✓ Indice soumis' : 'En attente...'}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. DESCRIBE / PLAY PHASE */}
                {ucRoom.state === 'describe' && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <span className="eyebrow">MANCHE {ucRoom.round}</span>
                      <h2>Nouvelle Phase de Description</h2>
                      <p style={{ color: '#767890', fontSize: '13px' }}>
                        Entrez un nouvel indice pour orienter le débat.
                      </p>
                    </div>

                    {!ucRoom.clues[getLocalPlayerId()] && !ucRoom.players.find(p => p.id === getLocalPlayerId())?.isEliminated ? (
                      <div className="challenge-form" style={{ maxWidth: '380px', margin: '0 auto 20px' }}>
                        <input
                          type="text"
                          placeholder="Entrez votre nouvel indice"
                          value={ucClueInput}
                          onChange={(e) => setUcClueInput(e.target.value)}
                        />
                        <button type="button" onClick={submitOnlineClue} className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={!ucClueInput.trim()}>
                          Soumettre mon indice
                        </button>
                      </div>
                    ) : (
                      <div className="goal-card" style={{ background: '#eaf6ee', color: '#2f6b45', maxWidth: '380px', margin: '0 auto 20px' }}>
                        <p style={{ margin: 0 }}>✓ Indice soumis. En attente des autres joueurs...</p>
                      </div>
                    )}

                    <div className="player-list">
                      {ucRoom.players.map((p, idx) => (
                        <div key={p.id} className="player" style={{ opacity: p.isEliminated ? 0.4 : 1 }}>
                          <span className="avatar" style={{ background: colors[idx % colors.length] }}>
                            {p.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <b>{p.name}</b>
                            <small>{p.isEliminated ? 'Éliminé' : ucRoom.clues[p.id] ? `Indice : ${ucRoom.clues[p.id]}` : 'Réflechit...'}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. VOTE PHASE */}
                {ucRoom.state === 'vote' && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <span className="eyebrow">MANCHE {ucRoom.round} • ÉLIMINATION</span>
                      <h2>Débat & Votes</h2>
                      <p style={{ color: '#767890', fontSize: '13px' }}>
                        Discutez dans le chat du salon et votez contre le joueur suspect.
                      </p>
                    </div>

                    {!ucRoom.votes[getLocalPlayerId()] && !ucRoom.players.find(p => p.id === getLocalPlayerId())?.isEliminated ? (
                      <div className="player-list">
                        {ucRoom.players.filter(p => !p.isEliminated && p.id !== getLocalPlayerId()).map((p, idx) => (
                          <div key={p.id} className="player">
                            <span className="avatar" style={{ background: colors[idx % colors.length] }}>
                              {p.name.slice(0, 1).toUpperCase()}
                            </span>
                            <div>
                              <b>{p.name}</b>
                              <small>Indice: {ucRoom.clues[p.id] || '—'}</small>
                            </div>
                            <button type="button" onClick={() => submitOnlineVote(p.id)} className="secondary small" style={{ marginLeft: 'auto', borderColor: '#f4c6c6', color: '#c54b4b' }}>
                              Voter contre
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="goal-card" style={{ background: '#eaf6ee', color: '#2f6b45', textAlign: 'center', marginBottom: '20px' }}>
                        <p style={{ margin: 0 }}>✓ Votre vote a été enregistré. En attente des autres votes ({Object.keys(ucRoom.votes).length} / {ucRoom.players.filter(p => !p.isEliminated).length}).</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. RESULT PHASE */}
                {ucRoom.state === 'result' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div className="escape-stars" style={{ fontSize: '32px' }}>👑</div>
                    <span className="eyebrow">FIN DE PARTIE</span>
                    <h1 style={{ fontSize: '28px', margin: '10px 0' }}>Victoire des {ucRoom.winner} !</h1>

                    <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '420px', textAlign: 'left' }}>
                      <h3>Révélation des mots de la partie :</h3>
                      <p>Civils : <strong>{ucRoom.civilWord}</strong></p>
                      <p>Undercovers : <strong>{ucRoom.undercoverWord}</strong></p>

                      <div style={{ marginTop: '15px', borderTop: '1px solid #efeadd', paddingTop: '10px' }}>
                        {ucRoom.players.map((p) => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0' }}>
                            <span>{p.name} {p.isEliminated && '💀'}</span>
                            <strong style={{ textTransform: 'capitalize' }}>
                              {p.role === 'civil' ? 'Civil' : p.role === 'undercover' ? 'Undercover' : 'M. White'}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {ucRoom.hostId === getLocalPlayerId() ? (
                      <button type="button" onClick={resetOnlineRoom} className="primary" style={{ width: '100%' }}>
                        Relancer une manche <span>→</span>
                      </button>
                    ) : (
                      <div className="goal-card" style={{ background: '#f8f5ee' }}>
                        <p style={{ margin: 0, color: '#767890' }}>En attente que l'hôte relance une nouvelle manche...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ONLINE GAME FOOTER ACTIONS */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #efeadd', paddingTop: '15px' }}>
                  <button type="button" onClick={leaveOnlineRoom} className="secondary small" style={{ marginLeft: 'auto' }}>
                    Quitter le Salon
                  </button>
                </div>
              </div>
            )}

            {/* --- MODE LOCAL --- */}
            {ucMode === 'local' && (
              <div>
                {ucState === 'setup' && (
                  <div className="challenge-form">
                    <h3>1. Configurer les joueurs</h3>
                    <form onSubmit={addUcPlayer} className="challenge-form-row" style={{ marginBottom: '15px' }}>
                      <input
                        required
                        type="text"
                        placeholder="Nom du joueur (ex. Fustel)"
                        value={ucNewPlayerName}
                        onChange={(e) => setUcNewPlayerName(e.target.value)}
                      />
                      <button type="submit" className="primary small">Ajouter</button>
                    </form>

                    <div className="player-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                      {ucPlayers.map((player, idx) => (
                        <div key={player.id} className="player">
                          <span className="rank">{idx + 1}</span>
                          <span className="avatar" style={{ background: colors[idx % colors.length] }}>
                            {player.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <b>{player.name}</b>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUcPlayer(player.id)}
                            className="secondary small"
                            style={{ marginLeft: 'auto', color: '#d3564f', borderColor: '#f4c6c6' }}
                          >
                            Retirer
                          </button>
                        </div>
                      ))}
                    </div>

                    <h3>2. Paramètres du jeu</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <label>
                        Nombre d'Undercovers
                        <select
                          value={ucUndercoversCount}
                          onChange={(e) => setUcUndercoversCount(Number(e.target.value))}
                        >
                          <option value="1">1 Undercover</option>
                          <option value="2">2 Undercovers</option>
                        </select>
                      </label>
                      <label>
                        Nombre de M. White (sans mot)
                        <select
                          value={ucWhitesCount}
                          onChange={(e) => setUcWhitesCount(Number(e.target.value))}
                        >
                          <option value="0">0 M. White</option>
                          <option value="1">1 M. White</option>
                        </select>
                      </label>
                    </div>

                    <button type="button" onClick={startUndercover} className="primary" style={{ width: '100%' }}>
                      Distribuer les rôles et démarrer <span>→</span>
                    </button>
                  </div>
                )}

                {ucState === 'reveal' && (
                  <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                    <span className="eyebrow">ÉTAPE 2 : RÉVÉLATION SECRÈTE</span>
                    <h3 style={{ fontSize: '22px', margin: '15px 0' }}>C'est au tour de : <strong style={{ color: '#7253db' }}>{ucPlayers[ucRevealIndex]?.name}</strong></h3>
                    <p style={{ color: '#767890', marginBottom: '25px' }}>Passez l'appareil à {ucPlayers[ucRevealIndex]?.name}. Les autres joueurs ne doivent pas regarder l'écran.</p>

                    {!ucShowWord ? (
                      <button type="button" onClick={() => setUcShowWord(true)} className="primary">
                        Afficher mon mot secret
                      </button>
                    ) : (
                      <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '340px' }}>
                        <span className="eyebrow">VOTRE MOT SECRET</span>
                        <h2 style={{ fontSize: '28px', margin: '10px 0', color: '#ab843e' }}>
                          {ucPlayers[ucRevealIndex]?.role === 'mrwhite' ? '🕵️‍♂️ Vous êtes M. White !' : ucPlayers[ucRevealIndex]?.word}
                        </h2>
                        {ucPlayers[ucRevealIndex]?.role === 'mrwhite' ? (
                          <p style={{ fontSize: '12px', color: '#a68c68' }}>Vous n'avez pas de mot. Votre but est de deviner le mot des Civils sans vous faire démasquer.</p>
                        ) : (
                          <p style={{ fontSize: '12px', color: '#a68c68' }}>Décrivez ce mot lors de votre tour sans le prononcer directement !</p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setUcShowWord(false);
                            if (ucRevealIndex < ucPlayers.length - 1) {
                              setUcRevealIndex(ucRevealIndex + 1);
                            } else {
                              setUcState('describe');
                            }
                          }}
                          className="primary small"
                          style={{ marginTop: '15px' }}
                        >
                          J'ai compris, masquer et continuer <span>→</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {ucState === 'describe' && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                      <span className="eyebrow">MANCHE {ucRound}</span>
                      <h2>Phase de Description</h2>
                      <p style={{ color: '#767890', fontSize: '13px' }}>
                        Chaque joueur doit donner à tour de rôle **un seul mot** décrivant son mot secret.
                        <br />M. White doit essayer de s'adapter et d'inventer un mot cohérent pour se fondre dans la masse.
                      </p>
                    </div>

                    <div className="player-list" style={{ marginBottom: '25px' }}>
                      {ucPlayers.map((player, idx) => (
                        <div key={player.id} className="player" style={{ opacity: player.isEliminated ? 0.4 : 1 }}>
                          <span className="avatar" style={{ background: colors[idx % colors.length] }}>
                            {player.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <b>{player.name}</b>
                            <small>{player.isEliminated ? '❌ Éliminé' : '🟢 En jeu'}</small>
                          </div>
                          {!player.isEliminated && (
                            <span className="pill subtle" style={{ marginLeft: 'auto' }}>Doit parler</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <button type="button" onClick={() => setUcState('vote')} className="primary" style={{ width: '100%' }}>
                      Passer au vote d'élimination <span>→</span>
                    </button>
                  </div>
                )}

                {ucState === 'vote' && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                      <span className="eyebrow">VOTE ET ÉLIMINATION</span>
                      <h2>Qui est l’intrus ?</h2>
                      <p style={{ color: '#767890', fontSize: '13px' }}>
                        Débattez ensemble pour démasquer l'Undercover ou M. White. Votez pour éliminer un joueur.
                      </p>
                    </div>

                    <div className="player-list">
                      {ucPlayers.filter(p => !p.isEliminated).map((player, idx) => (
                        <div key={player.id} className="player">
                          <span className="avatar" style={{ background: colors[idx % colors.length] }}>
                            {player.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <b>{player.name}</b>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminateUcPlayer(player.id)}
                            className="secondary small"
                            style={{ marginLeft: 'auto', color: '#c54b4b', borderColor: '#f4c6c6' }}
                          >
                            Voter contre / Éliminer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ucState === 'result' && (
                  <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                    <div className="escape-stars" style={{ fontSize: '32px' }}>👑</div>
                    <span className="eyebrow" style={{ letterSpacing: '2px' }}>FIN DE PARTIE</span>
                    <h1 style={{ fontSize: '28px', margin: '15px 0' }}>Victoire des {ucWinner} !</h1>

                    <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '400px', textAlign: 'left' }}>
                      <h3>Révélation des mots de la partie :</h3>
                      <p>Civils : <strong>{ucSelectedPair.civil}</strong></p>
                      <p>Undercovers : <strong>{ucSelectedPair.undercover}</strong></p>

                      <div style={{ marginTop: '15px', borderTop: '1px solid #efeadd', paddingTop: '10px' }}>
                        {ucPlayers.map((player) => (
                          <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0' }}>
                            <span>{player.name}</span>
                            <strong style={{ textTransform: 'capitalize' }}>
                              {player.role === 'civil' ? 'Civil' : player.role === 'undercover' ? 'Undercover' : 'M. White'}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="button" onClick={() => setUcState('setup')} className="primary">
                      Rejouer une partie <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>

          <aside className="detail-card side-card">
            {/* ONLINE LIVE CHAT */}
            {ucMode === 'online' && ucRoomId && ucRoom && (
              <div style={{ marginBottom: '25px', borderBottom: '1px solid #efeadd', paddingBottom: '20px' }}>
                <div className="section-head">
                  <div>
                    <span className="eyebrow">DISCUSSIONS</span>
                    <h2>Chat du Salon</h2>
                  </div>
                </div>
                <div style={{ height: '180px', overflowY: 'auto', background: '#fbf8f3', border: '1px solid #ece7dd', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                  {ucRoom.chat.length ? ucRoom.chat.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#7253db', fontWeight: '700' }}>{msg.sender}</span> <small style={{ color: '#9b98a6' }}>{msg.timestamp}</small>
                      <p style={{ margin: '2px 0 0 0', color: '#35354b' }}>{msg.message}</p>
                    </div>
                  )) : (
                    <p style={{ fontSize: '11px', color: '#9997a6', textAlign: 'center', marginTop: '60px' }}>Aucun message. Dites bonjour !</p>
                  )}
                </div>
                <form onSubmit={sendOnlineChatMessage} style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="text"
                    placeholder="Tapez un message..."
                    value={ucChatInput}
                    onChange={(e) => setUcChatInput(e.target.value)}
                    style={{ flex: 1, height: '36px' }}
                  />
                  <button type="submit" className="primary small" style={{ height: '36px' }}>Envoyer</button>
                </form>
              </div>
            )}

            {/* SUGGESTIONS LIST */}
            <div style={{ marginBottom: '25px' }}>
              <div className="section-head">
                <div>
                  <span className="eyebrow">SUGGESTIONS</span>
                  <h2>Paires de Mots</h2>
                </div>
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                {[...ucWordPairs, ...customWordPairs].map((pair, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (ucRoom?.distributorId === getLocalPlayerId()) {
                        setNewCivilWord(pair.civil);
                        setNewUndercoverWord(pair.undercover);
                        notify('Mots sélectionnés !');
                      }
                    }}
                    style={{
                      padding: '8px',
                      background: '#fbf8f3',
                      border: '1px solid #ece7dd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: ucRoom?.distributorId === getLocalPlayerId() ? 'pointer' : 'default',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Civil : <strong>{pair.civil}</strong></span>
                    <span style={{ color: '#767890' }}>Intrus : <strong>{pair.undercover}</strong></span>
                  </div>
                ))}
              </div>

              {/* Add custom pair */}
              <div style={{ borderTop: '1px solid #efeadd', paddingTop: '10px' }}>
                <span className="eyebrow">AJOUTER UNE NOUVELLE PAIRE</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
                  <input
                    type="text"
                    placeholder="Civil"
                    id="new-civil-input"
                    style={{ height: '32px', fontSize: '11px' }}
                  />
                  <input
                    type="text"
                    placeholder="Intrus"
                    id="new-undercover-input"
                    style={{ height: '32px', fontSize: '11px' }}
                  />
                </div>
                <button
                  type="button"
                  className="secondary small"
                  style={{ width: '100%', marginTop: '5px', height: '30px', padding: '0' }}
                  onClick={() => {
                    const c = document.getElementById('new-civil-input')?.value?.trim();
                    const u = document.getElementById('new-undercover-input')?.value?.trim();
                    if (c && u) {
                      setCustomWordPairs([...customWordPairs, { civil: c, undercover: u }]);
                      document.getElementById('new-civil-input').value = '';
                      document.getElementById('new-undercover-input').value = '';
                      notify('Paire ajoutée !');
                    }
                  }}
                >
                  Ajouter la paire
                </button>
              </div>
            </div>

            <div className="section-head">
              <div>
                <span className="eyebrow">RÈGLES DU JEU</span>
                <h2>Comment jouer</h2>
              </div>
            </div>
            <div className="info-block">
              <p>🕵️‍♂️ **Undercover** est un jeu de société de déduction en groupe.</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                <li>**Civils** : Reçoivent tous le même mot secret.</li>
                <li>**Undercover** : Reçoivent un mot légèrement différent.</li>
                <li>**M. White** : Ne reçoivent aucun mot. Ils doivent deviner le mot en écoutant les autres.</li>
              </ul>
              <p style={{ marginTop: '10px' }}>À chaque tour, éliminez le joueur le plus suspect !</p>
            </div>
          </aside>
        </section>
      )}

      {activeView === 'admin' && isAdmin && (
        <section className="detail-layout">
          <article className="detail-card">
            <div className="section-head"><div><span className="eyebrow">ADMIN</span><h2>Console d’administration</h2></div><span className="pill">Vue privée</span></div>
            <div className="admin-metrics"><div><strong>{adminMetrics.users}</strong><span>Comptes</span></div><div><strong>{adminMetrics.sessions}</strong><span>Sessions</span></div><div><strong>{adminMetrics.activeSessions}</strong><span>En cours</span></div></div>
            <div className="admin-table">
              <div className="admin-row admin-head"><span>Joueur</span><span>Contact</span><span>Statut</span></div>
              {adminPlayers.length ? adminPlayers.map((player) => <div className="admin-row" key={player.id}><span>{player.name}</span><span className="contact-pill">{player.country || '—'} • Niveau {player.level || 1}</span><span>{player.role === 'admin' ? 'Admin' : player.role === 'moderator' ? 'Modérateur' : 'Actif'}</span></div>) : <p className="empty-players">Aucune donnée disponible pour l’instant.</p>}
            </div>
          </article>
        </section>
      )}

      <section className="bottom-strip"><div><span className="eyebrow">TA PROGRESSION</span><b>Niveau {level} <em>{profile.completed >= 6 ? 'Explorateur expert' : 'Explorateur'}</em></b></div><div className="xp"><span>{profile.xp} / {nextLevel} XP</span><div className="bar"><i style={{ width: `${Math.min(100, (profile.xp / nextLevel) * 100)}%` }} /></div></div><div className="stats"><span>◉ {errors} erreur{errors !== 1 ? 's' : ''}</span><span>☼ {hints} indice</span><span>⚡ Série x{profile.streak}</span></div></section>
      {toast && <div className="toast">{toast}</div>}
      {!user && (
        <div className="auth-overlay">
          <form className="auth-card" onSubmit={submitAuth}>
            <a className="brand" href="#top">
              <span className="brand-mark"><i /><i /><i /><b>★</b></span>
              <span>ESCAPE<span>FLAG</span></span>
            </a>

            <div className="auth-title">
              <h2>{authMode === 'register' ? 'Créer un compte' : 'Bon retour !'}</h2>
              <p>{authMode === 'register' ? 'Rejoignez l’aventure en quelques secondes.' : 'Connectez-vous pour reprendre votre progression.'}</p>
              <div className="auth-switch">
                <button type="button" className={authMode === 'login' ? 'selected' : ''} onClick={() => { setAuthMode('login'); setAuthNotice(''); setAuthError(''); setAuth(prev => ({ ...prev, name: prev.name || '' })) }}>Connexion</button>
                <button type="button" className={authMode === 'register' ? 'selected' : ''} onClick={() => { setAuthMode('register'); setAuthNotice(''); setAuthError(''); setAuth(prev => ({ ...prev, name: prev.name || '' })) }}>Créer un compte</button>
              </div>
            </div>

            {authMode === 'register' && (
              <label>
                Votre nom
                <div className={`field ${auth.name ? (auth.name.trim().length >= 2 ? 'valid' : 'invalid') : ''}`}>
                  <FieldIcon name="user" />
                  <input
                    required
                    minLength="2"
                    placeholder="Ex. Fustel"
                    value={auth.name}
                    onChange={(event) => setAuth({ ...auth, name: event.target.value })}
                  />
                  {auth.name.trim().length >= 2 && <FieldIcon name="check" className="field-icon field-icon-right" />}
                </div>
              </label>
            )}

            <label>
              Email ou numéro de téléphone
              <div className={`field ${auth.login ? (isValidEmail(auth.login) || /^[0-9\s\-()+]+$/.test(auth.login) ? 'valid' : 'invalid') : ''}`}>
                <FieldIcon name={auth.login && isValidEmail(auth.login) ? "mail" : (auth.login && /^[0-9\s\-()+]+$/.test(auth.login) ? "phone" : "user")} />
                <input
                  required
                  type="text"
                  placeholder="Entrez votre email ou votre numéro de téléphone"
                  value={auth.login || ''}
                  onChange={(event) => setAuth({ ...auth, login: event.target.value })}
                />
                {auth.login && (isValidEmail(auth.login) || /^[0-9\s\-()+]+$/.test(auth.login)) && <FieldIcon name="check" className="field-icon field-icon-right" />}
              </div>
              {auth.login && !isValidEmail(auth.login) && !/^[0-9\s\-()+]+$/.test(auth.login) && <span className="field-hint">Format invalide (email ou téléphone attendu)</span>}
            </label>

            {authMode === 'register' && (
              <label>
                Pays
                <div className="field">
                  <FieldIcon name="globe" />
                  <select
                    value={auth.country}
                    onChange={(event) => {
                      const selected = countries.find((item) => item.name === event.target.value) || countries[0]
                      setAuth({ ...auth, country: selected.name, countryCode: selected.dialCode })
                    }}
                  >
                    {countries.map((country) => <option key={country.name} value={country.name}>{country.flag} {country.name} • {country.continent}</option>)}
                  </select>
                </div>
              </label>
            )}

            <label>
              Mot de passe
              <div className="password-input-group">
                <div className={`field ${auth.password ? (auth.password.length >= 8 ? 'valid' : 'invalid') : ''}`}>
                  <FieldIcon name="lock" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    minLength="8"
                    autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                    placeholder="8 caractères minimum"
                    value={auth.password}
                    onChange={(event) => setAuth({ ...auth, password: event.target.value })}
                  />
                </div>
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              {authMode === 'register' && auth.password && (
                <div className={`password-strength ${passwordStrength.level}`}>
                  <div className="password-strength-bar"><i style={{ width: `${passwordStrength.percent}%` }} /></div>
                  <small>{passwordStrength.label}</small>
                </div>
              )}
            </label>

            <label className="remember-option">
              <input type="checkbox" checked={rememberAuth} onChange={(event) => setRememberAuth(event.target.checked)} />
              <span>Se souvenir de moi</span>
            </label>

            {authError && (
              <p className="auth-error">
                <FieldIcon name="alert" />
                <span>{authError}</span>
              </p>
            )}

            <button className="auth-submit" disabled={authLoading}>
              {authLoading && <span className="spinner" />}
              {authLoading ? 'Connexion…' : authMode === 'register' ? 'Créer mon compte' : 'Se connecter'}
            </button>

            {/* <div className={`server-state ${serverOnline ? 'connected' : ''}`}>
              <i /> {serverOnline ? 'Base Supabase connectée' : 'Configuration Supabase requise'}
            </div> */}
          </form>
        </div>
      )}
    </main>
  )
}

export default App
