import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db"; // adjust import based on your MongoDB connection
import { User } from "@/models/User";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
