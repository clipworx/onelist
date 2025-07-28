import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  try {
    if (token && verifyToken(token)) {
      redirect('/dashboard')
    } else {
      redirect('/auth/login')
    }
  } catch {
    redirect('/auth/login')
  }
}
