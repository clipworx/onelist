import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from '@/components/Main/NavBar'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

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
  const token = (await cookies()).get('token')?.value
  let isAuthenticated = false
  if (token) {
    try {
      verifyToken(token)
      isAuthenticated = true
    } catch {}
  }
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isAuthenticated && <NavBar />}
        <main>{children}</main>
      </body>
    </html>
  );
}
