'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Gift,
  Calendar,
  Settings,
  LogOut,
  ClipboardCheck
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  {
    href: '/parent/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/parent/children',
    label: 'Children',
    icon: Users
  },
  {
    href: '/parent/tasks',
    label: 'Tasks',
    icon: CheckSquare
  },
  {
    href: '/parent/approvals',
    label: 'Approvals',
    icon: ClipboardCheck
  },
  {
    href: '/parent/rewards',
    label: 'Rewards',
    icon: Gift
  },
  {
    href: '/parent/timeline',
    label: 'Timeline',
    icon: Calendar
  },
  {
    href: '/parent/settings',
    label: 'Settings',
    icon: Settings
  }
]

export function ParentNavigation() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="w-64 bg-sage-green/5 border-r border-sage-green/10 min-h-screen p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-black',
                  'hover:bg-sage-green/10',
                  isActive && 'bg-sage-green text-white shadow-soft'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
        
        <li className="pt-4 mt-4 border-t border-sage-green/20">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-error/10 text-error w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  )
} 