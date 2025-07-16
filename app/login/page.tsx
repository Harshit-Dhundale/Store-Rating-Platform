"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { signInSchema } from "@/lib/validations"
import { clientSignIn } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { useEffect } from "react"

type SignInFormData = z.infer<typeof signInSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
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
      }
    }
  }, [user, router])

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true)
    try {
      const { user: signed } = await clientSignIn(data.email, data.password)
      const userData = { role: (signed.user_metadata as any)?.role || 'USER' }

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      // Force redirect after a short delay
      setTimeout(() => {
        switch (userData.role) {
          case "ADMIN":
            router.push("/admin")
            break
          case "OWNER":
            router.push("/owner")
            break
          case "USER":
            router.push("/app")
            break
        }
      }, 100)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Link href="/signup" className="text-sm text-blue-600 hover:underline">
              {"Don't have an account? Sign up"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
