import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get system statistics
    const stats = {
      database: {
        users: await prisma.user.count(),
        families: await prisma.family.count(),
        children: await prisma.child.count(),
        parents: await prisma.parent.count(),
        tasks: await prisma.task.count(),
        completions: await prisma.taskCompletion.count(),
        rewards: await prisma.reward.count(),
        purchases: await prisma.rewardPurchase.count(),
        badges: await prisma.badge.count(),
        badgeEarned: await prisma.badgeEarned.count()
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('System info error:', error)
    return NextResponse.json(
      { error: 'Failed to get system info' },
      { status: 500 }
    )
  }
}