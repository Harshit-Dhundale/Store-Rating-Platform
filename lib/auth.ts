'use client'
import { supabaseBrowser } from './supabase-browser'
import type { UserRole } from './types'

export async function clientSignIn(email: string, password: string) {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function clientSignUp(
  email: string,
  password: string,
  userData: { name: string; address: string; role?: UserRole }
) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...userData }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getCurrentUserProfile() {
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession()
  if (!session?.user) return null
  const { data, error } = await supabaseBrowser
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
  if (error) return null
  return data
}

export async function signOut() {
  await supabaseBrowser.auth.signOut()
}
