// [SUGGESTIONS]
import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser.js'
import { submitSuggestion } from '../controllers/suggestionController.js'

export const suggestionRoutes = Router()

suggestionRoutes.post('/suggestions', requireUser, submitSuggestion)
