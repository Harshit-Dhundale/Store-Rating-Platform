"use server"

import { supabaseAdmin } from "@/lib/server/supabase-admin"
import bcrypt from "bcryptjs"
import type { UserRole } from "@/lib/types"

export async function createUserProfile(
  authUserId: string,
  email: string,
  password: string,
  userData: {
    name: string
    address: string
    role?: UserRole
  },
) {
  try {
    // Hash password for our custom table
    const passwordHash = await bcrypt.hash(password, 12)

    // Use service role client to insert into users table
    const serverClient = supabaseAdmin

    const { data, error } = await serverClient
      .from("users")
      .insert({
        id: authUserId,
        email,
        password_hash: passwordHash,
        name: userData.name,
        address: userData.address,
        role: userData.role || "USER",
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error creating user profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user profile",
    }
  }
}

export async function createUserByAdmin(
  email: string,
  password: string,
  userData: {
    name: string
    address: string
    role: UserRole
  },
) {
  try {
    // Use service role client to create auth user and profile
    const serverClient = supabaseAdmin

    // Create user in Supabase Auth using admin API
    const { data: authUser, error: authError } = await serverClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) throw authError

    if (!authUser.user) {
      throw new Error("Failed to create auth user")
    }

    // Hash password for our custom table
    const passwordHash = await bcrypt.hash(password, 12)

    const { data, error } = await serverClient
      .from("users")
      .insert({
        id: authUser.user.id,
        email,
        password_hash: passwordHash,
        name: userData.name,
        address: userData.address,
        role: userData.role,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    }
  }
}

export async function signInUser(email: string, password: string) {
  try {
    // Use service role client for authentication
    const serverClient = supabaseAdmin

    // Get user from our custom table first
    const { data: user, error: userError } = await serverClient.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    // Verify password against our hashed password
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error("Error signing in:", error)
    return {
      success: false,
      error: "Sign in failed",
    }
  }
}
