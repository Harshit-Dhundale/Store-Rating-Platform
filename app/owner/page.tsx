"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  TrendingUp,
  Users,
  Calendar,
  Store as StoreIcon,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { type Rating, Store } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function OwnerRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchData = async () => {
    if (!user) return
    try {
      // Get stores owned by this user
      const { data: ownedStores, error: storesError } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)

      if (storesError) throw storesError

      if (!ownedStores || ownedStores.length === 0) {
        setStores([])
        setRatings([])
        return
      }

      const storeIds = ownedStores.map((store) => store.id)

      // Get ratings for owned stores with user details
      const { data: storeRatings, error: ratingsError } = await supabase
        .from("ratings")
        .select(`
          *,
          user:users(name, email),
          store:stores(name)
        `)
        .in("store_id", storeIds)
        .order("created_at", { ascending: false })

      if (ratingsError) throw ratingsError

      // Get average ratings for stores
      const { data: avgRatings, error: avgError } = await supabase
        .from("store_avg_ratings")
        .select("*")
        .in("store_id", storeIds)

      if (avgError) throw avgError

      // Merge store data with averages
      const storesWithAverages = ownedStores.map((store) => {
        const avgData = avgRatings.find((avg) => avg.store_id === store.id)
        return {
          ...store,
          avg_rating: avgData?.avg_rating || 0,
          rating_count: avgData?.rating_count || 0,
        }
      })

      setStores(storesWithAverages as Store[])
      setRatings((storeRatings as unknown as Rating[]) || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch ratings data",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchData().finally(() => setLoading(false))
    }
  }, [user])

  const renderStars = (value: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= value ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  const totalRatings = ratings.length
  const averageRating = stores.reduce((sum, store) => sum + (store.avg_rating || 0), 0) / (stores.length || 1)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Store Ratings</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Store Ratings</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StoreIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-500 text-center">
              You don't have any stores assigned to you yet. Contact an administrator to get stores assigned to your
              account.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Store Ratings</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <StoreIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
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
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Store Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Store Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Average Rating</TableHead>
                <TableHead>Total Reviews</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {renderStars(Math.round(store.avg_rating || 0))}
                      <span className="text-sm text-gray-600">{(store.avg_rating || 0).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{store.rating_count || 0} reviews</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={(store.avg_rating ?? 0) >= 4 ? "default" : (store.avg_rating ?? 0) >= 3 ? "secondary" : "destructive"}
                    >
                      {(store.avg_rating ?? 0) >= 4
                        ? "Excellent"
                        : (store.avg_rating ?? 0) >= 3
                        ? "Good"
                        : "Needs Improvement"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings.slice(0, 10).map((rating) => (
                <TableRow key={rating.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rating.user?.name}</div>
                      <div className="text-sm text-gray-500">{rating.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{rating.store?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {renderStars(rating.value)}
                      <span className="text-sm font-medium">{rating.value}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(rating.created_at).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
