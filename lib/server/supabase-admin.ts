import 'server-only'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('SUPABASE_URL missing (supabase-admin)')

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey!, {

  auth: { persistSession: false },
})
