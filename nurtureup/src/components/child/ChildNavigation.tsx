'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Sword,
  Wallet,
  Gamepad2,
  Heart
} from 'lucide-react'

const navItems = [
  {
    href: '/child/adventure',
    label: 'Home',
    icon: Home,
    color: 'text-black'
  },
  {
    href: '/child/quests',
    label: 'Quests',
    icon: Sword,
    color: 'text-black'
  },
  {
    href: '/child/wallet',
    label: 'Wallet',
    icon: Wallet,
    color: 'text-black'
  },
  {
    href: '/child/arcade',
    label: 'Learn',
    icon: Gamepad2,
    color: 'text-black'
  },
  {
    href: '/child/pet',
    label: 'Pet',
    icon: Heart,
    color: 'text-black'
  }
]

export function ChildNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 px-4 py-2">
      <ul className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                  'hover:bg-slate-100',
                  isActive && 'bg-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all',
                    isActive ? 'text-black' : 'text-black',
                    isActive && 'scale-110'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-black' : 'text-black'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
} 