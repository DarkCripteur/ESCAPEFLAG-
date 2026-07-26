// [UPLOAD] Multer (validation type/taille) + stockage Supabase Storage si configuré,
// sinon un dossier local `server/uploads/` servi statiquement (section 9 autorise
// explicitement l'une ou l'autre option).
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { configured, supabase } from './supabaseClient.js'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo

export const UPLOADS_DIR = path.resolve('server/uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export const uploadPhotoMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('Format d’image non supporté (JPEG, PNG, WEBP ou GIF uniquement).'))
    }
    cb(null, true)
  },
}).single('photo')

const EXTENSION_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }

const SUPABASE_BUCKET = 'smash-pass'
let bucketEnsured = false

async function ensureBucket() {
  if (bucketEnsured || !configured || !supabase) return
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.some((b) => b.name === SUPABASE_BUCKET)) {
      await supabase.storage.createBucket(SUPABASE_BUCKET, { public: true, fileSizeLimit: MAX_FILE_SIZE })
    }
    bucketEnsured = true
  } catch {
    // Repli sur le stockage local si la création du bucket échoue (droits insuffisants, etc.).
  }
}

// Retourne l'URL publique de l'image uploadée.
export async function storeUploadedPhoto(file) {
  const extension = EXTENSION_BY_MIME[file.mimetype] || path.extname(file.originalname) || '.jpg'
  const filename = `${crypto.randomUUID()}${extension}`

  if (configured && supabase) {
    try {
      await ensureBucket()
      const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filename, file.buffer, { contentType: file.mimetype })
      if (!error) {
        const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filename)
        if (data?.publicUrl) return data.publicUrl
      }
    } catch {
      // Repli local ci-dessous.
    }
  }

  fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer)
  return `/uploads/${filename}`
}

// Best-effort : supprime le fichier local correspondant à une URL /uploads/... (les
// fichiers Supabase Storage ne sont pas nettoyés ici, un TODO acceptable pour cette phase).
export function deleteLocalUploadIfPresent(imageUrl) {
  if (!imageUrl?.startsWith('/uploads/')) return
  const filePath = path.join(UPLOADS_DIR, path.basename(imageUrl))
  fs.unlink(filePath, () => {})
}
