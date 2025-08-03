import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const type = searchParams.get('type') // 'checkup', 'vaccination', 'growth', etc.
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID required' }, { status: 400 })
    }

    // Verify child belongs to family
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    const whereClause: { childId: string; type?: string } = { childId }
    if (type) {
      whereClause.type = type
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where: whereClause,
      orderBy: { recordDate: 'desc' },
      take: limit,
    })

    // Get upcoming appointments
    const upcomingAppointments = await prisma.healthRecord.findMany({
      where: {
        childId,
        nextAppointment: {
          gte: new Date()
        }
      },
      orderBy: { nextAppointment: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      healthRecords,
      upcomingAppointments
    })
  } catch (error) {
    console.error('Error fetching health records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { childId, type, title, description, notes, metrics, provider, nextAppointment, recordDate } = body

    if (!childId || !type || !title) {
      return NextResponse.json({ error: 'Child ID, type, and title required' }, { status: 400 })
    }

    // Verify child belongs to family
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    const healthRecord = await prisma.healthRecord.create({
      data: {
        childId,
        type,
        title,
        description,
        notes,
        metrics: metrics ? JSON.stringify(metrics) : '{}',
        provider,
        nextAppointment: nextAppointment ? new Date(nextAppointment) : null,
        recordDate: recordDate ? new Date(recordDate) : new Date(),
      }
    })

    return NextResponse.json(healthRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating health record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}