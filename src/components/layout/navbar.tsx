"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { LogoutButton } from "@/components/auth/logout-button"
import { Notifications } from "@/components/notifications/notifications"
import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-nav">
      <div className="container flex h-16 items-center justify-between">
        {/* Логотип и название */}
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-horeca-brand" />
          <Link href="/" className="text-xl font-bold font-heading">
            HorecaPitStop
          </Link>
        </div>

        {/* Кнопки авторизации */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Notifications />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  Личный кабинет
                </Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Регистрация</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}