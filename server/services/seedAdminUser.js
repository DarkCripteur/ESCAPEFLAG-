import crypto from 'crypto'
import { configured, supabase } from './supabaseClient.js'
import { readJsonFile, writeJsonFile } from './dataStore.js'

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'Admin2026++'
const ADMIN_NAME = 'admin'
const ADMIN_USERNAME = 'admin'

export async function seedAdminUser() {
  // 1. Seed Supabase — et resynchronise le mot de passe si le compte existait déjà
  // avec une valeur antérieure (évite qu'un changement des identifiants par défaut
  // reste sans effet sur un compte déjà seedé lors d'un précédent démarrage).
  if (configured && supabase) {
    try {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
      if (!listError && usersData) {
        const existingAdmin = usersData.users.find((u) => u.email === ADMIN_EMAIL)
        if (!existingAdmin) {
          await supabase.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: { name: ADMIN_NAME, username: ADMIN_USERNAME, role: 'admin' },
          })
          console.log('Utilisateur admin par défaut créé dans Supabase !')
        } else {
          await supabase.auth.admin.updateUserById(existingAdmin.id, { password: ADMIN_PASSWORD })
          await supabase.from('profiles').update({ username: ADMIN_USERNAME, role: 'admin' }).eq('id', existingAdmin.id)
        }
      }
    } catch {
      console.warn('Seeding Supabase indisponible.')
    }
  }

  // 2. Seed Local — même logique de resynchronisation.
  const users = readJsonFile('users.json')
  const existingIdx = users.findIndex((u) => u.email === ADMIN_EMAIL)
  if (existingIdx === -1) {
    const adminId = crypto.randomUUID()
    users.push({
      id: adminId,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      phone: '',
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      role: 'admin',
    })
    writeJsonFile('users.json', users)

    const profiles = readJsonFile('profiles.json')
    profiles.push({
      id: adminId,
      name: ADMIN_NAME,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
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
      createdAt: new Date().toISOString(),
    })
    writeJsonFile('profiles.json', profiles)
    console.log('Utilisateur admin par défaut créé localement (JSON Database).')
  } else {
    users[existingIdx] = { ...users[existingIdx], password: ADMIN_PASSWORD, username: ADMIN_USERNAME, role: 'admin' }
    writeJsonFile('users.json', users)
    console.log('L’utilisateur admin par défaut local existait déjà — identifiants resynchronisés.')
  }
}
