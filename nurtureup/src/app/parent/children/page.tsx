import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ChildrenManager } from '@/components/parent/ChildrenManager'
import { Users, UserPlus } from 'lucide-react'

export default async function ChildrenPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'PARENT') {
    redirect('/child/adventure')
  }

  // Fetch children in this family
  const children = await prisma.child.findMany({
    where: { familyId: session.user.familyId! },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      assignedTasks: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          completions: {
            where: { isApproved: true },
            select: { completedAt: true }
          }
        }
      },
      earnedBadges: {
        include: {
          badge: true
        },
        orderBy: { earnedAt: 'desc' },
        take: 3
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return (
    <div className="min-h-screen bg-parent-base relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
        {/* Modern Header Card */}
        <div className="card-floating p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Family Members
                </h1>
                <p className="text-white/80 text-lg">
                  Manage your children's profiles and progress
                </p>
              </div>
            </div>
          </div>
        </div>

        <ChildrenManager children={children} />
      </div>
    </div>
  )
}