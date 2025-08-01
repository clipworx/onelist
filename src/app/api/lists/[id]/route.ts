import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    await connectDB()
    //@ts-ignore
    const list = await List.findById(context.params.id)
      .populate('createdBy', 'nickname') // Replace with 'name' if you have a `name` field
      .lean()
      .exec()

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Optional: hide products if you only want summary
    // delete list.products

    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
