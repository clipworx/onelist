export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'

type InputProduct = {
  name: string
  unit: string
  quantity: number
  completed?: boolean
}

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
  const body = await req.json() as { name?: string; products?: InputProduct[] }
  
  const { name, products } = body

  if (!name) {
    return NextResponse.json({ error: 'List name is required' }, { status: 400 })
  }

  if (!products || !Array.isArray(products)) {
    return NextResponse.json({ error: 'Products must be an array' }, { status: 400 })
  }
  const updatedProducts = products.map((product: InputProduct) => {
    if (!product.name || !product.unit || typeof product.quantity !== 'number') {
      throw new Error('All product fields are required')
    }

    return {
      ...product,
      addedBy: userId,
      completedBy: null,
      quantityLacking: product.quantity - (product.completed ? product.quantity : 0),
    }
  })

  try {
    const list = new List({
      name,
      products: updatedProducts,
      createdBy: userId,
    })

    await list.save()

    return NextResponse.json({ message: 'List created', list }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
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
    const userId = payload.userId
    const lists = await List.find({
      $or: [
        { createdBy: userId },
      ],
    })
    .populate({
      path: 'createdBy',
      select: 'nickname email',
    })
    .lean()
    .exec();
    return NextResponse.json({ lists }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Error fetching lists:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

