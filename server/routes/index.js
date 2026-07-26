import { Router } from 'express'
import { configured } from '../services/supabaseClient.js'
import { authRoutes } from './authRoutes.js'
import { playersRoutes } from './playersRoutes.js'
import { adminRoutes } from './adminRoutes.js'
import { profileRoutes } from './profileRoutes.js'
import { sessionRoutes } from './sessionRoutes.js'
import { undercoverRoutes } from './undercoverRoutes.js'
import { friendsRoutes } from './friendsRoutes.js'
import { smashPassRoutes } from './smashPassRoutes.js'
import { suggestionRoutes } from './suggestionRoutes.js'

export const router = Router()

router.get('/api/health', (_req, res) => res.status(200).json({ ok: true, database: configured ? 'supabase' : 'local-json' }))

router.use('/api', authRoutes)
router.use('/api', playersRoutes)
router.use('/api', adminRoutes)
router.use('/api', profileRoutes)
router.use('/api', sessionRoutes)
router.use('/api', undercoverRoutes)
router.use('/api', friendsRoutes)
router.use('/api', smashPassRoutes)
router.use('/api', suggestionRoutes)
