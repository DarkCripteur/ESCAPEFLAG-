import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser.js'
import { createSession, finishSession } from '../controllers/sessionController.js'

export const sessionRoutes = Router()

sessionRoutes.post('/sessions', requireUser, createSession)
sessionRoutes.post('/sessions/:id/finish', requireUser, finishSession)
