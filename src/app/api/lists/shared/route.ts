export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'
import { User } from '@/models/User'

export async function GET() {
  await connectDB()
  const token = (await cookies()).get('token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const userId = payload.userId
    //@ts-ignore
    const lists = await List.find({
      $or: [
        { sharedWith: userId },
      ],
    })
    .populate({
      path: 'createdBy',
      select: 'nickname email',
    })
    .lean()
    .exec();
    return NextResponse.json({ lists }, { status: 200 })
  } catch (err: any) {
    console.error('Error fetching lists:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

