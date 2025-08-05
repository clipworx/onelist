// context/auth.tsx
'use client'

import { createContext, useContext, useState } from 'react'

type User = {
  userId: string
  email: string
  nickname?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  setUser: React.Dispatch<React.SetStateAction<User | null>>
} | null>(null)


export function AuthProvider({
  children,
  user: initialUser,
}: {
  children: React.ReactNode
  user: User | null
}) {

  const [user, setUser] = useState<User | null>(initialUser)
  const loading = false // no loading since user is passed from server

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
