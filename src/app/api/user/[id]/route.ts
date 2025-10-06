import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db"; // adjust import based on your MongoDB connection
import { User } from "@/models/User";

type Params = {
  id: string;
};

export async function GET(
  req: Request,
  {params}: { params: Promise<Params> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (_err: unknown) {
    console.error("Error fetching user:", _err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
