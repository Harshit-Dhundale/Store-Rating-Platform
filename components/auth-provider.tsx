'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

type AuthCtx = {
  session: any | null
  user: any | null
  loading: boolean
}
const Ctx = createContext<AuthCtx>({ session: null, user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess)
      setUser(sess?.user ?? null)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  return (
    <Ctx.Provider value={{ session, user, loading }}>
      {children}
    </Ctx.Provider>
  )
}
export const useAuth = () => useContext(Ctx)
