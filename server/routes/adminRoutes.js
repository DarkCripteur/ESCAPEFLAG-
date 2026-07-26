// [ADMIN]
import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import * as adminController from '../controllers/adminController.js'
import { listSuggestions } from '../controllers/suggestionController.js'

export const adminRoutes = Router()

adminRoutes.use('/admin', requireUser, requireAdmin)

adminRoutes.get('/admin/overview', adminController.overview)

adminRoutes.get('/admin/users', adminController.listUsers)
adminRoutes.put('/admin/users/:id/ban', adminController.setUserBan)
adminRoutes.put('/admin/users/:id/role', adminController.setUserRole)

adminRoutes.get('/admin/smash-pass/photos', adminController.listAllPhotos)
adminRoutes.delete('/admin/smash-pass/photos/:id', adminController.deleteAnyPhoto)

adminRoutes.get('/admin/smash-pass/comments', adminController.listAllComments)
adminRoutes.delete('/admin/smash-pass/comments/:id', adminController.deleteComment)

adminRoutes.get('/admin/suggestions', listSuggestions)
