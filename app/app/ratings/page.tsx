"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Rating } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function UserRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const { data, error } = await supabase
          .from("ratings")
          .select(`*, store:stores(name)`)
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setRatings(data || [])
      } catch (error) {
        console.error("Error fetching ratings:", error)
        toast({
          title: "Error",
          description: "Failed to fetch ratings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchRatings()
    }
  }, [user])

  const renderStars = (value: number) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= value ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Ratings</h1>
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Ratings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings.map((rating) => (
                <TableRow key={rating.id}>
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
