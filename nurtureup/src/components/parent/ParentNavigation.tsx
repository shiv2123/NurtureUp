'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  CheckSquare,
  BarChart3,
  Users,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// Modern 4-tab bottom navigation for parents
const navItems = [
  {
    href: '/parent/home',
    label: 'Home',
    icon: Home,
    description: 'Family dashboard with status overview'
  },
  {
    href: '/parent/tasks',
    label: 'Tasks',
    icon: CheckSquare,
    description: 'Task creation, assignment & approvals'
  },
  {
    href: '/parent/monitor',
    label: 'Monitor',
    icon: BarChart3,
    description: 'Analytics, screen time & insights'
  },
  {
    href: '/parent/family',
    label: 'Family',
    icon: Users,
    description: 'Settings, profiles & rewards'
  }
]

export function ParentNavigation() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50" style={{boxShadow: 'var(--shadow-medium)'}}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 min-w-[64px]',
                  isActive 
                    ? 'text-parent-primary' 
                    : 'text-gray-500 hover:text-parent-primary'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {/* Logout button */}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 min-w-[64px] text-parent-accent hover:bg-red-50"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs font-medium">Exit</span>
          </button>
        </div>
      </div>
    </nav>
  )
} 