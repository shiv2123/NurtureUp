import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ChildrenManager } from '@/components/parent/ChildrenManager'

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">
          Family Members
        </h1>
      </div>

      <ChildrenManager children={children} />
    </div>
  )
}