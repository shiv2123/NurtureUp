import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const addChildSchema = z.object({
  nickname: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  birthDate: z.string(),
  avatar: z.string().default('👤'),
  theme: z.string().default('candy')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = addChildSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' }, 
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user and child profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.nickname,
          role: 'CHILD',
          familyId: session.user.familyId!
        }
      })

      // Create child profile
      const child = await tx.child.create({
        data: {
          userId: user.id,
          familyId: session.user.familyId!,
          nickname: validatedData.nickname,
          birthDate: new Date(validatedData.birthDate),
          avatar: validatedData.avatar,
          theme: validatedData.theme
        }
      })

      // Create default virtual pet
      await tx.virtualPet.create({
        data: {
          childId: child.id,
          name: `${validatedData.nickname}'s Pet`,
          type: 'dragon'
        }
      })

      return { user, child }
    })

    return NextResponse.json({ 
      success: true, 
      child: {
        id: result.child.id,
        nickname: result.child.nickname,
        email: result.user.email
      }
    })

  } catch (error) {
    console.error('Error adding child:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add child' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return NextResponse.json({ children })

  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children' }, 
      { status: 500 }
    )
  }
}