import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter(key => !process.env[key])
const configured = missing.length === 0
const supabase = configured ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }) : null
const authClient = configured ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }) : null

const app = express()
const port = Number(process.env.PORT || 3001)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: clientUrl.split(',').map(url => url.trim()), credentials: true }))
app.use(express.json({ limit: '32kb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: true, legacyHeaders: false }))

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`)
  next()
})

// --- SYSTÈME DE REPLI SUR BASE DE DONNÉES LOCALE JSON ---
const DATA_DIR = path.resolve('data')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readJsonFile(filename, defaultValue = []) {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) return defaultValue
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return defaultValue
  }
}

function writeJsonFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// Validation/helper functions
function publicProfile(profile) {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar || profile.name.slice(0, 1).toUpperCase(),
    level: profile.level,
    xp: profile.xp,
    streak: profile.streak,
    completed: profile.completed,
    challenges: profile.challenges,
    bestTime: profile.bestTime || profile.best_time,
    country: profile.country,
    countryCode: profile.countryCode || profile.country_code,
    createdAt: profile.createdAt || profile.created_at
  }
}

function privateProfile(profile) {
  return { ...publicProfile(profile), role: profile.role }
}

// Middleware authentification avec Fallback Local
async function requireUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ message: 'Authentification requise.' })

  // 1. Tenter l'authentification locale
  if (token.startsWith('local-token-')) {
    const userId = token.replace('local-token-', '')
    const users = readJsonFile('users.json')
    const user = users.find(u => u.id === userId)
    if (user) {
      req.user = user
      return next()
    }
  }

  // 2. Fallback Supabase
  if (configured && supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data.user) {
        req.user = data.user
        return next()
      }
    } catch {
      // Ignorer l'erreur pour continuer vers le rejet
    }
  }

  return res.status(401).json({ message: 'Session invalide ou expirée.' })
}

// Middleware administrateur
async function requireAdmin(req, res, next) {
  const userId = req.user.id

  // 1. Vérifier les utilisateurs locaux
  const users = readJsonFile('users.json')
  const localUser = users.find(u => u.id === userId)
  if (localUser && ['admin', 'moderator'].includes(localUser.role)) {
    req.adminRole = localUser.role
    return next()
  }

  // 2. Vérifier Supabase
  if (configured && supabase) {
    try {
      const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (!error && profile && ['admin', 'moderator'].includes(profile.role)) {
        req.adminRole = profile.role
        return next()
      }
    } catch {
      // Ignorer pour continuer
    }
  }

  return res.status(403).json({ message: 'Accès administrateur requis.' })
}

app.get('/api/health', (_req, res) => res.status(200).json({ ok: true, database: configured ? 'supabase' : 'local-json' }))

app.get('/api/auth/login', (_req, res) => {
  res.status(405).json({ message: 'Cet endpoint d’API requiert une requête POST. Accédez à l’application web sur http://localhost:5173' })
})

// =========================
// ESCAPEFLAG UPDATE START
// Login avec Email ou Téléphone
// =========================
// Endpoint Connexion
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const input = z.object({
      login: z.string().trim().min(3, 'Veuillez saisir un identifiant (email ou téléphone).'),
      password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
    }).parse(req.body)

    let loginValue = input.login
    if (loginValue.toLowerCase() === 'admin') {
      loginValue = 'admin@gmail.com'
    }

    // [ESCAPEFLAG AUTH] Validation format email ou téléphone
    const isEmail = loginValue.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginValue)
    const isPhone = /^\+?[0-9\s\-()]{6,20}$/.test(loginValue)

    if (!isEmail && !isPhone) {
      return res.status(400).json({ message: 'Le format de l’identifiant est invalide. Veuillez entrer un e-mail valide ou un numéro de téléphone.' })
    }

    // 1. Essai de connexion avec Supabase
    if (configured && supabase) {
      try {
        // [ESCAPEFLAG AUTH] Vérification préalable de l'existence du compte dans Supabase
        let accountExists = false
        if (isEmail) {
          try {
            const { data: adminUser } = await supabase.auth.admin.getUserByEmail(loginValue)
            if (adminUser && adminUser.user) {
              accountExists = true
            }
          } catch {
            // Ignorer, car listUsers/getUserByEmail peut échouer sans privilèges adéquats
            accountExists = true 
          }
        } else {
          const { data: profile } = await supabase.from('profiles').select('id').eq('phone', loginValue).maybeSingle()
          if (profile) {
            accountExists = true
          }
        }

        if (!accountExists && isPhone) {
          return res.status(401).json({ message: 'Le compte n’existe pas.' })
        }

        const credentials = isEmail
          ? { email: loginValue, password: input.password }
          : { phone: loginValue, password: input.password }

        const { data, error } = await supabase.auth.signInWithPassword(credentials)
        if (error) {
          if (error.message.includes('invalid_credentials') || error.message.toLowerCase().includes('credentials') || error.status === 400) {
            return res.status(401).json({ message: 'Le mot de passe est incorrect.' })
          }
          throw error
        }

        if (data.session && data.user) {
          const { data: pData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
          const profile = pData ? privateProfile(pData) : null
          const defaultUser = {
            id: data.user.id,
            name: data.user.user_metadata?.name || input.login.split('@')[0],
            email: data.user.email,
            phone: data.user.phone,
            avatar: (data.user.user_metadata?.name || input.login).trim().slice(0, 1).toUpperCase() || 'U',
            level: 1,
            role: 'player'
          }
          return res.json({
            user: profile || defaultUser,
            session: data.session
          })
        }
      } catch (err) {
        console.warn('Echec connexion Supabase, repli local...', err.message)
      }
    }

    // 2. Repli Local
    const users = readJsonFile('users.json')
    const localUserExists = users.some(u => u.email === loginValue || u.phone === loginValue)
    if (!localUserExists) {
      return res.status(401).json({ message: 'Le compte n’existe pas.' })
    }

    const user = users.find(u => (u.email === loginValue || u.phone === loginValue) && u.password === input.password)
    if (!user) {
      return res.status(401).json({ message: 'Le mot de passe est incorrect.' })
    }

    const profiles = readJsonFile('profiles.json')
    let profile = profiles.find(p => p.id === user.id)
    if (!profile) {
      profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.name.slice(0, 1).toUpperCase(),
        level: 1,
        xp: 0,
        streak: 0,
        completed: 0,
        challenges: 0,
        bestTime: '00:00',
        country: 'Sénégal',
        countryCode: '+221',
        createdAt: new Date().toISOString()
      }
      profiles.push(profile)
      writeJsonFile('profiles.json', profiles)
    }

    return res.json({
      user: privateProfile(profile),
      session: {
        access_token: `local-token-${user.id}`,
        token_type: 'bearer',
        expires_in: 3600
      }
    })
  } catch (error) {
    next(error)
  }
})
// =========================
// ESCAPEFLAG UPDATE END
// =========================

// Endpoint Inscription
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const {
      email,
      phone,
      password,
      name,
      country = 'Sénégal',
      countryCode = '+221',
      country_code
    } = req.body

    const targetCountryCode = countryCode || country_code || '+221'

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Le nom doit contenir au moins 2 caractères.' })
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' })
    }
    if (!email && !phone) {
      return res.status(400).json({ message: 'Une adresse e-mail ou un numéro de téléphone est requis.' })
    }

    // 1. Tenter Supabase
    if (configured && supabase) {
      try {
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email: email || undefined,
          phone: phone || undefined,
          password: password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            name: name.trim(),
            phone: phone || null,
            country: country || null,
            country_code: targetCountryCode
          }
        })

        if (!createError && userData.user) {
          const credentials = email 
            ? { email: email, password: password } 
            : { phone: phone, password: password }
            
          const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword(credentials)
          if (!signInError && sessionData.session) {
            const userProfile = {
              id: userData.user.id,
              name: name.trim(),
              email: userData.user.email || email,
              phone: userData.user.phone || phone,
              country,
              countryCode: targetCountryCode,
              avatar: name.trim().slice(0, 1).toUpperCase() || 'U',
              level: 1,
              role: 'player'
            }
            return res.status(201).json({
              user: userProfile,
              session: sessionData.session,
              profile: { xp: 0, level: 1, streak: 0, completed: 0, challenges: 0, bestTime: '00:00' }
            })
          }
        }
      } catch (err) {
        console.warn('Echec inscription Supabase, repli local...', err.message)
      }
    }

    // 2. Repli Local
    const users = readJsonFile('users.json')
    if (users.find(u => (email && u.email === email) || (phone && u.phone === phone))) {
      return res.status(400).json({ message: 'Un utilisateur avec cet identifiant existe déjà.' })
    }

    const userId = crypto.randomUUID()
    const newUser = {
      id: userId,
      email: email || '',
      phone: phone || '',
      password: password,
      name: name.trim(),
      role: 'player'
    }
    users.push(newUser)
    writeJsonFile('users.json', users)

    const profiles = readJsonFile('profiles.json')
    const userProfile = {
      id: userId,
      name: name.trim(),
      email: email || '',
      phone: phone || '',
      country,
      countryCode: targetCountryCode,
      avatar: name.trim().slice(0, 1).toUpperCase() || 'U',
      level: 1,
      role: 'player',
      xp: 0,
      streak: 0,
      completed: 0,
      challenges: 0,
      bestTime: '00:00',
      createdAt: new Date().toISOString()
    }
    profiles.push(userProfile)
    writeJsonFile('profiles.json', profiles)

    return res.status(201).json({
      user: privateProfile(userProfile),
      session: {
        access_token: `local-token-${userId}`,
        token_type: 'bearer',
        expires_in: 3600
      },
      profile: { xp: 0, level: 1, streak: 0, completed: 0, challenges: 0, bestTime: '00:00' }
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/resend', async (req, res, next) => {
  try {
    const input = z.object({ email: z.string().trim().email() }).parse(req.body)
    if (configured && supabase) {
      try {
        const { error } = await supabase.auth.resend({ type: 'signup', email: input.email })
        if (!error) return res.json({ ok: true })
      } catch {}
    }
    res.json({ ok: true, message: 'Simulé localement' })
  } catch (error) { next(error) }
})

// Liste des Joueurs (Leaderboard)
app.get('/api/players', async (_req, res, next) => {
  try {
    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(8)
        if (!error && data) {
          return res.json({ players: data.map(publicProfile) })
        }
      } catch {}
    }
    
    // Repli Local
    const profiles = readJsonFile('profiles.json')
    const activePlayers = profiles.slice(-8).reverse().map(publicProfile)
    res.json({ players: activePlayers })
  } catch (error) { next(error) }
})

// Overview Admin
app.get('/api/admin/overview', requireUser, requireAdmin, async (_req, res, next) => {
  try {
    if (configured && supabase) {
      try {
        const [profilesResult, sessionsResult, activeResult] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
          supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        ])
        if (!profilesResult.error) {
          return res.json({
            players: profilesResult.data.map(privateProfile),
            metrics: {
              users: profilesResult.data.length,
              sessions: sessionsResult.count || 0,
              activeSessions: activeResult.count || 0
            }
          })
        }
      } catch {}
    }

    // Repli Local
    const profiles = readJsonFile('profiles.json')
    const sessions = readJsonFile('sessions.json')
    res.json({
      players: profiles.map(privateProfile),
      metrics: {
        users: profiles.length,
        sessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'active').length
      }
    })
  } catch (error) { next(error) }
})

// Mettre à jour le Profil
app.put('/api/profile/:id', requireUser, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) return res.status(403).json({ message: 'Modification non autorisée.' })
    
    const input = z.object({
      name: z.string().trim().min(2).max(50),
      xp: z.number().int().min(0).max(10000000),
      level: z.number().int().min(1).max(1000),
      streak: z.number().int().min(0).max(100000),
      completed: z.number().int().min(0).max(100000),
      challenges: z.number().int().min(0).max(100000),
      bestTime: z.string().regex(/^\d{2}:\d{2}$/),
      country: z.string().trim().max(80),
      countryCode: z.string().trim().max(8)
    }).parse(req.body)

    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').update({
          name: input.name,
          xp: input.xp,
          level: input.level,
          streak: input.streak,
          completed: input.completed,
          challenges: input.challenges,
          best_time: input.bestTime,
          country: input.country,
          country_code: input.countryCode,
          updated_at: new Date().toISOString()
        }).eq('id', req.user.id).select().single()

        if (!error && data) {
          return res.json({ profile: publicProfile(data) })
        }
      } catch {}
    }

    // Repli Local
    const profiles = readJsonFile('profiles.json')
    const idx = profiles.findIndex(p => p.id === req.user.id)
    if (idx !== -1) {
      profiles[idx] = {
        ...profiles[idx],
        name: input.name,
        xp: input.xp,
        level: input.level,
        streak: input.streak,
        completed: input.completed,
        challenges: input.challenges,
        bestTime: input.bestTime,
        country: input.country,
        countryCode: input.countryCode,
        updatedAt: new Date().toISOString()
      }
      writeJsonFile('profiles.json', profiles)
      return res.json({ profile: publicProfile(profiles[idx]) })
    }

    res.status(404).json({ message: 'Profil introuvable.' })
  } catch (error) { next(error) }
})

// Sessions de jeu
app.post('/api/sessions', requireUser, async (req, res, next) => {
  try {
    const mode = z.enum(['solo', 'duel', 'group', 'coop']).default('solo').parse(req.body?.mode || 'solo')
    
    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('game_sessions').insert({
          user_id: req.user.id,
          mode,
          status: 'active',
          started_at: new Date().toISOString()
        }).select().single()
        if (!error && data) {
          return res.status(201).json({ session: data })
        }
      } catch {}
    }

    // Repli Local
    const sessions = readJsonFile('sessions.json')
    const newSession = {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      mode,
      status: 'active',
      started_at: new Date().toISOString()
    }
    sessions.push(newSession)
    writeJsonFile('sessions.json', sessions)
    res.status(201).json({ session: newSession })
  } catch (error) { next(error) }
})

// Finaliser Session
app.post('/api/sessions/:id/finish', requireUser, async (req, res, next) => {
  try {
    const score = z.object({
      elapsedSeconds: z.number().int().min(1).max(7200),
      errors: z.number().int().min(0).max(100),
      hintsUsed: z.number().int().min(0).max(30),
      doorsOpened: z.number().int().min(0).max(50)
    }).parse(req.body)

    if (configured && supabase) {
      try {
        const { data, error } = await supabase.from('game_sessions').update({
          elapsed_seconds: score.elapsedSeconds,
          errors: score.errors,
          hints_used: score.hintsUsed,
          doors_opened: score.doorsOpened,
          status: 'finished',
          finished_at: new Date().toISOString()
        }).eq('id', req.params.id).eq('user_id', req.user.id).eq('status', 'active').select().single()

        if (!error && data) {
          return res.json({ session: data })
        }
      } catch {}
    }

    // Repli Local
    const sessions = readJsonFile('sessions.json')
    const idx = sessions.findIndex(s => s.id === req.params.id && s.user_id === req.user.id && s.status === 'active')
    if (idx !== -1) {
      sessions[idx] = {
        ...sessions[idx],
        elapsed_seconds: score.elapsedSeconds,
        errors: score.errors,
        hints_used: score.hintsUsed,
        doors_opened: score.doorsOpened,
        status: 'finished',
        finished_at: new Date().toISOString()
      }
      writeJsonFile('sessions.json', sessions)
      return res.json({ session: sessions[idx] })
    }

    res.status(404).json({ message: 'Session active introuvable.' })
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0]?.message || 'Données invalides.' })
  console.error(error)
  res.status(500).json({ message: 'Erreur serveur.' })
})

async function seedAdminUser() {
  const adminEmail = 'admin@gmail.com'
  const adminPassword = 'admin123'
  const adminName = 'admin'

  // 1. Seed Supabase
  if (configured && supabase) {
    try {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
      if (!listError && usersData) {
        const existingAdmin = usersData.users.find(u => u.email === adminEmail)
        if (!existingAdmin) {
          await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { name: adminName, role: 'admin' }
          })
          console.log('Utilisateur admin par défaut créé dans Supabase !')
        }
      }
    } catch (err) {
      console.warn('Seeding Supabase indisponible.')
    }
  }

  // 2. Seed Local
  const users = readJsonFile('users.json')
  const existingLocal = users.find(u => u.email === adminEmail)
  if (!existingLocal) {
    const adminId = crypto.randomUUID()
    users.push({
      id: adminId,
      email: adminEmail,
      phone: '',
      password: adminPassword,
      name: adminName,
      role: 'admin'
    })
    writeJsonFile('users.json', users)

    const profiles = readJsonFile('profiles.json')
    profiles.push({
      id: adminId,
      name: adminName,
      email: adminEmail,
      phone: '',
      avatar: 'A',
      role: 'admin',
      level: 1,
      xp: 0,
      streak: 0,
      completed: 0,
      challenges: 0,
      bestTime: '00:00',
      country: 'Sénégal',
      countryCode: '+221',
      createdAt: new Date().toISOString()
    })
    writeJsonFile('profiles.json', profiles)
    console.log('Utilisateur admin par défaut créé localement (JSON Database).')
  } else {
    console.log('L’utilisateur admin par défaut local existe déjà.')
  }
}

// --- UNDERCOVER MULTIPLAYER GAME STATE ---
let undercoverRooms = {}

app.post('/api/undercover/room/create', (req, res) => {
  const { hostName, hostId } = req.body
  if (!hostName || !hostId) return res.status(400).json({ message: 'Données manquantes.' })
  
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
  undercoverRooms[roomId] = {
    id: roomId,
    hostId,
    players: [{ id: hostId, name: hostName, role: '', word: '', isEliminated: false, isHost: true }],
    state: 'setup',
    distributorId: null,
    civilWord: '',
    undercoverWord: '',
    undercoversCount: 1,
    whitesCount: 0,
    round: 1,
    votes: {},
    clues: {},
    chat: [],
    winner: ''
  }
  res.json(undercoverRooms[roomId])
})

app.post('/api/undercover/room/join', (req, res) => {
  const { roomId, playerName, playerId } = req.body
  if (!roomId || !playerName || !playerId) return res.status(400).json({ message: 'Données manquantes.' })
  
  const room = undercoverRooms[roomId.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  
  const existing = room.players.find(p => p.id === playerId)
  if (!existing) {
    if (room.state !== 'setup') {
      return res.status(400).json({ message: 'La partie a déjà commencé dans ce salon.' })
    }
    room.players.push({ id: playerId, name: playerName, role: '', word: '', isEliminated: false, isHost: false })
  }
  res.json(room)
})

app.post('/api/undercover/room/leave', (req, res) => {
  const { roomId, playerId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (room) {
    room.players = room.players.filter(p => p.id !== playerId)
    if (room.hostId === playerId && room.players.length > 0) {
      room.players[0].isHost = true
      room.hostId = room.players[0].id
    }
    if (room.players.length === 0) {
      delete undercoverRooms[roomId.toUpperCase()]
    }
  }
  res.json({ success: true })
})

app.get('/api/undercover/room/:roomId', (req, res) => {
  const { roomId } = req.params
  const { playerId } = req.query
  const room = undercoverRooms[roomId.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  
  const sanitizedPlayers = room.players.map(p => {
    const isSelf = p.id === playerId
    const revealAll = room.state === 'result'
    return {
      id: p.id,
      name: p.name,
      isEliminated: p.isEliminated,
      isHost: p.isHost,
      role: (isSelf || revealAll) ? p.role : '',
      word: (isSelf || revealAll) ? p.word : ''
    }
  })
  
  res.json({
    ...room,
    players: sanitizedPlayers
  })
})

app.post('/api/undercover/room/choose-distributor', (req, res) => {
  const { roomId, distributorId, hostId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  if (room.hostId !== hostId) return res.status(403).json({ message: 'Seul l’hôte peut choisir le distributeur.' })
  
  room.distributorId = distributorId
  res.json(room)
})

app.post('/api/undercover/room/set-words', (req, res) => {
  const { roomId, distributorId, civilWord, undercoverWord, undercoversCount, whitesCount } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  if (room.distributorId !== distributorId) return res.status(403).json({ message: 'Seul le distributeur peut soumettre les mots.' })
  
  room.civilWord = civilWord
  room.undercoverWord = undercoverWord
  room.undercoversCount = Number(undercoversCount || 1)
  room.whitesCount = Number(whitesCount || 0)
  
  const activePlayers = room.players.filter(p => !p.isEliminated)
  const totalSpecial = room.undercoversCount + room.whitesCount
  if (totalSpecial >= activePlayers.length) {
    return res.status(400).json({ message: 'Trop de rôles spéciaux pour le nombre de joueurs.' })
  }
  
  const roles = []
  for (let i = 0; i < room.undercoversCount; i++) roles.push('undercover')
  for (let i = 0; i < room.whitesCount; i++) roles.push('mrwhite')
  while (roles.length < activePlayers.length) roles.push('civil')
  
  roles.sort(() => Math.random() - 0.5)
  
  let roleIdx = 0
  room.players = room.players.map(p => {
    if (p.isEliminated) return { ...p, role: '', word: '' }
    const role = roles[roleIdx++]
    let word = ''
    if (role === 'civil') word = civilWord
    else if (role === 'undercover') word = undercoverWord
    else word = 'M. White'
    return { ...p, role, word }
  })
  
  room.state = 'reveal'
  room.votes = {}
  room.clues = {}
  room.winner = ''
  room.round = 1
  
  res.json(room)
})

app.post('/api/undercover/room/submit-clue', (req, res) => {
  const { roomId, playerId, clue } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  
  room.clues[playerId] = clue
  
  const activePlayers = room.players.filter(p => !p.isEliminated)
  const cluesCount = Object.keys(room.clues).length
  if (cluesCount >= activePlayers.length) {
    room.state = 'vote'
  }
  res.json(room)
})

app.post('/api/undercover/room/submit-vote', (req, res) => {
  const { roomId, voterId, targetId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  
  room.votes[voterId] = targetId
  
  const activePlayers = room.players.filter(p => !p.isEliminated)
  const votesCount = Object.keys(room.votes).length
  if (votesCount >= activePlayers.length) {
    const tallies = {}
    Object.values(room.votes).forEach(tid => {
      tallies[tid] = (tallies[tid] || 0) + 1
    })
    
    let maxVotes = -1
    let eliminatedId = null
    Object.entries(tallies).forEach(([tid, count]) => {
      if (count > maxVotes) {
        maxVotes = count
        eliminatedId = tid
      }
    })
    
    if (eliminatedId) {
      room.players = room.players.map(p => p.id === eliminatedId ? { ...p, isEliminated: true } : p)
    }
    
    const updatedActive = room.players.filter(p => !p.isEliminated)
    const activeCivils = updatedActive.filter(p => p.role === 'civil')
    const activeUndercovers = updatedActive.filter(p => p.role === 'undercover')
    const activeWhites = updatedActive.filter(p => p.role === 'mrwhite')
    
    if (activeUndercovers.length === 0 && activeWhites.length === 0) {
      room.winner = 'Civils'
      room.state = 'result'
    } else if (activeCivils.length <= (activeUndercovers.length + activeWhites.length)) {
      room.winner = 'Undercovers / M. White'
      room.state = 'result'
    } else {
      room.votes = {}
      room.clues = {}
      room.state = 'describe'
      room.round += 1
    }
  }
  res.json(room)
})

app.post('/api/undercover/room/chat', (req, res) => {
  const { roomId, sender, message } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  
  room.chat.push({
    sender,
    message,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  })
  res.json(room)
})

app.post('/api/undercover/room/reset', (req, res) => {
  const { roomId, hostId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  if (room.hostId !== hostId) return res.status(403).json({ message: 'Seul l’hôte peut relancer la partie.' })
  
  room.players = room.players.map(p => ({ ...p, role: '', word: '', isEliminated: false }))
  room.state = 'setup'
  room.distributorId = null
  room.civilWord = ''
  room.undercoverWord = ''
  room.round = 1
  room.votes = {}
  room.clues = {}
  room.winner = ''
  res.json(room)
})


app.listen(port, () => {
  console.log(`Escape Flag API ready on http://localhost:${port} (${configured ? 'Supabase connected' : 'configuration required'})`)
  seedAdminUser()
})
