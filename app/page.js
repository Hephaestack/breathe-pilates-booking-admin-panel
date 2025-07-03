"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Mock admin users for testing
const mockUsers = [
  {
    id: 1,
    phone: "admin",
    password: "admin123",
    role: "Admin",
    name: "Admin User",
  },
  {
    id: 4,
    phone: "1234567890",
    password: "password",
    role: "Admin",
    name: "Phone Admin",
  },
]

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return null
}
