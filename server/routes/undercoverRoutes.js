// [UNDERCOVER]
import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser.js'
import * as undercoverController from '../controllers/undercoverController.js'

export const undercoverRoutes = Router()

undercoverRoutes.post('/undercover/room/create', undercoverController.createRoom)
undercoverRoutes.post('/undercover/room/join', undercoverController.joinRoom)
undercoverRoutes.post('/undercover/room/leave', undercoverController.leaveRoom)
undercoverRoutes.get('/undercover/room/:roomId', undercoverController.getRoom)
undercoverRoutes.post('/undercover/room/choose-distributor', undercoverController.chooseDistributor)
undercoverRoutes.post('/undercover/room/set-words', undercoverController.setWords)
undercoverRoutes.post('/undercover/room/submit-clue', undercoverController.submitClue)
undercoverRoutes.post('/undercover/room/submit-vote', undercoverController.submitVote)
undercoverRoutes.post('/undercover/room/chat', undercoverController.postChat)
undercoverRoutes.post('/undercover/room/reset', undercoverController.resetRoom)

// [UNDERCOVER] Historique des parties (persisté, contrairement aux salons).
undercoverRoutes.post('/undercover/matches', requireUser, undercoverController.recordMatch)
undercoverRoutes.get('/undercover/matches', requireUser, undercoverController.listMatches)

// [UNDERCOVER] Invitations par pseudo à rejoindre un salon en ligne.
undercoverRoutes.post('/undercover/invite', undercoverController.sendGameInvite)
undercoverRoutes.get('/undercover/invites/:userId', undercoverController.listGameInvites)
undercoverRoutes.delete('/undercover/invites/:userId/:inviteId', undercoverController.dismissGameInvite)
