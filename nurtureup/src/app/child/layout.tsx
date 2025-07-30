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
    <div className="min-h-screen bg-child-base">
      {/* Clean child header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40" style={{boxShadow: 'var(--shadow-soft)'}}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-child-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <h1 className="text-header-lg text-child-primary font-child">
                My Adventure
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-label text-child-primary bg-white rounded-lg px-4 py-2 border border-gray-100 font-child">
                {session.user.name?.split(' ')[0]}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="pb-24 max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
      
      {/* Bottom navigation */}
      <ChildNavigation />
    </div>
  )
} 