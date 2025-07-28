'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'My Lists', href: '/lists' },
  { label: 'Shared', href: '/shared' },
  { label: 'Settings', href: '/settings' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="w-full px-6 py-4 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* App Name */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          OneList
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors',
                pathname === href && 'text-blue-600 font-semibold'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}