import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'
import { getUserFromCookie } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string; productId: string } }
) {
  const { id, productId } = await context.params

  try {
    await connectDB()
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, quantityLacking } = body
    //@ts-ignore
    const list = await List.findById(id)
    if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 })

    const product = list.products.id(productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    if (status === 'partial' && quantityLacking === 0) {
      product.status = 'completed'
      product.quantityLacking = 0
      product.completedBy = user.userId
    } else {
      product.status = status
      product.quantityLacking = status === 'partial' ? quantityLacking : 0
      product.completedBy = status === 'completed' ? user.userId : null
    }

    await list.save()
    return NextResponse.json({ success: true, product })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save list', details: `${err}` }, { status: 500 })
  }
}
