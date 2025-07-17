import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, address, role }: {
      email: string
      password: string
      name: string
      address: string
      role?: UserRole
    } = await req.json()

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: role ?? 'USER' },
    })
    if (createErr || !created?.user) {
      return NextResponse.json({ error: createErr?.message ?? 'createUser failed' }, { status: 400 })
    }
    const authUser = created.user

    const passwordHash = await bcrypt.hash(password, 12)

    const { data: profile, error: profErr } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authUser.id,
        email,
        name,
        address,
        password_hash: passwordHash,
        role: role ?? 'USER',
      })
      .select()
      .single()
    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 400 })
    }

    return NextResponse.json({ user: authUser, profile }, { status: 201 })
  } catch (err: any) {
    console.error('signup error', err)
    return NextResponse.json({ error: err.message ?? 'server error' }, { status: 500 })
  }
}
