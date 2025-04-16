"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function LogoutButton() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Ошибка при выходе:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Выход..." : "Выйти"}
    </Button>
  )
} 