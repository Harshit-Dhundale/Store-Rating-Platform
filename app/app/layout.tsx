import type React from "react"
import UserLayoutClient from "./UserLayoutClient"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UserLayoutClient>{children}</UserLayoutClient>
}
