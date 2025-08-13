import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'
import { User } from '@/models/User'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = await context.params
    //@ts-ignore
    const list = await List.findById(id)
      .populate('createdBy', 'nickname') 
      .lean()
      .exec()

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function DELETE(request: Request, context: { params: { id: string } }) {
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
  const { id } = await context.params

  try {
    //@ts-ignore
    const list = await List.findById(id)

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Only the creator can delete the list
    if (list.createdBy.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await list.deleteOne()

    return NextResponse.json({ message: 'List deleted successfully' }, { status: 200 })
  } catch (err: any) {
    console.error('Error deleting list:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
