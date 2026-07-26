import { Router } from 'express'
import { listPlayers, searchPlayers } from '../controllers/playersController.js'

export const playersRoutes = Router()

// Route statique déclarée avant '/players/:id'-like patterns pour éviter toute ambiguïté.
playersRoutes.get('/players/search', searchPlayers)
playersRoutes.get('/players', listPlayers)
