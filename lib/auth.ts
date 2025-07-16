import { supabase } from "./supabase"
import type { User } from "./types"

export async function signUp(
  email: string,
  password: string,
  userData: {
    name: string
    address: string
  },
) {
  // First create the auth user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  if (!authData.user) {
    throw new Error("Failed to create user")
  }

  // Use server action to create user profile
  const { createUserProfile } = await import("@/app/actions/auth")
  const result = await createUserProfile(authData.user.id, email, password, userData)

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data
}

export async function signIn(email: string, password: string) {
  // Use server action for authentication
  const { signInUser } = await import("@/app/actions/auth")
  const result = await signInUser(email, password)

  if (!result.success) {
    throw new Error(result.error || "Invalid credentials")
  }

  // Sign in with Supabase Auth using the user's credentials
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    // Store user info in localStorage as a fallback
    if (typeof window !== "undefined") {
      localStorage.setItem("user_session", JSON.stringify(result.user))

      // Trigger a custom auth state change
      window.dispatchEvent(
        new CustomEvent("auth_change", {
          detail: { user: result.user, event: "SIGNED_IN" },
        }),
      )
    }
  } else if (typeof window !== "undefined") {
    // Clean up any stale fallback session on successful Supabase sign in
    localStorage.removeItem("user_session")
  }

  return result.user
}

export async function getCurrentUser(): Promise<User | null> {
  // First try to get from Supabase session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user?.id) {
    const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()
    if (user) return user as unknown as User
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const storedSession = localStorage.getItem("user_session")
    if (storedSession) {
      try {
        return JSON.parse(storedSession) as User
      } catch {
        localStorage.removeItem("user_session")
      }
    }
  }

  return null
}

export async function signOut() {
  await supabase.auth.signOut()
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_session")
    window.dispatchEvent(
      new CustomEvent("auth_change", {
        detail: { user: null, event: "SIGNED_OUT" },
      }),
    )
  }
}
