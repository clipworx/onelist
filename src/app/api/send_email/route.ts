import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, link } = await req.json();
    if (!email || !link) return NextResponse.json({ error: "Missing email or link" }, { status: 400 });

    try {
        // Example: Send email via your service (e.g. Nodemailer, AWS SES, SendGrid)
        console.log(`Send link ${link} to email ${email}`);
        // await sendEmailFunction(email, link);

        return NextResponse.json({ message: "Email sent" }, { status: 200 });
    } catch (err) {
        console.error("Failed to send email:", err);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
