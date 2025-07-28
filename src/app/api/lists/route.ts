
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'

export async function POST(req: Request) {
  await connectDB()

  const token = (await cookies()).get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const userId = payload.userId
  const body = await req.json()

  const { name, products } = body

  if (!name) {
    return NextResponse.json({ error: 'List name is required' }, { status: 400 })
  }

  try {
    const list = new List({
      name,
      products: products || [],
      createdBy: userId,
    })
    
    await list.save()

    return NextResponse.json({ message: 'List created', list }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
