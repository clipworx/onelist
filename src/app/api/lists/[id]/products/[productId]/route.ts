import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'
import { getUserFromCookie } from '@/lib/auth'
import mongoose from 'mongoose';

type Params = {
  id: string;
  productId: string;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB()
    const user = await getUserFromCookie()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const {productId , id} = await params
    const body = await req.json()
    const { status, quantityLacking } = body

    const list = await List.findById(id)
    if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 })

    const product = list.products.find((p) => p._id.toString() === productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    if (status === 'partial' && quantityLacking === 0) {
      product.status = 'completed'
      product.quantityLacking = 0
      product.completedBy = new mongoose.Types.ObjectId(user.userId)
    } else {
      product.status = status
      product.quantityLacking = status === 'partial' ? quantityLacking : 0
      product.completedBy = status === 'completed' ? new mongoose.Types.ObjectId(user.userId) : null
    }
    await list.save()

    return NextResponse.json({ success: true, product })
  } catch (err) {
    console.error('Failed to update product:', err)
    return NextResponse.json({ error: 'Failed to save list', details: err }, { status: 500 })
  }
}