// [LOGIN] [REGISTER] Contexte central de session : identité, profil, classement,
// vue admin et état des formulaires d'authentification par pseudo.
import { createContext, useEffect, useState } from 'react'
import { loginRequest, registerRequest, resendConfirmationRequest } from '../services/authService'
import { fetchPlayers, updateProfile } from '../services/profileService'
import { API_URL } from '../services/apiClient'
import { useToast } from '../hooks/useToast'

export const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'escape-flag-auth'
// country/countryCode démarrent vides (pas de "Sénégal" par défaut) pour laisser une
// chance réelle à la détection automatique de PhoneCountryPicker (section 12) de
// s'exécuter au premier montage — elle ne se déclenche que si aucun pays n'est déjà
// sélectionné, et retombe elle-même sur le Sénégal si la détection échoue.
const defaultAuthState = {
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: '',
  country: '',
  countryCode: '',
}
const defaultProfile = { xp: 0, level: 1, streak: 0, completed: 0, challenges: 0, bestTime: '00:00' }

export function AuthProvider({ children }) {
  const { notify } = useToast()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(defaultProfile)
  const [accessToken, setAccessToken] = useState('')
  const [players, setPlayers] = useState([])
  const [serverOnline, setServerOnline] = useState(false)

  const [auth, setAuth] = useState(() => {
    if (typeof window === 'undefined') return defaultAuthState
    try {
      const saved = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (!saved) return defaultAuthState
      // Seul le pseudo est mémorisé côté client (jamais le mot de passe).
      return { ...defaultAuthState, ...JSON.parse(saved), password: '', passwordConfirmation: '' }
    } catch {
      return defaultAuthState
    }
  })
  const [rememberAuth, setRememberAuth] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY))
    } catch {
      return false
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/health`).then((response) => setServerOnline(response.ok)).catch(() => setServerOnline(false))
  }, [])

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator'

  const loadPlayers = async () => {
    setPlayers(await fetchPlayers())
  }

  const persistProfile = async (nextProfile, currentUser = user) => {
    if (!currentUser?.id) return
    try {
      const updated = await updateProfile(currentUser.id, accessToken, {
        ...nextProfile,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        // Le pays du compte réellement enregistré, pas `auth.country` (état du
        // formulaire d'inscription, vide ou obsolète après connexion à un compte
        // existant) — bug préexistant découvert en testant la Phase 8 : chaque
        // sauvegarde d'XP écrasait le pays du profil avec la valeur du formulaire.
        country: currentUser.country,
        countryCode: currentUser.countryCode,
      })
      setProfile(updated || nextProfile)
    } catch (error) {
      console.warn('Profil non synchronisé', error)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadPlayers().catch((error) => console.warn('Chargement des joueurs impossible', error))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Logique commune une fois la session obtenue (login réussi OU inscription avec
  // confirmation e-mail désactivée côté Supabase). Point important : `setUser` (qui
  // fait disparaître la fenêtre de connexion) est planifié via setTimeout plutôt
  // qu'attendu directement — cette fonction doit se résoudre tout de suite pour que
  // le bouton de connexion passe à son état "succès" (coché) ; si `setUser` était
  // attendu ICI avant de retourner, le bouton resterait bloqué en "chargement"
  // pendant toute la pause et on ne verrait jamais l'animation de succès.
  const finalizeAuthSuccess = async (data) => {
    const nextUser = { ...data.user }
    setAccessToken(data.session.access_token)
    // `POST /api/auth/login` ne renvoie pas de champ `profile` séparé (seule
    // l'inscription initiale le fait) — mais `data.user` contient déjà xp/level/
    // streak/etc. (voir publicProfile côté serveur). Sans ce repli, la progression
    // semblait repartir de zéro à CHAQUE connexion alors qu'elle était bien
    // enregistrée en base — bug préexistant, découvert en testant la Phase 4.
    setProfile(
      data.profile || {
        xp: nextUser.xp ?? defaultProfile.xp,
        level: nextUser.level ?? defaultProfile.level,
        streak: nextUser.streak ?? defaultProfile.streak,
        completed: nextUser.completed ?? defaultProfile.completed,
        challenges: nextUser.challenges ?? defaultProfile.challenges,
        bestTime: nextUser.bestTime ?? defaultProfile.bestTime,
      }
    )
    if (typeof window !== 'undefined') {
      if (rememberAuth) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ username: auth.username, country: auth.country, countryCode: auth.countryCode }))
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    await loadPlayers()

    // Un admin/modérateur gère le site, il n'y "joue" pas (interface dédiée sur
    // /admin, sans XP ni niveau) — le message de bienvenue reflète ce rôle plutôt
    // que de parler d'"univers de jeu" comme pour un joueur.
    const pseudo = nextUser.username || nextUser.name
    notify(
      ['admin', 'moderator'].includes(nextUser.role)
        ? `Bienvenue dans la console d’administration, ${pseudo} !`
        : `Bienvenue dans ton univers de jeu, ${pseudo} !`
    )
    // Volontairement non attendu (voir commentaire ci-dessus) : laisse l'icône de
    // succès du bouton et ce message visibles un instant avant que la fenêtre de
    // connexion ne se ferme, au lieu d'un basculement instantané.
    setTimeout(() => setUser(nextUser), 1000)

    return nextUser
  }

  // Connexion : appelle exclusivement POST /api/auth/login avec { username, password }.
  // Repropage l'erreur (après avoir renseigné authError) pour que le bouton "glisser
  // pour se connecter" puisse afficher son icône d'échec — les appelants qui n'en ont
  // pas besoin (soumission classique du formulaire) l'avalent eux-mêmes.
  const loginAccount = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    setAuthLoading(true)
    try {
      const data = await loginRequest(auth.username.trim(), auth.password)
      await finalizeAuthSuccess(data)
    } catch (error) {
      setAuthError(error.message === 'Failed to fetch' ? 'Backend indisponible. Lancez npm run server.' : error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  // Inscription : appelle exclusivement POST /api/auth/register avec le profil complet.
  // Repropage l'erreur (comme loginAccount) pour que le bouton animé "Créer un
  // compte" puisse afficher son icône d'échec — y compris pour l'échec de validation
  // locale (mots de passe différents), sans quoi le bouton afficherait à tort une
  // coche de succès.
  const registerAccount = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')

    if (auth.password !== auth.passwordConfirmation) {
      const message = 'Les mots de passe ne correspondent pas.'
      setAuthError(message)
      throw new Error(message)
    }

    setAuthLoading(true)
    try {
      let phoneValue = auth.phone.trim()
      if (phoneValue && !phoneValue.startsWith('+') && auth.countryCode) {
        phoneValue = auth.countryCode + phoneValue.replace(/\s+/g, '')
      }

      const data = await registerRequest({
        name: auth.name,
        username: auth.username.trim(),
        email: auth.email.trim(),
        phone: phoneValue,
        country: auth.country,
        countryCode: auth.countryCode,
        password: auth.password,
        avatar: (auth.name || '').trim().slice(0, 1).toUpperCase() || 'U',
      })

      if (!data.session?.access_token) {
        setAuthMode('login')
        setAuth((previous) => ({ ...previous, password: '', passwordConfirmation: '' }))
        setAuthNotice(`Compte créé pour ${auth.username} ! Vérifiez votre boîte e-mail pour confirmer votre adresse, puis connectez-vous.`)
        return
      }

      // Connexion automatique après inscription
      await finalizeAuthSuccess(data)
    } catch (error) {
      setAuthError(error.message === 'Failed to fetch' ? 'Backend indisponible. Lancez npm run server.' : error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  // Le formulaire est unique dans l'UI (identique visuellement) mais délègue à la
  // bonne fonction selon le mode actif, sans jamais mélanger les deux logiques.
  const submitAuth = (event) => (authMode === 'register' ? registerAccount(event) : loginAccount(event))

  const resendConfirmation = async () => {
    if (!auth.email || resendLoading) return
    setResendLoading(true)
    try {
      await resendConfirmationRequest(auth.email)
      setAuthNotice(`E-mail de confirmation renvoyé à ${auth.email}.`)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setResendLoading(false)
    }
  }

  const value = {
    user,
    profile,
    setProfile,
    accessToken,
    players,
    serverOnline,
    isAdmin,
    auth,
    setAuth,
    authMode,
    setAuthMode,
    authError,
    setAuthError,
    authNotice,
    setAuthNotice,
    authLoading,
    resendLoading,
    showPassword,
    setShowPassword,
    rememberAuth,
    setRememberAuth,
    submitAuth,
    loginAccount,
    registerAccount,
    resendConfirmation,
    persistProfile,
    loadPlayers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
