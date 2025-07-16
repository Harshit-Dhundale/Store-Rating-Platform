"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">This area is under construction.</p>
        </CardContent>
      </Card>
    </div>
  )
}
