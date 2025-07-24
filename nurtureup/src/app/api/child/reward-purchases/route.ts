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

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'all' // pending, redeemed, all

    let whereClause: any = {
      childId: child.id
    }

    if (status === 'pending') {
      whereClause.isRedeemed = false
    } else if (status === 'redeemed') {
      whereClause.isRedeemed = true
    }

    const purchases = await prisma.rewardPurchase.findMany({
      where: whereClause,
      include: {
        reward: true
      },
      orderBy: { purchasedAt: 'desc' }
    })

    // Organize purchases by status for child UI
    const organizedPurchases = {
      pending: purchases.filter(p => !p.isRedeemed),
      redeemed: purchases.filter(p => p.isRedeemed),
      awaitingApproval: purchases.filter(p => !p.isRedeemed && p.reward.requiresApproval),
      readyToUse: purchases.filter(p => p.isRedeemed || !p.reward.requiresApproval),
      all: purchases
    }

    // Add helpful metadata
    const metadata = {
      totalSpent: purchases.reduce((sum, p) => sum + p.coinCost, 0),
      pendingValue: organizedPurchases.pending.reduce((sum, p) => sum + p.coinCost, 0),
      rewardCount: {
        total: purchases.length,
        pending: organizedPurchases.pending.length,
        redeemed: organizedPurchases.redeemed.length,
        awaitingApproval: organizedPurchases.awaitingApproval.length,
        readyToUse: organizedPurchases.readyToUse.length
      }
    }

    return NextResponse.json({
      purchases: status === 'all' ? organizedPurchases : organizedPurchases[status as keyof typeof organizedPurchases] || purchases,
      metadata
    })
  } catch (error) {
    console.error('Failed to fetch reward purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reward purchases' },
      { status: 500 }
    )
  }
}