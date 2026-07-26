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
