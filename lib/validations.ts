import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be at most 16 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character")

export const signUpSchema = z
  .object({
    name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters"),
    email: z.string().email("Invalid email address"),
    address: z.string().max(400, "Address must be at most 400 characters"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(60, "Name must be at most 60 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().max(400, "Address must be at most 400 characters"),
  owner_id: z.string().uuid().optional(),
})

export const createUserSchema = z.object({
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().max(400, "Address must be at most 400 characters"),
  password: passwordSchema,
  role: z.enum(["ADMIN", "USER", "OWNER"]),
})

export const ratingSchema = z.object({
  value: z.number().min(1).max(5),
})
