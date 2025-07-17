import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const client = createClient(supabaseUrl, anon)

async function run() {
  const email = `smoke+${Date.now()}@example.com`
  const password = 'testpass123'

  // sign up
  const { data: sign } = await client.auth.signUp({ email, password })
  if (!sign.user) throw new Error('signUp failed')

  // sign in
  const { data: login } = await client.auth.signInWithPassword({ email, password })
  if (!login.session) throw new Error('signIn failed')

  const token = login.session.access_token
  const storeRes = await client.from('stores').select('*').limit(1)
  if (storeRes.error || !storeRes.data?.length) throw new Error('load stores failed')
  const storeId = storeRes.data[0].id

  const res = await fetch('http://localhost:3000/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ storeId, value: 4 }),
  })
  const json = await res.json()
  console.log('rating response', res.status, json)
}

run().catch((e) => { console.error(e); process.exit(1) })
