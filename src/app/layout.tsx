export const dynamic = 'force-dynamic'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from '@/components/Main/NavBar'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { Providers } from './providers'
import { headers } from 'next/headers'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneList",
  description: "A simple and efficient task management app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const pathname = (await headers()).get('x-pathname') || '' // Fallback if custom header not passed
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const token = (await cookies()).get('token')?.value
  let user = null

  if (token) {
    try {
      user = await verifyToken(token) as { userId: string, email: string, nickname?: string }
    } catch {
      user = null
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers user={user}>
          {!isAuthPage && <NavBar />}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
