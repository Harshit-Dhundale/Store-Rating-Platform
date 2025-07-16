import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceRole) {
  console.warn('Supabase admin environment variables are missing')
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'http://localhost',
  serviceRole || 'anon',
  { auth: { persistSession: false } },
)
