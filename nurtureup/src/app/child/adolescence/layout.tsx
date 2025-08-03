'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Shield } from 'lucide-react'

/**
 * Adolescence Stage Layout (Blueprint 7.2)
 * 
 * Per blueprint:
 * - Bottom nav bar with four icon+label buttons (accessible one-handed on phone)
 * - Home 🏠 – Personal Feed (deadlines, mood pulse, quick actions)
 * - Planner 📅 – calendar, tasks Kanban, college timeline
 * - Wellbeing 💬 – mood logs, resources, SOS
 * - Wallet 💳 – allowance, income, spending & savings goals
 * - Privacy Contract shortcut (shield icon) sits top-right on Home header, opening modal for data-sharing toggles (PIN/biometric protected)
 */
export default function AdolescenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      path: '/child/adolescence/home',
      description: 'Personal Feed with deadlines and mood pulse'
    },
    {
      id: 'planner',
      label: 'Planner', 
      icon: '📅',
      path: '/child/adolescence/planner',
      description: 'Calendar, tasks Kanban, and college timeline'
    },
    {
      id: 'wellbeing',
      label: 'Wellbeing',
      icon: '💬', 
      path: '/child/adolescence/wellbeing',
      description: 'Mood logs, resources, and SOS'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: '💳',
      path: '/child/adolescence/wallet', 
      description: 'Allowance, income, spending and savings goals'
    }
  ]

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Main Content */}
      <main className="pb-16">
        {children}
      </main>

      {/* Bottom Navigation Bar - Teen-focused design */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50 scale-105'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              {/* Icon - smaller, more mature design */}
              <div className="text-xl mb-1">
                {item.icon}
              </div>
              
              {/* Label - clean typography for teens */}
              <span className={`text-xs font-medium ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Privacy Contract Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white m-4 max-w-md w-full rounded-2xl shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Privacy Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Share Mood Data</div>
                    <div className="text-sm text-gray-600">Let parents see mood trends</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Location Check-ins</div>
                    <div className="text-sm text-gray-600">Share arrival notifications</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Academic Progress</div>
                    <div className="text-sm text-gray-600">Share grades and assignments</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Spending Alerts</div>
                    <div className="text-sm text-gray-600">Notify parents of purchases</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Shield Access (available globally in adolescence stage) */}
      <button
        onClick={() => setShowPrivacyModal(true)}
        className="fixed top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all z-40"
      >
        <Shield className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  )
}