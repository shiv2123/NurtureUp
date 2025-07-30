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
    <div className="min-h-screen bg-parent-base">
      {/* Clean minimal header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40" style={{boxShadow: 'var(--shadow-soft)'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-header-lg text-parent-primary">
              NurtureUp
            </h1>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-label text-parent-primary bg-white rounded-lg px-4 py-2 border border-gray-100">
                {session.user?.name?.split(' ')[0] || 'Parent'}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="pb-24 max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
      
      {/* Bottom navigation */}
      <ParentNavigation />
    </div>
  )
} 