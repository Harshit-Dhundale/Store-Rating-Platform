"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import type { Rating, Store } from "@/lib/types"
import { Star, Store as StoreIcon, Users } from "lucide-react"

export default function OwnerAnalyticsPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: ownedStores, error: storesError } = await supabase
          .from("stores")
          .select("*")
          .eq("owner_id", user?.id)

        if (storesError) throw storesError

        const storeIds = ownedStores?.map((s) => s.id) || []

        const { data: storeRatings, error: ratingsError } = await supabase
          .from("ratings")
          .select("*")
          .in("store_id", storeIds)

        if (ratingsError) throw ratingsError

        setStores(ownedStores || [])
        setRatings(storeRatings || [])
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to fetch analytics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const totalStores = stores.length
  const totalRatings = ratings.length
  const avgRating =
    ratings.reduce((sum, r) => sum + r.value, 0) / (ratings.length || 1)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <StoreIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRatings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
