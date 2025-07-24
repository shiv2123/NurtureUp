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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-primary-50">
      {/* Child Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-indigo-600 font-child">
                🌟 Adventure Time
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-indigo-600 font-child">
                Hey, {session.user.name}! 👋
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="pb-20">
        {children}
      </main>
      <ChildNavigation />
    </div>
  )
} 