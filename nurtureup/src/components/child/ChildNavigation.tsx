'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Sword,
  Wallet,
  Gamepad2,
  Heart,
  Crown,
  Camera
} from 'lucide-react'

const navItems = [
  {
    href: '/child/adventure',
    label: 'Home',
    icon: Home,
    color: 'text-black'
  },
  {
    href: '/child/kingdom',
    label: 'Kingdom',
    icon: Crown,
    color: 'text-black'
  },
  {
    href: '/child/quests',
    label: 'Quests',
    icon: Sword,
    color: 'text-black'
  },
  {
    href: '/child/arcade',
    label: 'Learn',
    icon: Gamepad2,
    color: 'text-black'
  },
  {
    href: '/child/camera',
    label: 'Camera',
    icon: Camera,
    color: 'text-black'
  }
]

export function ChildNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 min-w-[64px]',
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md scale-105' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive && 'animate-bounce-subtle'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium font-child',
                    isActive ? 'text-white' : 'text-gray-600'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
} 