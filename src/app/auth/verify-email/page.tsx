import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold">Подтвердите ваш email</h1>
        <p className="text-muted-foreground">
          Мы отправили письмо с подтверждением на ваш email. Пожалуйста, проверьте почту и перейдите по ссылке для активации аккаунта.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/auth/login">Вернуться к входу</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 