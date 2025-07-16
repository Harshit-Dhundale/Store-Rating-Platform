"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export default function UserProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Name:</span> {user.name}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">Address:</span> {user.address}
          </div>
          <div>
            <span className="font-medium">Role:</span> {user.role}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
