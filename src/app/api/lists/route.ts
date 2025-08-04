export const runtime = 'nodejs'
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

  products.forEach((product: any) => {
    if (!product.name || !product.unit || !product.quantity) {
      return NextResponse.json({ error: 'All product fields are required' }, { status: 400 })
    }
    product.addedBy = userId
    product.completedBy = null
    product.quantityLacking = product.quantity - (product.completed ? product.quantity : 0)
  })

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
    //@ts-ignore
    const lists = await List.find({ createdBy: payload.userId }).populate('createdBy', 'name').lean().exec() 

    return NextResponse.json({ lists }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
