import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const children = await prisma.child.findMany({
      where: {
        familyId: session.user.familyId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(children)
  } catch (error) {
    console.error('Failed to fetch children:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}