// [SUPABASE] Client service-role (opérations admin) et client anonyme (auth utilisateur).
import { createClient } from '@supabase/supabase-js'

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter((key) => !process.env[key])

export const configured = missing.length === 0
export const supabase = configured
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null
export const authClient = configured
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null

// [AUTH] PostgREST renvoie parfois, de façon transitoire, "Could not find the table
// '...' in the schema cache" sur `public.profiles` (observé en pratique sur ce
// projet) alors que la table existe bel et bien — le cache de schéma se remet à jour
// tout seul en général en moins d'une seconde. Sans ce filet, ce genre de blip fait
// retomber login()/register() sur le repli JSON local (voir authController.js), qui
// est éphémère sur un hébergeur comme Render (données perdues au prochain déploiement)
// : un compte "créé avec succès" pouvait ainsi devenir injoignable peu après. On
// retente donc une fois avant d'abandonner, uniquement pour ce message d'erreur précis.
export async function queryWithSchemaCacheRetry(queryFn) {
  const first = await queryFn()
  if (first.error && /schema cache/i.test(first.error.message || '')) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return queryFn()
  }
  return first
}
