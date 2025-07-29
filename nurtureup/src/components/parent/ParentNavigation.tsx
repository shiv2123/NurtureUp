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

const primaryNavItems = [
  {
    href: '/parent/today',
    label: "Today's Command",
    icon: LayoutDashboard,
    description: 'Family status & urgent actions'
  },
  {
    href: '/parent/build',
    label: 'Family Builder',
    icon: CheckSquare,
    description: 'Create quests & rewards'
  },
  {
    href: '/parent/progress',
    label: 'Progress Hub',
    icon: Calendar,
    description: 'Timeline & achievements'
  }
]

const secondaryNavItems = [
  {
    href: '/parent/approvals',
    label: 'Approvals',
    icon: ClipboardCheck
  },
  {
    href: '/parent/admin',
    label: 'Admin Tools',
    icon: Shield
  }
]

export function ParentNavigation() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="w-72 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Primary Workflows */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Main Workflows
          </h3>
          <div className="space-y-2">
            {primaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex flex-col p-4 rounded-xl transition-all duration-200',
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                  )}
                >
                  <div className="flex items-center space-x-3 mb-1">
                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-blue-600'
                    )} />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <span className={cn(
                    'text-sm ml-8',
                    isActive ? 'text-blue-100' : 'text-gray-500'
                  )}>
                    {item.description}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Secondary Tools */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Quick Tools
          </h3>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium',
                    isActive 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
        
        {/* Logout */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600 w-full text-left font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
} 