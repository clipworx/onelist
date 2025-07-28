import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'your-secret'

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET)
}

export async function getUserFromCookie() {
  const token = (await cookies()).get('token')?.value
  if (!token) return null

  try {
    return verifyToken(token) as { userId: string }
  } catch {
    return null
  }
}
