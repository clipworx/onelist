import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { hashPassword } from '@/lib/bcrypt'

export async function POST(req: Request) {
    await connectDB()
    const { email, password, nickname } = await req.json()

    const existing = await User.findOne({ email })
    if (existing) return NextResponse.json({ error: 'Email already used' }, { status: 400 })

    const user = await User.create({ email, password: hashPassword(password), nickname })
    return NextResponse.json({ message: 'User created', userId: user._id })
}
