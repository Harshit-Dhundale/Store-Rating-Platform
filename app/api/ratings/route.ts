import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { storeId, value } = await req.json()
    if (!storeId || typeof value !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization')
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user }, error } = await supabaseBrowser.auth.getUser(token)
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rating, error: rateErr } = await supabaseAdmin
      .from('ratings')
      .upsert({ user_id: userId, store_id: storeId, value }, { onConflict: 'user_id,store_id' })
      .select()
      .single()
    if (rateErr) throw rateErr

    const { data: avg } = await supabaseAdmin
      .from('store_avg_ratings')
      .select('*')
      .eq('store_id', storeId)
      .single()

    return NextResponse.json({ rating, avg })
  } catch (err: any) {
    console.error('POST /api/ratings error', err)
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
