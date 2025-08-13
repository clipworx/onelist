import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { List } from '@/models/List';
import { User } from '@/models/User';

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await req.json();
  await connectDB();
  const { id } = await context.params
  //@ts-ignore
  const list = await List.findById(id);
  if (!list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  // Only the creator can share
  if (list.createdBy.toString() !== user.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Find target user
  const targetUser = await User.findOne({ email: email });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Prevent duplicate shares
  const alreadyShared = list.sharedWith.some(
    (sharedId) => sharedId.toString() === targetUser._id.toString()
  );
  if (alreadyShared) {
    return NextResponse.json({ message: 'User already has access' });
  }

  // Add to sharedWith
  list.sharedWith.push(targetUser._id);
  await list.save();

  return NextResponse.json({ message: 'List shared successfully' });
}
