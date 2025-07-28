import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { comparePassword } from '@/lib/bcrypt'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
    await connectDB()
    const { email, password } = await req.json()

    const user = await User.findOne({ email })
    if (!user || !comparePassword(password, user.password)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ userId: user._id })

    const res = NextResponse.json({ message: 'Login successful' })
    res.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })

    return res
}
