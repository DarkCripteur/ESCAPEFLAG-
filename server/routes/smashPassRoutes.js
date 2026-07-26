// [SMASH OR PASS]
import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser.js'
import { uploadPhotoMiddleware } from '../services/uploadService.js'
import * as smashPassController from '../controllers/smashPassController.js'

export const smashPassRoutes = Router()

function handleUploadErrors(req, res, next) {
  uploadPhotoMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload impossible.' })
    next()
  })
}

smashPassRoutes.post('/smash-pass/photos', requireUser, handleUploadErrors, smashPassController.uploadPhoto)
smashPassRoutes.get('/smash-pass/photos/feed', requireUser, smashPassController.getFeed)
smashPassRoutes.get('/smash-pass/photos/mine', requireUser, smashPassController.listMine)
smashPassRoutes.delete('/smash-pass/photos/:id', requireUser, smashPassController.deletePhoto)
smashPassRoutes.post('/smash-pass/votes', requireUser, smashPassController.castVote)
