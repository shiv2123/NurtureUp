import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user and family
    const family = await prisma.family.create({
      data: {
        name: `${name}'s Family`,
        settings: {
          create: {
            starToCoinsRatio: 10,
            enableCommunity: true,
            enableLearning: true,
            enablePets: true
          }
        }
      }
    })

    // Create the user with parent profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PARENT',
        familyId: family.id,
        parentProfile: {
          create: {
            familyId: family.id,
            isPrimary: true
          }
        }
      }
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}