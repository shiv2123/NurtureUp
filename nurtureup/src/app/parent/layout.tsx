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
    <div className="min-h-screen bg-off-white">
      <header className="bg-white border-b border-slate-200 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">NurtureUp</h1>
              {/* <FamilySwitcher /> */}
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-black">
                Welcome, {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <ParentNavigation />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 