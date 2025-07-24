import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PetCareService } from '@/lib/petCareService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      include: { pet: true }
    })
    if (!child || !child.pet) {
      return NextResponse.json({ error: 'Virtual pet not found' }, { status: 404 })
    }

    const petCareService = PetCareService.getInstance()
    
    try {
      const updatedPet = await petCareService.playWithPet(child.pet.id)
      return NextResponse.json(updatedPet)
    } catch (careError: unknown) {
      const errorMessage = careError instanceof Error ? careError.message : 'Failed to play with pet'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to play with pet:', error)
    return NextResponse.json(
      { error: 'Failed to play with pet' },
      { status: 500 }
    )
  }
} 