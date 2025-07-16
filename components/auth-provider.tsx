"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      // First try Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user?.id) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
        if (userData) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("user_session")
          }
          setUser(userData as unknown as User)
          return
        }
      }

      // Fallback to localStorage
      if (typeof window !== "undefined") {
        const storedSession = localStorage.getItem("user_session")
        if (storedSession) {
          try {
            const userData = JSON.parse(storedSession) as User
            setUser(userData)
            return
          } catch {
            localStorage.removeItem("user_session")
          }
        }
      }

      setUser(null)
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))

    // Listen to Supabase auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        if (typeof window !== "undefined") {
          localStorage.removeItem("user_session")
        }
      } else {
        await refreshUser()
      }
      setLoading(false)
    })

    // Listen to custom auth changes
    const handleCustomAuthChange = (event: CustomEvent) => {
      const { user: userData, event: authEvent } = event.detail
      if (authEvent === "SIGNED_OUT") {
        setUser(null)
      } else if (authEvent === "SIGNED_IN" && userData) {
        setUser(userData as User)
      }
      setLoading(false)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("auth_change", handleCustomAuthChange as EventListener)
    }

    return () => {
      subscription.unsubscribe()
      if (typeof window !== "undefined") {
        window.removeEventListener("auth_change", handleCustomAuthChange as EventListener)
      }
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_session")
      window.dispatchEvent(
        new CustomEvent("auth_change", {
          detail: { user: null, event: "SIGNED_OUT" },
        }),
      )
    }
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
