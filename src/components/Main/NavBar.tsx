'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth'

const navItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'My Lists', href: '/lists' },
  { label: 'Shared', href: '/shared' },
  { label: 'Settings', href: '/settings' },
]

export default function Navbar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) return null

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
      <div className="text-sm sm:text-base text-gray-800">
        {user?.nickname || user?.email}
      </div>
    </nav>
  )
}
