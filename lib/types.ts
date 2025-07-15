export type UserRole = "ADMIN" | "USER" | "OWNER"

export interface User {
  id: string
  name: string
  email: string
  address: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  name: string
  email: string
  address: string
  owner_id?: string
  created_at: string
  updated_at: string
  avg_rating?: number
  rating_count?: number
  user_rating?: number
}

export interface Rating {
  id: string
  user_id: string
  store_id: string
  value: number
  created_at: string
  updated_at: string
  user?: User
  store?: Store
}

export interface DashboardMetrics {
  users: number
  stores: number
  ratings: number
}
