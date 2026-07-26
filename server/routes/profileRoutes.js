import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser.js'
import { updateProfile } from '../controllers/profileController.js'

export const profileRoutes = Router()

profileRoutes.put('/profile/:id', requireUser, updateProfile)
