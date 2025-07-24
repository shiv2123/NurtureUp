import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch reward purchases for parent review
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'pending' // pending, redeemed, all
    const childId = url.searchParams.get('childId')

    let whereClause: any = {}

    // Filter by family
    whereClause.reward = {
      familyId: session.user.familyId
    }

    // Filter by status
    if (status === 'pending') {
      whereClause.isRedeemed = false
      whereClause.reward = {
        ...whereClause.reward,
        requiresApproval: true
      }
    } else if (status === 'redeemed') {
      whereClause.isRedeemed = true
    }
    // 'all' doesn't add additional filters

    // Filter by specific child if provided
    if (childId) {
      whereClause.childId = childId
    }

    const purchases = await prisma.rewardPurchase.findMany({
      where: whereClause,
      include: {
        reward: true,
        child: {
          include: { user: true }
        }
      },
      orderBy: { purchasedAt: 'desc' }
    })

    // Group purchases by status for easier processing
    const groupedPurchases = {
      pending: purchases.filter(p => !p.isRedeemed && p.reward.requiresApproval),
      autoRedeemed: purchases.filter(p => p.isRedeemed && !p.reward.requiresApproval),
      manuallyRedeemed: purchases.filter(p => p.isRedeemed && p.reward.requiresApproval),
      all: purchases
    }

    return NextResponse.json(status === 'all' ? groupedPurchases : groupedPurchases[status as keyof typeof groupedPurchases] || purchases)
  } catch (error) {
    console.error('Failed to fetch reward purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reward purchases' },
      { status: 500 }
    )
  }
}