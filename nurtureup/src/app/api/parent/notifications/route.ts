import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Unapproved task completions (proof awaiting approval)
    const pendingTasks = await prisma.taskCompletion.findMany({
      where: {
        isApproved: false,
        task: { familyId: session.user.familyId }
      },
      include: {
        task: true,
        child: { include: { user: true } }
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    })

    // Pending reward purchases (requires approval)
    const pendingRewards = await prisma.rewardPurchase.findMany({
      where: {
        isRedeemed: false,
        reward: {
          familyId: session.user.familyId,
          requiresApproval: true
        }
      },
      include: {
        reward: true,
        child: { include: { user: true } }
      },
      orderBy: { purchasedAt: 'desc' },
      take: 10
    })

    // Recent milestones
    const milestones = await prisma.milestone.findMany({
      where: { familyId: session.user.familyId },
      orderBy: { date: 'desc' },
      take: 5
    })

    return NextResponse.json({
      pendingTasks,
      pendingRewards,
      milestones
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
} 