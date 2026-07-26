// [AMIS]
import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser.js'
import * as friendsController from '../controllers/friendsController.js'

export const friendsRoutes = Router()

friendsRoutes.get('/friends', requireUser, friendsController.listFriends)
friendsRoutes.get('/friends/requests', requireUser, friendsController.listRequests)
friendsRoutes.post('/friends/requests', requireUser, friendsController.sendRequest)
friendsRoutes.post('/friends/requests/:id/respond', requireUser, friendsController.respondToRequest)
friendsRoutes.delete('/friends/requests/:id', requireUser, friendsController.removeRequest)
