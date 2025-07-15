"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        // Redirect based on user role
        switch (user.role) {
          case "ADMIN":
            router.push("/admin")
            break
          case "OWNER":
            router.push("/owner")
            break
          case "USER":
            router.push("/app")
            break
          default:
            router.push("/login")
        }
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
