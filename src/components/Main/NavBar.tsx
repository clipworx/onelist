'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth'
const navItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'My Lists', href: '/lists' },
  // { label: 'Settings', href: '/settings' },
]

export default function Navbar() {
  const { user, loading, setUser } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (loading || !user) return null
  const handleLogout = async () => {
    await fetch(`/api/auth/logout`, { method: 'POST' })
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <nav className="p-4 bg-gray-100 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
      <div className="text-lg font-bold">OneList</div>
      <ul className="flex gap-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`text-sm sm:text-base ${
                pathname === item.href ? 'font-semibold text-blue-600' : 'text-gray-700'
              } hover:text-blue-500 transition-colors`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 text-sm sm:text-base text-gray-800">
        <span>{user?.nickname || user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

    </nav>
  )
}
