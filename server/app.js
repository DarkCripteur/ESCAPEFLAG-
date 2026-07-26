import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { router } from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { UPLOADS_DIR } from './services/uploadService.js'

export function createApp() {
  const app = express()
  // [SUGGESTIONS] Fait confiance au premier saut de proxy (Render/Vercel/etc. placent
  // l'appli derrière un seul reverse proxy) pour que `req.ip` reflète la vraie adresse
  // du client via X-Forwarded-For, plutôt que l'IP interne du proxy — utilisé pour
  // l'e-mail de suggestion (section 11) et par express-rate-limit ci-dessous.
  app.set('trust proxy', 1)

  // [VERCEL] CLIENT_URL accepte une liste séparée par des virgules (ex. domaine de
  // prod Vercel + un domaine de preview connu à l'avance) — voir README "Déploiement".
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  // [UPLOAD] crossOriginResourcePolicy assoupli : le client Vite (port différent)
  // doit pouvoir charger les images servies par /uploads.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(cors({ origin: clientUrl.split(',').map((url) => url.trim()), credentials: true }))
  app.use('/uploads', express.static(UPLOADS_DIR))
  app.use(express.json({ limit: '32kb' }))
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: true, legacyHeaders: false }))

  app.use((req, _res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`)
    next()
  })

  app.use(router)
  app.use(errorHandler)

  return app
}
