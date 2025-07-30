import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input data
    let validatedData
    try {
      validatedData = registerSchema.parse(body)
    } catch (validationError: any) {
      // Extract user-friendly error messages from Zod
      if (validationError.issues && validationError.issues.length > 0) {
        const firstError = validationError.issues[0]
        return NextResponse.json(
          { error: firstError.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Invalid registration data' },
        { status: 400 }
      )
    }

    const { name, email, password } = validatedData

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