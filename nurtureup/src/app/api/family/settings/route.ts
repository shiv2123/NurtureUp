import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
  familyName: z.string().min(1),
  starToCoinsRatio: z.number().min(1).max(100),
  dailyTaskLimit: z.number().nullable(),
  enableCommunity: z.boolean(),
  enableLearning: z.boolean(),
  enablePets: z.boolean()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    // Update family name
    await prisma.family.update({
      where: { id: session.user.familyId! },
      data: { name: validatedData.familyName }
    })

    // Update or create family settings
    await prisma.familySettings.upsert({
      where: { familyId: session.user.familyId! },
      update: {
        starToCoinsRatio: validatedData.starToCoinsRatio,
        dailyTaskLimit: validatedData.dailyTaskLimit,
        enableCommunity: validatedData.enableCommunity,
        enableLearning: validatedData.enableLearning,
        enablePets: validatedData.enablePets
      },
      create: {
        familyId: session.user.familyId!,
        starToCoinsRatio: validatedData.starToCoinsRatio,
        dailyTaskLimit: validatedData.dailyTaskLimit,
        enableCommunity: validatedData.enableCommunity,
        enableLearning: validatedData.enableLearning,
        enablePets: validatedData.enablePets
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating family settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' }, 
      { status: 500 }
    )
  }
}