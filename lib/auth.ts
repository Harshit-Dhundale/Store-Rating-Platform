import { supabaseBrowser } from './supabase-browser'
import { supabaseAdmin } from './supabase-admin'
import type { User, UserRole } from './types'
import bcrypt from 'bcryptjs'

export async function signUp(
  email: string,
  password: string,
  userData: { name: string; address: string; role?: UserRole }
) {
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: userData.name, role: userData.role ?? 'USER' },
  })
  if (createErr || !created?.user) throw createErr ?? new Error('createUser failed')
  const authUser = created.user

  const passwordHash = await bcrypt.hash(password, 12)

  const { data: profile, error: profErr } = await supabaseAdmin
    .from('users')
    .upsert({
      id: authUser.id,
      email,
      name: userData.name,
      address: userData.address,
      password_hash: passwordHash,
      role: userData.role ?? 'USER',
    })
    .select()
    .single()
  if (profErr) throw profErr

  return { authUser, profile }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
  if (error || !data.session) throw error ?? new Error('Invalid credentials')

  const userId = data.session.user.id
  let { data: profile, error: profErr } = await supabaseBrowser
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (profErr && profErr.code === 'PGRST116') {
    const { data: newProf, error: newProfErr } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        name: email,
        address: '',
        password_hash: '',
        role: 'USER',
      })
      .select()
      .single()
    if (newProfErr) throw newProfErr
    profile = newProf
  } else if (profErr) {
    throw profErr
  }
  return { session: data.session, profile }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabaseBrowser.auth.getSession()
  if (!session?.user) return null
  const { data: profile, error } = await supabaseBrowser
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
  if (error) return null
  return profile as User
}

export async function signOut() {
  await supabaseBrowser.auth.signOut()
}
