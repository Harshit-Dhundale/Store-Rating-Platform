"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Store } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function UserStoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchStores = async () => {
    try {
      // Get stores with average ratings
      const { data: storeRatings, error: ratingsError } = await supabase.from("store_avg_ratings").select("*")

      if (ratingsError) throw ratingsError

      // Get full store details via server route to bypass RLS
      const storeRes = await fetch("/api/stores")
      if (!storeRes.ok) {
        throw new Error("Failed to fetch stores")
      }
      const storeDetails: Store[] = await storeRes.json()

      // Get user's ratings
      const { data: userRatings, error: userRatingsError } = await supabase
        .from("ratings")
        .select("store_id, value")
        .eq("user_id", user?.id)

      if (userRatingsError) throw userRatingsError

      // Merge all data
      const mergedStores = storeDetails.map((store) => {
        const avgData = storeRatings.find((r) => r.store_id === store.id)
        const userRating = userRatings.find((r) => r.store_id === store.id)

        return {
          ...store,
          avg_rating: avgData?.avg_rating || 0,
          rating_count: avgData?.rating_count || 0,
          user_rating: userRating?.value,
        }
      })

      setStores(mergedStores)
    } catch (error) {
      console.error("Error fetching stores:", error)
      toast({
        title: "Error",
        description: "Failed to fetch stores",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchStores().finally(() => setLoading(false))
    }
  }, [user])

  const handleRateStore = (store: Store) => {
    setSelectedStore(store)
    setRating(store.user_rating || 0)
  }

  const submitRating = async () => {
    if (!selectedStore || !user || rating === 0) return

    setSubmitting(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ storeId: selectedStore.id, value: rating }),
      })
      if (!res.ok) throw new Error('Request failed')

      toast({
        title: 'Success',
        description: 'Rating submitted successfully',
      })

      setSelectedStore(null)
      setRating(0)
      fetchStores()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const renderStars = (value: number, interactive = false, onChange?: (value: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= value ? "text-yellow-400 fill-current" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Stores</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Stores</h1>

      <Card>
        <CardHeader>
          <CardTitle>Browse and Rate Stores</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Average Rating</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>My Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{store.address}</TableCell>
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
                    {store.user_rating ? (
                      <div className="flex items-center space-x-2">
                        {renderStars(store.user_rating)}
                        <span className="text-sm text-gray-600">{store.user_rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not rated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleRateStore(store)}>
                      {store.user_rating ? "Update Rating" : "Rate Store"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedStore} onOpenChange={() => setSelectedStore(null)}>
        <DialogContent aria-describedby="rate-desc">
          <DialogHeader>
            <DialogTitle>Rate {selectedStore?.name}</DialogTitle>
            <DialogDescription id="rate-desc">Select a rating from 1 to 5.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Select your rating:</p>
              {renderStars(rating, true, setRating)}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedStore(null)}>
                Cancel
              </Button>
              <Button onClick={submitRating} disabled={rating === 0 || submitting}>
                {submitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
