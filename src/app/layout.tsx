import type { Metadata } from "next"
import { Inter, Cormorant } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Navbar } from "@/components/layout/navbar"

// Настройка шрифтов
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
})

const cormorant = Cormorant({
  subsets: ["latin", "cyrillic"],
  weight: ["600"],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: "HoReCa Pit Stop",
  description: "Платформа для поиска работы в сфере HoReCa",
}

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} ${cormorant.variable} font-sans bg-white text-foreground antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}