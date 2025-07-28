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
  ClipboardCheck,
  Shield,
  Trophy
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
    href: '/parent/badges',
    label: 'Badges',
    icon: Trophy
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
  },
  {
    href: '/parent/admin',
    label: 'Admin',
    icon: Shield
  }
]

export function ParentNavigation() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium',
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600 w-full text-left font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
} 