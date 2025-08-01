// lib/auth-client.ts
export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: 'include',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
