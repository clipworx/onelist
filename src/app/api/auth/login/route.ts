import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { comparePassword } from '@/lib/bcrypt'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    const user = await User.findOne({ email })
    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ userId: user._id })

  // ✅ redirect to dashboard after login
  const res = NextResponse.redirect(new URL('/dashboard', req.url))
  res.cookies.set('token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

    return res
  } catch (error) {
    console.error('❌ Error logging in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
