'use client'

import { AuthProvider } from '@/context/auth'

type Props = {
  children: React.ReactNode
  user: { userId: string; email: string; nickname?: string } | null
}

export function Providers({ children, user }: Props) {
  return <AuthProvider user={user}>{children}</AuthProvider>
}
