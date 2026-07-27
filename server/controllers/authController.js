// [LOGIN] [REGISTER] Authentification par pseudo. Supabase Auth exige un e-mail en
// interne : on résout pseudo → e-mail via la colonne `profiles.username` (ou
// `users.json` en mode local) avant d'appeler signInWithPassword.
import crypto from 'crypto'
import { configured, supabase, authClient, queryWithSchemaCacheRetry } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { privateProfile } from '../services/profileSerializers.js'
import { loginSchema, registerSchema, resendSchema } from '../validators/authValidators.js'

export async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body)
    const username = input.username

    // 1. Essai de connexion avec Supabase
    if (configured && supabase && authClient) {
      const { data: profile, error: profileError } = await queryWithSchemaCacheRetry(() =>
        supabase.from('profiles').select('*').ilike('username', username).maybeSingle()
      )

      if (profileError) {
        // Lecture du profil elle-même en échec (ex: souci ponctuel de schema cache
        // PostgREST déjà observé sur ce projet) : on ne sait pas si le compte existe,
        // on retente donc via le repli local plutôt que d'affirmer à tort quoi que
        // ce soit sur ce pseudo.
        console.warn('Lecture du profil Supabase impossible, repli local...', profileError.message)
      } else if (profile) {
        // Le pseudo existe bel et bien côté Supabase : à partir d'ici, Supabase est
        // la source de vérité pour CE compte. Avant ce correctif, une erreur
        // inattendue plus bas (ex: e-mail manquant sur le profil, réponse Supabase
        // imprévue) était avalée par un catch générique qui laissait le code
        // retomber sur users.json local — où ce compte Supabase n'existe évidemment
        // pas — renvoyant à tort "Le compte n'existe pas." à un joueur qui venait
        // pourtant de créer ce compte avec succès. On échoue maintenant franchement
        // (500) plutôt que de mentir sur l'existence du compte.
        if (profile.banned) {
          return res.status(403).json({ message: 'Ce compte a été banni.' })
        }
        if (!profile.email) {
          throw new Error(`Profil Supabase incomplet pour "${username}" : e-mail manquant.`)
        }

        const { data, error } = await authClient.auth.signInWithPassword({ email: profile.email, password: input.password })
        if (error) {
          if (error.message.toLowerCase().includes('credentials') || error.status === 400) {
            return res.status(401).json({ message: 'Le mot de passe est incorrect.' })
          }
          throw error
        }

        if (data.session && data.user) {
          return res.json({ user: privateProfile(profile), session: data.session })
        }
        throw new Error('Réponse Supabase inattendue lors de la connexion.')
      }
    }

    // 2. Repli Local (Supabase non configuré, ou pseudo introuvable côté Supabase)
    const users = readJsonFile('users.json')
    const user = users.find((u) => (u.username || '').toLowerCase() === username.toLowerCase())
    if (!user) {
      return res.status(401).json({ message: 'Le compte n’existe pas.' })
    }
    if (user.password !== input.password) {
      return res.status(401).json({ message: 'Le mot de passe est incorrect.' })
    }
    if (user.banned) {
      return res.status(403).json({ message: 'Ce compte a été banni.' })
    }

    const profiles = readJsonFile('profiles.json')
    const profile = profiles.find((p) => p.id === user.id)
    if (!profile) {
      return res.status(404).json({ message: 'Profil introuvable.' })
    }

    return res.json({
      user: privateProfile(profile),
      session: { access_token: `local-token-${user.id}`, token_type: 'bearer', expires_in: 3600 },
    })
  } catch (error) {
    next(error)
  }
}

export async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body)
    let phoneValue = input.phone
    if (phoneValue && !phoneValue.startsWith('+') && input.countryCode) {
      phoneValue = input.countryCode + phoneValue.replace(/\s+/g, '')
    }
    const avatar = input.avatar || input.name.trim().slice(0, 1).toUpperCase() || 'U'

    // 1. Tenter Supabase
    if (configured && supabase && authClient) {
      try {
        const { data: existing } = await queryWithSchemaCacheRetry(() =>
          supabase.from('profiles').select('id').ilike('username', input.username).maybeSingle()
        )
        if (existing) {
          return res.status(400).json({ message: 'Ce pseudo est déjà pris.' })
        }

        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: true,
          user_metadata: {
            name: input.name,
            username: input.username,
            phone: phoneValue || null,
            country: input.country || null,
            country_code: input.countryCode,
          },
        })

        if (!createError && userData.user) {
          const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({ email: input.email, password: input.password })
          if (!signInError && sessionData.session) {
            const userProfile = {
              id: userData.user.id,
              name: input.name,
              username: input.username,
              email: input.email,
              phone: phoneValue,
              country: input.country,
              countryCode: input.countryCode,
              avatar,
              level: 1,
              role: 'player',
            }
            return res.status(201).json({
              user: userProfile,
              session: sessionData.session,
              profile: { xp: 0, level: 1, streak: 0, completed: 0, challenges: 0, bestTime: '00:00' },
            })
          }
        } else if (createError) {
          throw createError
        }
      } catch (err) {
        console.warn('Echec inscription Supabase, repli local...', err.message)
      }
    }

    // 2. Repli Local
    const users = readJsonFile('users.json')
    if (users.some((u) => (u.username || '').toLowerCase() === input.username.toLowerCase())) {
      return res.status(400).json({ message: 'Ce pseudo est déjà pris.' })
    }
    if (users.some((u) => u.email === input.email || (phoneValue && u.phone === phoneValue))) {
      return res.status(400).json({ message: 'Un utilisateur avec cet identifiant existe déjà.' })
    }

    const userId = crypto.randomUUID()
    const newUser = {
      id: userId,
      username: input.username,
      email: input.email,
      phone: phoneValue || '',
      password: input.password,
      name: input.name,
      role: 'player',
    }
    users.push(newUser)
    writeJsonFile('users.json', users)

    const profiles = readJsonFile('profiles.json')
    const userProfile = {
      id: userId,
      name: input.name,
      username: input.username,
      email: input.email,
      phone: phoneValue || '',
      country: input.country,
      countryCode: input.countryCode,
      avatar,
      level: 1,
      role: 'player',
      xp: 0,
      streak: 0,
      completed: 0,
      challenges: 0,
      bestTime: '00:00',
      createdAt: new Date().toISOString(),
    }
    profiles.push(userProfile)
    writeJsonFile('profiles.json', profiles)

    return res.status(201).json({
      user: privateProfile(userProfile),
      session: { access_token: `local-token-${userId}`, token_type: 'bearer', expires_in: 3600 },
      profile: { xp: 0, level: 1, streak: 0, completed: 0, challenges: 0, bestTime: '00:00' },
    })
  } catch (error) {
    next(error)
  }
}

export async function resend(req, res, next) {
  try {
    const input = resendSchema.parse(req.body)
    if (configured && authClient) {
      try {
        const { error } = await authClient.auth.resend({ type: 'signup', email: input.email })
        if (!error) return res.json({ ok: true })
      } catch {
        // Repli silencieux vers la simulation locale ci-dessous.
      }
    }
    res.json({ ok: true, message: 'Simulé localement' })
  } catch (error) {
    next(error)
  }
}
