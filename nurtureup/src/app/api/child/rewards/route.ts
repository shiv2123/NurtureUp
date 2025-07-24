import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id }
    })
    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    // Calculate age
    const age = Math.floor(
      (Date.now() - new Date(child.birthDate).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    )

    // Fetch rewards available to this child
    const rewards = await prisma.reward.findMany({
      where: {
        familyId: child.familyId,
        isActive: true,
        OR: [
          { minAge: null, maxAge: null },
          { minAge: { lte: age }, maxAge: null },
          { minAge: null, maxAge: { gte: age } },
          { minAge: { lte: age }, maxAge: { gte: age } }
        ]
      },
      orderBy: { coinCost: 'asc' }
    })

    return NextResponse.json(rewards)
  } catch (error) {
    console.error('Failed to fetch rewards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    )
  }
} 