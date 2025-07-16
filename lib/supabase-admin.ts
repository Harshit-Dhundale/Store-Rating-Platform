// lib/supabase-admin.ts
// Server-only Supabase client (service role). Use ONLY in API routes / server actions.
// Never import this into client components — the service role key must stay secret.

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Prefer server var; fall back to NEXT_PUBLIC only so local dev doesn't crash if misconfigured.
// (Fallback still safe because we error if service key missing.)
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL env var missing (supabase-admin).')
}
if (!serviceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY env var missing (supabase-admin). This client needs elevated privileges.'
  )
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey,
  { auth: { persistSession: false } }
)
