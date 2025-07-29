import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ParentNavigation } from '@/components/parent/ParentNavigation'
import { NotificationBell } from '@/components/shared/NotificationBell'
// import { FamilySwitcher } from '@/components/parent/FamilySwitcher'

export default async function ParentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'PARENT') {
    redirect('/adventure')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 font-display">NurtureUp</h1>
              {/* <FamilySwitcher /> */}
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm font-medium text-gray-700">
                Welcome, {session.user?.name || 'User'}
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <ParentNavigation />
        <main className="flex-1 p-6 lg:p-8 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 