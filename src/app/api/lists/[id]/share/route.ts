import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { List } from '@/models/List'
import { User } from '@/models/User'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromCookie()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { emailToShare } = await req.json()
    await connectDB()
    //@ts-ignore
    const list = await List.findById(params.id)
    if (!list || list.owner.toString() !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetUser = await User.findOne({ email: emailToShare })
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (list.sharedWith.includes(targetUser._id)) {
        return NextResponse.json({ message: 'User already has access' })
    }

    list.sharedWith.push(targetUser._id)
    await list.save()

    return NextResponse.json({ message: 'List shared successfully' })
}
