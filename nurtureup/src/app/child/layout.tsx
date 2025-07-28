import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChildNavigation } from '@/components/child/ChildNavigation'
import { NotificationBell } from '@/components/shared/NotificationBell'
// import { ChildHeader } from '@/components/child/ChildHeader'

export default async function ChildLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'CHILD') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Child Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-blue-600 font-child">
                🌟 Adventure Time
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-blue-600 font-child font-medium">
                Hey, {session.user.name}! 👋
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="pb-24 max-w-4xl mx-auto px-4">
        {children}
      </main>
      <ChildNavigation />
    </div>
  )
} 