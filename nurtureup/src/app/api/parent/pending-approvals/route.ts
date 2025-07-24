import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id }
    })

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    // Fetch all pending task completions for this family
    const pendingApprovals = await prisma.taskCompletion.findMany({
      where: {
        isApproved: false,
        task: {
          familyId: parent.familyId,
          requiresProof: true
        }
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            category: true
          }
        },
        child: {
          select: {
            id: true,
            nickname: true,
            avatar: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    })

    return NextResponse.json({ pendingApprovals })

  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    )
  }
}