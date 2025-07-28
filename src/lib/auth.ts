import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const SECRET = process.env.JWT_SECRET || 'your-secret'
const secret2 = new TextEncoder().encode(process.env.JWT_SECRET)
export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret2)
    return payload
  } catch (err) {
    return null
  }
}

export async function getUserFromCookie() {
  const token = (await cookies()).get('token')?.value
  if (!token) return null

  try {
    return await verifyToken(token) as { userId: string }
  } catch {
    return null
  }
}
