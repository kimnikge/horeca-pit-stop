"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, role?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkUserExists: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkUserExists = async () => {
    if (!user) return false;
    
    try {
      // Проверка наличия пользователя в профилях
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (error || !data) {
        console.error("Профиль пользователя не найден, выполняется выход", error);
        await signOut();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при проверке профиля:", error);
      await signOut();
      return false;
    }
  };

  useEffect(() => {
    // Проверяем текущую сессию
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Проверяем наличие профиля
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();
        
        if (error || !data) {
          // Если профиль не найден, выполняем выход
          console.error("Профиль пользователя не найден при инициализации");
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkSession();

    // Подписываемся на изменения состояния аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Проверяем наличие профиля при изменении состояния аутентификации
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();
        
        if (error || !data) {
          // Если профиль не найден, выполняем выход
          console.error("Профиль пользователя не найден при смене состояния");
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, role?: string) => {
    const options = role 
      ? { 
          data: { 
            role,
            name: '' // Пустое имя по умолчанию
          } 
        } 
      : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options
    })

    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    // Проверяем наличие профиля после входа
    const session = await supabase.auth.getSession();
    if (session.data.session?.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.data.session.user.id)
        .single();
      
      if (error || !data) {
        // Если профиль не найден, выполняем выход
        console.error("Профиль пользователя не найден после входа");
        await signOut();
        throw new Error("Профиль пользователя не найден");
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Возвращаем загрузочный компонент вместо null
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, checkUserExists }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 