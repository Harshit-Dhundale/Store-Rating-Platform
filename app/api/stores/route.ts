import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin.from('stores').select('*')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
