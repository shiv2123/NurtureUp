# NurtureUp - Complete Implementation Guide for Claude Code

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack & Architecture](#technology-stack--architecture)
3. [Project Setup & Initial Structure](#project-setup--initial-structure)
4. [Database Design & Setup](#database-design--setup)
5. [Authentication System](#authentication-system)
6. [Design System Implementation](#design-system-implementation)
7. [Parent Portal Implementation](#parent-portal-implementation)
8. [Child Portal Implementation](#child-portal-implementation)
9. [Core Features Development](#core-features-development)
10. [API Development](#api-development)
11. [Testing & Deployment](#testing--deployment)

---

## Project Overview

NurtureUp is a modern web application that gamifies parenting and childhood development. It consists of two primary interfaces:
- **Parent Command Center**: A professional dashboard for managing tasks, rewards, and family milestones
- **Child Adventure Portal**: A playful, game-like interface for completing quests and earning rewards

### Key Technical Requirements
- Modern, responsive web application
- Real-time updates between parent and child interfaces
- Secure authentication with role-based access
- Beautiful animations and micro-interactions
- Mobile-first design approach
- Clean, maintainable codebase

---

## Technology Stack & Architecture

### Frontend Stack
```
Framework: Next.js 15 (App Router)
UI Library: React 18
Styling: Tailwind CSS + CSS Modules for complex animations
State Management: Zustand + React Query
Animation: Framer Motion
Icons: Lucide React
Forms: React Hook Form + Zod validation
Charts: Recharts
Date handling: date-fns
```

### Backend Stack
```
Runtime: Node.js with Next.js API Routes
Database: PostgreSQL with Prisma ORM
Authentication: NextAuth.js with JWT
File Storage: Cloudinary for images
Real-time: Pusher for live updates
Email: Resend for notifications
```

### Development Tools
```
TypeScript: For type safety
ESLint + Prettier: Code quality
Husky: Git hooks
Testing: Jest + React Testing Library
```

---

## Project Setup & Initial Structure

### Step 1: Initialize the Project

Create a new Next.js project with TypeScript and Tailwind CSS:

```bash
npx create-next-app@latest nurtureup --typescript --tailwind --app --src-dir --import-alias "@/*"
cd nurtureup
```

### Step 2: Install All Dependencies

Install all required packages:

```bash
# Core dependencies
npm install @prisma/client prisma next-auth @next-auth/prisma-adapter
npm install zustand @tanstack/react-query axios
npm install framer-motion lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install recharts date-fns
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
npm install @radix-ui/react-tooltip @radix-ui/react-progress @radix-ui/react-switch
npm install clsx tailwind-merge class-variance-authority
npm install pusher pusher-js
npm install cloudinary next-cloudinary
npm install resend @react-email/components

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D @faker-js/faker
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
npm install -D husky lint-staged
```

### Step 3: Project Structure

Create the following directory structure:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (parent)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── children/
│   │   │   └── page.tsx
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   ├── rewards/
│   │   │   └── page.tsx
│   │   ├── timeline/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (child)/
│   │   ├── adventure/
│   │   │   └── page.tsx
│   │   ├── quests/
│   │   │   └── page.tsx
│   │   ├── wallet/
│   │   │   └── page.tsx
│   │   ├── arcade/
│   │   │   └── page.tsx
│   │   ├── pet/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── families/
│   │   ├── children/
│   │   ├── tasks/
│   │   ├── rewards/
│   │   ├── milestones/
│   │   └── uploads/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── parent/
│   │   ├── DashboardWidgets.tsx
│   │   ├── TaskForge.tsx
│   │   ├── RewardAtelier.tsx
│   │   └── ...
│   ├── child/
│   │   ├── QuestCard.tsx
│   │   ├── WalletDisplay.tsx
│   │   ├── ScreenTimeMeter.tsx
│   │   └── ...
│   └── shared/
│       ├── Navigation.tsx
│       ├── Avatar.tsx
│       └── ...
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── pusher.ts
│   ├── email.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useFamily.ts
│   ├── useTasks.ts
│   └── ...
├── store/
│   ├── authStore.ts
│   ├── familyStore.ts
│   └── ...
├── types/
│   ├── index.ts
│   └── ...
├── styles/
│   └── animations.module.css
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

### Step 4: Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nurtureup"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Pusher
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="us2"
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# Resend
RESEND_API_KEY="your-resend-api-key"
```

---

## Database Design & Setup

### Step 1: Configure Prisma

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User accounts
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String
  name            String?
  role            UserRole  @default(PARENT)
  emailVerified   DateTime?
  image           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  family          Family?   @relation(fields: [familyId], references: [id])
  familyId        String?
  childProfile    Child?
  parentProfile   Parent?
  sessions        Session[]
}

enum UserRole {
  PARENT
  CHILD
  CAREGIVER
}

// Family unit
model Family {
  id              String    @id @default(cuid())
  name            String
  timezone        String    @default("America/New_York")
  currency        String    @default("USD")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  users           User[]
  children        Child[]
  parents         Parent[]
  tasks           Task[]
  rewards         Reward[]
  milestones      Milestone[]
  settings        FamilySettings?
}

// Parent profile
model Parent {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  familyId        String
  family          Family    @relation(fields: [familyId], references: [id])
  isPrimary       Boolean   @default(false)
  
  // Preferences
  notifications   Json      @default("{}")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  createdTasks    Task[]
  approvedTasks   TaskCompletion[]
}

// Child profile
model Child {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  familyId        String
  family          Family    @relation(fields: [familyId], references: [id])
  
  // Profile
  nickname        String
  birthDate       DateTime
  avatar          String?
  theme           String    @default("candy")
  soundEnabled    Boolean   @default(true)
  
  // Gamification
  level           Int       @default(1)
  xp              Int       @default(0)
  totalStars      Int       @default(0)
  currentCoins    Int       @default(0)
  lifetimeCoins   Int       @default(0)
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  
  // Screen time
  dailyScreenMinutes     Int       @default(60)
  bonusScreenMinutes     Int       @default(0)
  usedScreenMinutes      Int       @default(0)
  lastScreenReset        DateTime  @default(now())
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  assignedTasks   Task[]
  completedTasks  TaskCompletion[]
  earnedBadges    BadgeEarned[]
  purchases       RewardPurchase[]
  pet             VirtualPet?
  learningScores  LearningScore[]
}

// Tasks/Chores
model Task {
  id              String    @id @default(cuid())
  familyId        String
  family          Family    @relation(fields: [familyId], references: [id])
  createdById     String
  createdBy       Parent    @relation(fields: [createdById], references: [id])
  
  // Task details
  title           String
  description     String?
  icon            String?
  difficulty      Int       @default(1) // 1-5
  starValue       Int       @default(5)
  category        String?
  
  // Assignment
  assignedToId    String?
  assignedTo      Child?    @relation(fields: [assignedToId], references: [id])
  
  // Scheduling
  isRecurring     Boolean   @default(false)
  recurringRule   Json?     // { type: 'daily' | 'weekly' | 'custom', days: number[] }
  dueDate         DateTime?
  
  // Status
  isActive        Boolean   @default(true)
  requiresProof   Boolean   @default(false)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  completions     TaskCompletion[]
}

// Task completions
model TaskCompletion {
  id              String    @id @default(cuid())
  taskId          String
  task            Task      @relation(fields: [taskId], references: [id])
  childId         String
  child           Child     @relation(fields: [childId], references: [id])
  
  // Completion details
  completedAt     DateTime  @default(now())
  proofImage      String?
  notes           String?
  
  // Approval
  isApproved      Boolean   @default(false)
  approvedById    String?
  approvedBy      Parent?   @relation(fields: [approvedById], references: [id])
  approvedAt      DateTime?
  
  // Rewards
  starsAwarded    Int
  bonusStars      Int       @default(0)
  coinsAwarded    Int       @default(0)
  
  @@unique([taskId, childId, completedAt])
}

// Rewards marketplace
model Reward {
  id              String    @id @default(cuid())
  familyId        String
  family          Family    @relation(fields: [familyId], references: [id])
  
  // Reward details
  title           String
  description     String?
  image           String?
  category        String    // 'experience', 'item', 'privilege', 'screentime'
  coinCost        Int
  
  // Availability
  isActive        Boolean   @default(true)
  quantity        Int?      // null = unlimited
  expiresAt       DateTime?
  
  // Restrictions
  minAge          Int?
  maxAge          Int?
  requiresApproval Boolean  @default(true)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  purchases       RewardPurchase[]
}

// Reward purchases
model RewardPurchase {
  id              String    @id @default(cuid())
  rewardId        String
  reward          Reward    @relation(fields: [rewardId], references: [id])
  childId         String
  child           Child     @relation(fields: [childId], references: [id])
  
  // Purchase details
  purchasedAt     DateTime  @default(now())
  coinCost        Int
  
  // Redemption
  isRedeemed      Boolean   @default(false)
  redeemedAt      DateTime?
  
  // Notes
  notes           String?
}

// Badges system
model Badge {
  id              String    @id @default(cuid())
  name            String
  description     String
  icon            String
  category        String    // 'streak', 'milestone', 'special'
  rarity          String    // 'bronze', 'silver', 'gold', 'legendary'
  
  // Unlock criteria
  criteria        Json      // { type: 'streak_days', value: 7 }
  
  createdAt       DateTime  @default(now())
  
  // Relations
  earned          BadgeEarned[]
}

model BadgeEarned {
  id              String    @id @default(cuid())
  badgeId         String
  badge           Badge     @relation(fields: [badgeId], references: [id])
  childId         String
  child           Child     @relation(fields: [childId], references: [id])
  earnedAt        DateTime  @default(now())
  
  @@unique([badgeId, childId])
}

// Virtual Pet
model VirtualPet {
  id              String    @id @default(cuid())
  childId         String    @unique
  child           Child     @relation(fields: [childId], references: [id])
  
  // Pet details
  name            String
  type            String    @default("dragon") // dragon, unicorn, robot, etc.
  mood            String    @default("happy") // happy, neutral, sad, sleeping
  level           Int       @default(1)
  xp              Int       @default(0)
  
  // Care stats
  happiness       Int       @default(100) // 0-100
  energy          Int       @default(100) // 0-100
  lastFed         DateTime  @default(now())
  lastPlayed      DateTime  @default(now())
  
  // Customization
  accessories     Json      @default("[]") // ['hat', 'glasses', 'scarf']
  color           String    @default("blue")
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Family milestones/timeline
model Milestone {
  id              String    @id @default(cuid())
  familyId        String
  family          Family    @relation(fields: [familyId], references: [id])
  
  // Milestone details
  title           String
  description     String?
  date            DateTime
  category        String    // 'first', 'achievement', 'memory', 'quote'
  
  // Media
  images          String[]
  
  // Metadata
  childrenIds     String[]  // Array of child IDs associated
  tags            String[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Learning/Education tracking
model LearningScore {
  id              String    @id @default(cuid())
  childId         String
  child           Child     @relation(fields: [childId], references: [id])
  
  // Score details
  subject         String    // 'math', 'reading', 'science'
  score           Int       // 0-100
  questionsAnswered Int
  correctAnswers  Int
  timeSpent       Int       // seconds
  
  completedAt     DateTime  @default(now())
  
  @@index([childId, subject, completedAt])
}

// Family settings
model FamilySettings {
  id              String    @id @default(cuid())
  familyId        String    @unique
  family          Family    @relation(fields: [familyId], references: [id])
  
  // Settings
  starToCoinsRatio Float    @default(10) // 10 stars = 1 coin
  dailyTaskLimit   Int?     // null = unlimited
  screenTimeRules  Json     @default("{}")
  notificationPrefs Json    @default("{}")
  
  // Features
  enableCommunity  Boolean  @default(false)
  enableLearning   Boolean  @default(true)
  enablePets       Boolean  @default(true)
  
  updatedAt       DateTime  @updatedAt
}

// Session management
model Session {
  id              String    @id @default(cuid())
  sessionToken    String    @unique
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires         DateTime
  
  @@index([userId])
}
```

### Step 2: Initialize Database

Run these commands to set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create database migrations
npx prisma migrate dev --name init

# Seed the database (optional)
npx prisma db seed
```

### Step 3: Create Database Seed File

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample badges
  const badges = [
    {
      name: 'First Quest',
      description: 'Complete your first quest',
      icon: '🎯',
      category: 'milestone',
      rarity: 'bronze',
      criteria: { type: 'first_task', value: 1 }
    },
    {
      name: 'Week Warrior',
      description: 'Complete tasks for 7 days straight',
      icon: '🔥',
      category: 'streak',
      rarity: 'silver',
      criteria: { type: 'streak_days', value: 7 }
    },
    {
      name: 'Century Club',
      description: 'Earn 100 total stars',
      icon: '⭐',
      category: 'milestone',
      rarity: 'gold',
      criteria: { type: 'total_stars', value: 100 }
    }
  ]

  for (const badge of badges) {
    await prisma.badge.create({ data: badge })
  }

  // Create a demo family
  const demoFamily = await prisma.family.create({
    data: {
      name: 'Demo Family',
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

  // Create demo parent user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@demo.com',
      password: hashedPassword,
      name: 'Demo Parent',
      role: 'PARENT',
      familyId: demoFamily.id,
      parentProfile: {
        create: {
          familyId: demoFamily.id,
          isPrimary: true
        }
      }
    }
  })

  // Create demo child user
  const childUser = await prisma.user.create({
    data: {
      email: 'child@demo.com',
      password: hashedPassword,
      name: 'Demo Child',
      role: 'CHILD',
      familyId: demoFamily.id,
      childProfile: {
        create: {
          familyId: demoFamily.id,
          nickname: 'Little Star',
          birthDate: new Date('2015-06-15'),
          avatar: 'dragon',
          theme: 'candy'
        }
      }
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## Authentication System

### Step 1: Configure NextAuth

Create `src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            family: true,
            parentProfile: true,
            childProfile: true
          }
        })

        if (!user || !user.password) {
          throw new Error('User not found')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          familyId: user.familyId,
          image: user.image
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.familyId = token.familyId
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.familyId = user.familyId
      }
      return token
    }
  }
}
```

### Step 2: Create Auth API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### Step 3: Create Auth Types

Update `src/types/next-auth.d.ts`:

```typescript
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: UserRole
      familyId?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: UserRole
    familyId?: string | null
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    familyId?: string | null
  }
}
```

### Step 4: Create Auth Provider

Create `src/components/providers/AuthProvider.tsx`:

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### Step 5: Create Auth Hooks

Create `src/hooks/useAuth.ts`:

```typescript
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Redirect based on user role
      if (session?.user.role === 'CHILD') {
        router.push('/adventure')
      } else {
        router.push('/dashboard')
      }
    },
    [router, session]
  )

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }, [router])

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isParent: session?.user.role === 'PARENT',
    isChild: session?.user.role === 'CHILD',
    login,
    logout
  }
}
```

---

## Design System Implementation

### Step 1: Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Parent palette
        'slate-gray': '#5C6B73',
        'sage-green': '#8A9A5B',
        'off-white': '#F7F7F7',
        
        // Child palette
        'soft-coral': '#FFDAB9',
        'sunny-yellow': '#FFFACD',
        'mint-green': '#98FF98',
        'sky-blue': '#B0E0E6',
        
        // System colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Nunito Sans', 'system-ui', 'sans-serif'],
        child: ['Baloo 2', 'cursive']
      },
      animation: {
        'bounce-soft': 'bounce 1s ease-in-out infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'confetti': 'confetti 1s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out'
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(720deg)', opacity: '0' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(138, 154, 91, 0.3)'
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px'
      }
    }
  },
  plugins: []
}

export default config
```

### Step 2: Create Base UI Components

Create `src/components/ui/button.tsx`:

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-sage-green text-white hover:bg-sage-green/90 focus-visible:ring-sage-green',
        primary: 'bg-sky-blue text-slate-gray hover:bg-sky-blue/90 focus-visible:ring-sky-blue',
        secondary: 'bg-slate-gray text-white hover:bg-slate-gray/90 focus-visible:ring-slate-gray',
        outline: 'border-2 border-slate-gray text-slate-gray hover:bg-slate-gray/10',
        ghost: 'text-slate-gray hover:bg-slate-gray/10',
        coral: 'bg-soft-coral text-slate-gray hover:bg-soft-coral/90 focus-visible:ring-soft-coral',
        yellow: 'bg-sunny-yellow text-slate-gray hover:bg-sunny-yellow/90 focus-visible:ring-sunny-yellow',
        mint: 'bg-mint-green text-slate-gray hover:bg-mint-green/90 focus-visible:ring-mint-green'
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

Create `src/components/ui/card.tsx`:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-slate-200 bg-white shadow-soft',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight text-slate-gray',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-gray/70', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

Create `src/components/ui/progress.tsx`:

```typescript
import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-slate-200',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full flex-1 bg-sage-green transition-all duration-500 ease-out',
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

### Step 3: Create Animation Components

Create `src/components/ui/confetti.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ConfettiProps {
  active: boolean
  particleCount?: number
  duration?: number
  colors?: string[]
}

export function Confetti({
  active,
  particleCount = 50,
  duration = 3000,
  colors = ['#FFDAB9', '#FFFACD', '#98FF98', '#B0E0E6']
}: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    color: string
    delay: number
  }>>([])

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [active, particleCount, duration, colors])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  )
}
```

### Step 4: Create Utility Functions

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

export function calculateAge(birthDate: Date | string) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function generateAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`
}
```

---

## Parent Portal Implementation

### Step 1: Create Parent Layout

Create `src/app/(parent)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ParentNavigation } from '@/components/parent/ParentNavigation'
import { FamilySwitcher } from '@/components/parent/FamilySwitcher'

export default async function ParentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'PARENT') {
    redirect('/adventure')
  }

  return (
    <div className="min-h-screen bg-off-white">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-gray">NurtureUp</h1>
              <FamilySwitcher />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-gray">
                Welcome, {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        <ParentNavigation />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Step 2: Create Parent Navigation

Create `src/components/parent/ParentNavigation.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Gift,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/children',
    label: 'Children',
    icon: Users
  },
  {
    href: '/tasks',
    label: 'Tasks',
    icon: CheckSquare
  },
  {
    href: '/rewards',
    label: 'Rewards',
    icon: Gift
  },
  {
    href: '/timeline',
    label: 'Timeline',
    icon: Calendar
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings
  }
]

export function ParentNavigation() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="w-64 bg-sage-green/10 min-h-screen p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all',
                  'hover:bg-sage-green/20',
                  isActive && 'bg-sage-green text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
        
        <li className="pt-4 mt-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-red-50 text-red-600 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
```

### Step 3: Create Dashboard Page

Create `src/app/(parent)/dashboard/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardWidgets } from '@/components/parent/DashboardWidgets'
import { QuickActions } from '@/components/parent/QuickActions'
import { NotificationStream } from '@/components/parent/NotificationStream'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch dashboard data
  const [family, children, pendingTasks, recentMilestones] = await Promise.all([
    prisma.family.findUnique({
      where: { id: session!.user.familyId! },
      include: { settings: true }
    }),
    prisma.child.findMany({
      where: { familyId: session!.user.familyId! },
      include: {
        user: true,
        assignedTasks: {
          where: { isActive: true },
          include: {
            completions: {
              where: {
                completedAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            }
          }
        }
      }
    }),
    prisma.taskCompletion.findMany({
      where: {
        isApproved: false,
        task: {
          familyId: session!.user.familyId!
        }
      },
      include: {
        task: true,
        child: { include: { user: true } }
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    }),
    prisma.milestone.findMany({
      where: { familyId: session!.user.familyId! },
      orderBy: { date: 'desc' },
      take: 5
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-gray">
          Family Dashboard
        </h1>
        <QuickActions />
      </div>

      <DashboardWidgets
        children={children}
        pendingTasks={pendingTasks}
        family={family!}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NotificationStream
            pendingTasks={pendingTasks}
            recentMilestones={recentMilestones}
          />
        </div>
        
        <div className="space-y-6">
          {/* Weekly Pulse Report */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Pulse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-gray/70">
                    Tasks Completed
                  </span>
                  <span className="font-semibold">47/52</span>
                </div>
                <Progress value={90} />
                
                <div className="pt-2">
                  <p className="text-sm font-medium text-success">
                    Top Wins 🎉
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-slate-gray/70">
                    <li>• Emma's 7-day streak!</li>
                    <li>• Leo mastered multiplication</li>
                    <li>• Zero screen time battles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### Step 4: Create Dashboard Widgets

Create `src/components/parent/DashboardWidgets.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheerCard } from './CheerCard'
import { ScreenTimeGauge } from './ScreenTimeGauge'
import { QuestMeter } from './QuestMeter'
import type { Child, Task, TaskCompletion, Family } from '@prisma/client'

interface DashboardWidgetsProps {
  children: (Child & {
    user: any
    assignedTasks: (Task & {
      completions: TaskCompletion[]
    })[]
  })[]
  pendingTasks: any[]
  family: Family & { settings: any }
}

export function DashboardWidgets({
  children,
  pendingTasks,
  family
}: DashboardWidgetsProps) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id)
  const currentChild = children.find(c => c.id === selectedChild)

  if (!currentChild) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-slate-gray/70">
            No children added yet. Add your first child to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate today's progress
  const todaysTasks = currentChild.assignedTasks
  const completedToday = todaysTasks.filter(
    task => task.completions.length > 0
  ).length
  const progressPercentage = todaysTasks.length > 0
    ? (completedToday / todaysTasks.length) * 100
    : 0

  // Calculate screen time
  const usedMinutes = currentChild.usedScreenMinutes
  const totalMinutes = currentChild.dailyScreenMinutes + currentChild.bonusScreenMinutes
  const screenTimePercentage = (usedMinutes / totalMinutes) * 100

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <div className="flex gap-2">
        {children.map((child) => (
          <Button
            key={child.id}
            variant={selectedChild === child.id ? 'default' : 'outline'}
            onClick={() => setSelectedChild(child.id)}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">{child.avatar || '👤'}</span>
            {child.nickname}
          </Button>
        ))}
      </div>

      {/* Today at a Glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuestMeter
          childName={currentChild.nickname}
          completedTasks={completedToday}
          totalTasks={todaysTasks.length}
          progressPercentage={progressPercentage}
        />

        <ScreenTimeGauge
          usedMinutes={usedMinutes}
          totalMinutes={totalMinutes}
          percentage={screenTimePercentage}
        />

        <CheerCard
          childName={currentChild.nickname}
          recentAchievement={
            completedToday > 0
              ? `Completed ${completedToday} tasks today!`
              : 'Ready for today\'s adventures!'
          }
        />
      </div>

      {/* Pending Approvals */}
      {pendingTasks.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning">
              {pendingTasks.length} Tasks Awaiting Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-gray/70">
              Review completed tasks and approve rewards
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### Step 5: Create Task Forge

Create `src/components/parent/TaskForge.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Home, 
  BookOpen, 
  Heart, 
  Dumbbell,
  Palette,
  Music,
  Gamepad2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  category: z.string(),
  difficulty: z.number().min(1).max(5),
  starValue: z.number().min(1).max(50),
  assignedToId: z.string().optional(),
  isRecurring: z.boolean(),
  recurringDays: z.array(z.number()).optional(),
  requiresProof: z.boolean()
})

type TaskFormData = z.infer<typeof taskSchema>

const presetTasks = [
  { title: 'Make Bed', category: 'home', icon: Home, difficulty: 1 },
  { title: 'Brush Teeth', category: 'health', icon: Heart, difficulty: 1 },
  { title: 'Read for 20 mins', category: 'learning', icon: BookOpen, difficulty: 2 },
  { title: 'Practice Piano', category: 'music', icon: Music, difficulty: 3 },
  { title: 'Tidy Room', category: 'home', icon: Home, difficulty: 2 },
  { title: 'Exercise 30 mins', category: 'health', icon: Dumbbell, difficulty: 3 },
  { title: 'Art Project', category: 'creative', icon: Palette, difficulty: 3 },
  { title: 'No Screen Time', category: 'challenge', icon: Gamepad2, difficulty: 4 }
]

const difficultyColors = [
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-400',
  'bg-purple-400',
  'bg-indigo-400'
]

interface TaskForgeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: any[]
  onCreateTask: (task: TaskFormData) => Promise<void>
}

export function TaskForge({ open, onOpenChange, children, onCreateTask }: TaskForgeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'home',
      difficulty: 1,
      starValue: 5,
      isRecurring: false,
      requiresProof: false,
      recurringDays: []
    }
  })

  const difficulty = form.watch('difficulty')
  const starValue = form.watch('starValue')

  const handlePresetSelect = (preset: typeof presetTasks[0]) => {
    setSelectedPreset(preset.title)
    form.setValue('title', preset.title)
    form.setValue('category', preset.category)
    form.setValue('difficulty', preset.difficulty)
    form.setValue('starValue', preset.difficulty * 5)
  }

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsCreating(true)
      await onCreateTask(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sunny-yellow" />
            Task Forge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Quick Tasks</TabsTrigger>
              <TabsTrigger value="custom">Custom Task</TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {presetTasks.map((preset) => {
                  const Icon = preset.icon
                  return (
                    <Button
                      key={preset.title}
                      type="button"
                      variant={selectedPreset === preset.title ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {preset.title}
                    </Button>
                  )
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task name..."
                  {...form.register('title')}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Add details about the task..."
                  {...form.register('description')}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Difficulty Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Difficulty Level</Label>
              <span className="text-sm font-medium">{difficulty}/5</span>
            </div>
            <Slider
              value={[difficulty]}
              onValueChange={([value]) => {
                form.setValue('difficulty', value)
                form.setValue('starValue', value * 5)
              }}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-gray/50">
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
              <span>Expert</span>
              <span>Epic</span>
            </div>
          </div>

          {/* Task Preview */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-gray/70 mb-2">Preview</p>
            <div
              className={cn(
                'p-4 rounded-xl text-white font-medium',
                difficultyColors[difficulty - 1]
              )}
            >
              <div className="flex justify-between items-center">
                <span>{form.watch('title') || 'Task Name'}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: starValue }).map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring" className="cursor-pointer">
                Make this a recurring task
              </Label>
              <Switch
                id="recurring"
                checked={form.watch('isRecurring')}
                onCheckedChange={(checked) => form.setValue('isRecurring', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="proof" className="cursor-pointer">
                Require photo proof
              </Label>
              <Switch
                id="proof"
                checked={form.watch('requiresProof')}
                onCheckedChange={(checked) => form.setValue('requiresProof', checked)}
              />
            </div>

            {/* Child Assignment */}
            {children.length > 0 && (
              <div>
                <Label>Assign to</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={!form.watch('assignedToId') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => form.setValue('assignedToId', undefined)}
                  >
                    All Children
                  </Button>
                  {children.map((child) => (
                    <Button
                      key={child.id}
                      type="button"
                      variant={form.watch('assignedToId') === child.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => form.setValue('assignedToId', child.id)}
                    >
                      {child.nickname}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Child Portal Implementation

### Step 1: Create Child Layout

Create `src/app/(child)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChildNavigation } from '@/components/child/ChildNavigation'
import { ChildHeader } from '@/components/child/ChildHeader'

export default async function ChildLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'CHILD') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/20 to-mint-green/20">
      <ChildHeader />
      <main className="pb-20">
        {children}
      </main>
      <ChildNavigation />
    </div>
  )
}
```

### Step 2: Create Child Navigation

Create `src/components/child/ChildNavigation.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Sword,
  Wallet,
  Gamepad2,
  Heart
} from 'lucide-react'

const navItems = [
  {
    href: '/adventure',
    label: 'Home',
    icon: Home,
    color: 'text-soft-coral'
  },
  {
    href: '/quests',
    label: 'Quests',
    icon: Sword,
    color: 'text-sunny-yellow'
  },
  {
    href: '/wallet',
    label: 'Wallet',
    icon: Wallet,
    color: 'text-mint-green'
  },
  {
    href: '/arcade',
    label: 'Learn',
    icon: Gamepad2,
    color: 'text-sky-blue'
  },
  {
    href: '/pet',
    label: 'Pet',
    icon: Heart,
    color: 'text-soft-coral'
  }
]

export function ChildNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 px-4 py-2">
      <ul className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                  'hover:bg-slate-100',
                  isActive && 'bg-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all',
                    isActive ? item.color : 'text-slate-400',
                    isActive && 'scale-110'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-slate-gray' : 'text-slate-400'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

### Step 3: Create Adventure Page

Create `src/app/(child)/adventure/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { HeroPanel } from '@/components/child/HeroPanel'
import { TodaysQuests } from '@/components/child/TodaysQuests'
import { QuickStats } from '@/components/child/QuickStats'

export default async function AdventurePage() {
  const session = await getServerSession(authOptions)
  
  const child = await prisma.child.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: true,
      pet: true,
      assignedTasks: {
        where: {
          isActive: true,
          OR: [
            { dueDate: null },
            {
              dueDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
              }
            }
          ]
        },
        include: {
          completions: {
            where: {
              childId: session!.user.id,
              completedAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }
        }
      },
      earnedBadges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
        take: 3
      }
    }
  })

  if (!child) {
    return <div>Loading...</div>
  }

  // Filter out completed tasks
  const pendingTasks = child.assignedTasks.filter(
    task => task.completions.length === 0
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <HeroPanel child={child} />
      
      <QuickStats
        stars={child.totalStars}
        coins={child.currentCoins}
        streak={child.currentStreak}
        level={child.level}
      />

      <TodaysQuests
        tasks={pendingTasks}
        childId={child.id}
      />

      {/* Recent Badges */}
      {child.earnedBadges.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-medium">
          <h2 className="text-xl font-bold text-slate-gray mb-4">
            Recent Badges 🏅
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {child.earnedBadges.map(({ badge }) => (
              <div
                key={badge.id}
                className="text-center p-3 rounded-xl bg-slate-50"
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <p className="text-xs font-medium text-slate-gray">
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### Step 4: Create Quest Card Component

Create `src/components/child/QuestCard.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Confetti } from '@/components/ui/confetti'
import { useRouter } from 'next/navigation'

interface QuestCardProps {
  task: {
    id: string
    title: string
    description?: string | null
    difficulty: number
    starValue: number
    requiresProof: boolean
    dueDate?: Date | null
  }
  onComplete: (taskId: string, proofImage?: string) => Promise<void>
}

const difficultyGradients = [
  'from-yellow-300 to-yellow-400',
  'from-orange-300 to-orange-400',
  'from-red-300 to-red-400',
  'from-purple-300 to-purple-400',
  'from-indigo-300 to-indigo-400'
]

export function QuestCard({ task, onComplete }: QuestCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    try {
      setIsCompleting(true)
      
      if (task.requiresProof) {
        // TODO: Implement camera/upload functionality
        alert('Photo proof required - feature coming soon!')
        return
      }

      await onComplete(task.id)
      
      // Trigger animations
      setIsFlipped(true)
      setShowConfetti(true)
      
      // Wait for animation then refresh
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error('Failed to complete task:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <>
      <Confetti active={showConfetti} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 300 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            'relative overflow-hidden cursor-pointer transition-all',
            'hover:shadow-large',
            isFlipped && 'pointer-events-none'
          )}
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of card */}
            <div
              className={cn(
                'p-6 bg-gradient-to-br',
                difficultyGradients[task.difficulty - 1],
                isFlipped && 'invisible'
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white font-child">
                  {task.title}
                </h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: task.starValue }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-2xl"
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
              </div>

              {task.description && (
                <p className="text-white/80 text-sm mb-4">
                  {task.description}
                </p>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Due by {new Date(task.dueDate).toLocaleTimeString()}</span>
                </div>
              )}

              <Button
                onClick={handleComplete}
                isLoading={isCompleting}
                variant="secondary"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/50"
              >
                {task.requiresProof ? (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Quest
                  </>
                )}
              </Button>
            </div>

            {/* Back of card (shown when flipped) */}
            {isFlipped && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mint-green to-sky-blue p-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-white font-child">
                      Quest Complete!
                    </h3>
                    <p className="text-white/80 mt-2">
                      +{task.starValue} stars earned!
                    </p>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </Card>
      </motion.div>
    </>
  )
}
```

### Step 5: Create Wallet Display

Create `src/components/child/WalletDisplay.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Coins, Star, Target, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletDisplayProps {
  currentStars: number
  currentCoins: number
  savingsGoals: Array<{
    id: string
    title: string
    targetCoins: number
    currentCoins: number
    image?: string
  }>
  onSendGift?: () => void
}

export function WalletDisplay({
  currentStars,
  currentCoins,
  savingsGoals,
  onSendGift
}: WalletDisplayProps) {
  const [selectedGoal, setSelectedGoal] = useState(savingsGoals[0]?.id)

  return (
    <div className="space-y-6">
      {/* Star Jar & Coin Bank */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card className="bg-gradient-to-br from-sunny-yellow to-orange-300 text-white">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
              >
                <Star className="w-12 h-12 mx-auto mb-2 fill-white" />
              </motion.div>
              <p className="text-sm opacity-80">Star Jar</p>
              <p className="text-3xl font-bold font-child">{currentStars}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card className="bg-gradient-to-br from-mint-green to-emerald-400 text-white">
            <CardContent className="p-6 text-center">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <Coins className="w-12 h-12 mx-auto mb-2" />
                  <motion.span
                    className="absolute -top-1 -right-1 text-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    💰
                  </motion.span>
                </div>
              </motion.div>
              <p className="text-sm opacity-80">Coin Bank</p>
              <p className="text-3xl font-bold font-child">{currentCoins}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Savings Goals */}
      {savingsGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-soft-coral" />
              My Savings Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {savingsGoals.map((goal) => {
              const progress = (goal.currentCoins / goal.targetCoins) * 100
              const isSelected = selectedGoal === goal.id

              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ x: 5 }}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 cursor-pointer transition-all',
                    isSelected
                      ? 'border-soft-coral bg-soft-coral/10'
                      : 'border-slate-200 hover:border-soft-coral/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {goal.image && (
                      <img
                        src={goal.image}
                        alt={goal.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-gray">
                        {goal.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-gray/70">
                        <Coins className="w-3 h-3" />
                        <span>
                          {goal.currentCoins} / {goal.targetCoins} coins
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Progress
                    value={progress}
                    className="mt-3 h-2"
                    indicatorClassName={cn(
                      'transition-all duration-1000',
                      progress >= 100 && 'bg-gradient-to-r from-mint-green to-emerald-400'
                    )}
                  />
                  
                  {progress >= 100 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium text-success mt-2 text-center"
                    >
                      🎉 Goal reached! Time to claim your reward!
                    </motion.p>
                  )}
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Gift Button */}
      {onSendGift && (
        <Button
          onClick={onSendGift}
          variant="outline"
          className="w-full border-2 border-dashed border-soft-coral text-soft-coral hover:bg-soft-coral/10"
        >
          <Gift className="w-4 h-4 mr-2" />
          Send Gift to Friend
        </Button>
      )}
    </div>
  )
}
```

---

## Core Features Development

### Step 1: Create API Routes for Tasks

Create `src/app/api/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { uploadImage } from '@/lib/cloudinary'

const createMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  category: z.enum(['first', 'achievement', 'memory', 'quote']),
  childrenIds: z.array(z.string()),
  tags: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const childId = searchParams.get('childId')

    let whereClause: any = {
      familyId: session.user.familyId
    }

    if (childId) {
      whereClause.childrenIds = {
        has: childId
      }
    }

    const [milestones, total] = await Promise.all([
      prisma.milestone.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.milestone.count({ where: whereClause })
    ])

    return NextResponse.json({
      milestones,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Failed to fetch milestones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      childrenIds: JSON.parse(formData.get('childrenIds') as string),
      tags: JSON.parse(formData.get('tags') as string || '[]')
    }

    const validatedData = createMilestoneSchema.parse(data)

    // Handle image uploads
    const images: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    
    for (const file of imageFiles) {
      if (file.size > 0) {
        const imageUrl = await uploadImage(file, 'milestones')
        images.push(imageUrl)
      }
    }

    const milestone = await prisma.milestone.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId,
        date: new Date(validatedData.date),
        images
      }
    })

    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    console.error('Failed to create milestone:', error)
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    )
  }
}
```

### Step 7: Create Screen Time Management

Create `src/app/api/children/[childId]/screen-time/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findFirst({
      where: {
        id: params.childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Check if screen time needs reset (new day)
    const lastReset = new Date(child.lastScreenReset)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (lastReset < today) {
      // Reset screen time for new day
      await prisma.child.update({
        where: { id: child.id },
        data: {
          usedScreenMinutes: 0,
          bonusScreenMinutes: 0,
          lastScreenReset: today
        }
      })

      return NextResponse.json({
        totalMinutes: child.dailyScreenMinutes,
        usedMinutes: 0,
        bonusMinutes: 0,
        remainingMinutes: child.dailyScreenMinutes
      })
    }

    const totalMinutes = child.dailyScreenMinutes + child.bonusScreenMinutes
    const remainingMinutes = Math.max(0, totalMinutes - child.usedScreenMinutes)

    return NextResponse.json({
      totalMinutes,
      usedMinutes: child.usedScreenMinutes,
      bonusMinutes: child.bonusScreenMinutes,
      remainingMinutes
    })
  } catch (error) {
    console.error('Failed to fetch screen time:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screen time' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, minutes } = body

    const child = await prisma.child.findFirst({
      where: {
        id: params.childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'use':
        updateData.usedScreenMinutes = {
          increment: minutes
        }
        break
      case 'add_bonus':
        updateData.bonusScreenMinutes = {
          increment: minutes
        }
        break
      case 'set_daily':
        updateData.dailyScreenMinutes = minutes
        break
      case 'reset':
        updateData = {
          usedScreenMinutes: 0,
          bonusScreenMinutes: 0,
          lastScreenReset: new Date()
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedChild = await prisma.child.update({
      where: { id: child.id },
      data: updateData
    })

    return NextResponse.json({
      totalMinutes: updatedChild.dailyScreenMinutes + updatedChild.bonusScreenMinutes,
      usedMinutes: updatedChild.usedScreenMinutes,
      bonusMinutes: updatedChild.bonusScreenMinutes,
      remainingMinutes: Math.max(
        0,
        updatedChild.dailyScreenMinutes + updatedChild.bonusScreenMinutes - updatedChild.usedScreenMinutes
      )
    })
  } catch (error) {
    console.error('Failed to update screen time:', error)
    return NextResponse.json(
      { error: 'Failed to update screen time' },
      { status: 500 }
    )
  }
}
```

### Step 8: Create Cloudinary Integration

Create `src/lib/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `nurtureup/${folder}`,
      resource_type: 'auto'
    })

    return result.secure_url
  } catch (error) {
    console.error('Failed to upload image:', error)
    throw new Error('Failed to upload image')
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Failed to delete image:', error)
  }
}
```

---

## Testing & Deployment

### Step 1: Create Testing Setup

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.number().min(1).max(5),
  starValue: z.number().min(1),
  assignedToId: z.string().optional(),
  isRecurring: z.boolean(),
  recurringRule: z.any().optional(),
  requiresProof: z.boolean(),
  dueDate: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        familyId: session.user.familyId,
        isActive: true
      },
      include: {
        assignedTo: {
          include: { user: true }
        },
        completions: {
          where: {
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id }
    })

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId,
        createdById: parent.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      }
    })

    // If not assigned to specific child, assign to all children
    if (!validatedData.assignedToId) {
      const children = await prisma.child.findMany({
        where: { familyId: session.user.familyId }
      })

      // Create tasks for each child
      for (const child of children) {
        await prisma.task.create({
          data: {
            ...validatedData,
            familyId: session.user.familyId,
            createdById: parent.id,
            assignedToId: child.id,
            dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
          }
        })
      }
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
```

Create `src/app/api/tasks/[taskId]/complete/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      include: { family: { include: { settings: true } } }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        assignedToId: child.id,
        isActive: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if already completed today
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        taskId: task.id,
        childId: child.id,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Task already completed today' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { proofImage, notes } = body

    // Create completion record
    const completion = await prisma.taskCompletion.create({
      data: {
        taskId: task.id,
        childId: child.id,
        proofImage,
        notes,
        starsAwarded: task.starValue,
        isApproved: !task.requiresProof // Auto-approve if no proof required
      }
    })

    // If auto-approved, update child's stats
    if (!task.requiresProof) {
      const settings = child.family.settings!
      const coinsEarned = Math.floor(task.starValue / settings.starToCoinsRatio)

      await prisma.child.update({
        where: { id: child.id },
        data: {
          totalStars: { increment: task.starValue },
          currentCoins: { increment: coinsEarned },
          lifetimeCoins: { increment: coinsEarned },
          xp: { increment: task.difficulty * 10 }
        }
      })

      // Check for level up
      const newLevel = Math.floor(child.xp / 100) + 1
      if (newLevel > child.level) {
        await prisma.child.update({
          where: { id: child.id },
          data: { level: newLevel }
        })

        // Trigger level up notification
        await pusher.trigger(
          `family-${child.familyId}`,
          'level-up',
          {
            childId: child.id,
            childName: child.nickname,
            newLevel
          }
        )
      }

      // Update streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      const yesterdayTasks = await prisma.taskCompletion.count({
        where: {
          childId: child.id,
          completedAt: {
            gte: yesterday,
            lt: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })

      if (yesterdayTasks > 0) {
        await prisma.child.update({
          where: { id: child.id },
          data: {
            currentStreak: { increment: 1 },
            longestStreak: {
              set: Math.max(child.currentStreak + 1, child.longestStreak)
            }
          }
        })
      }
    }

    // Send real-time notification to parents
    await pusher.trigger(
      `family-${child.familyId}`,
      'task-completed',
      {
        taskId: task.id,
        childId: child.id,
        childName: child.nickname,
        taskTitle: task.title,
        requiresApproval: task.requiresProof
      }
    )

    return NextResponse.json(completion)
  } catch (error) {
    console.error('Failed to complete task:', error)
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    )
  }
}
```

### Step 2: Create Reward System APIs

Create `src/app/api/rewards/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRewardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.enum(['experience', 'item', 'privilege', 'screentime']),
  coinCost: z.number().min(1),
  quantity: z.number().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  requiresApproval: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    let whereClause: any = {
      familyId: session.user.familyId,
      isActive: true
    }

    // If requesting as child, filter by age
    if (childId) {
      const child = await prisma.child.findUnique({
        where: { id: childId }
      })
      
      if (child) {
        const age = Math.floor(
          (Date.now() - new Date(child.birthDate).getTime()) / 
          (365.25 * 24 * 60 * 60 * 1000)
        )
        
        whereClause = {
          ...whereClause,
          OR: [
            { minAge: null, maxAge: null },
            { minAge: { lte: age }, maxAge: null },
            { minAge: null, maxAge: { gte: age } },
            { minAge: { lte: age }, maxAge: { gte: age } }
          ]
        }
      }
    }

    const rewards = await prisma.reward.findMany({
      where: whereClause,
      include: {
        purchases: {
          where: { isRedeemed: false }
        }
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRewardSchema.parse(body)

    const reward = await prisma.reward.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId
      }
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    console.error('Failed to create reward:', error)
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    )
  }
}
```

Create `src/app/api/rewards/[rewardId]/purchase/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function POST(
  request: NextRequest,
  { params }: { params: { rewardId: string } }
) {
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

    const reward = await prisma.reward.findFirst({
      where: {
        id: params.rewardId,
        familyId: child.familyId,
        isActive: true
      }
    })

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Check if child has enough coins
    if (child.currentCoins < reward.coinCost) {
      return NextResponse.json(
        { error: 'Not enough coins' },
        { status: 400 }
      )
    }

    // Check quantity if limited
    if (reward.quantity !== null) {
      const purchaseCount = await prisma.rewardPurchase.count({
        where: {
          rewardId: reward.id,
          isRedeemed: false
        }
      })

      if (purchaseCount >= reward.quantity) {
        return NextResponse.json(
          { error: 'Reward out of stock' },
          { status: 400 }
        )
      }
    }

    // Create purchase in transaction
    const [purchase, updatedChild] = await prisma.$transaction([
      prisma.rewardPurchase.create({
        data: {
          rewardId: reward.id,
          childId: child.id,
          coinCost: reward.coinCost,
          isRedeemed: !reward.requiresApproval
        }
      }),
      prisma.child.update({
        where: { id: child.id },
        data: {
          currentCoins: { decrement: reward.coinCost }
        }
      })
    ])

    // Special handling for screen time rewards
    if (reward.category === 'screentime' && !reward.requiresApproval) {
      const bonusMinutes = parseInt(reward.description || '15')
      await prisma.child.update({
        where: { id: child.id },
        data: {
          bonusScreenMinutes: { increment: bonusMinutes }
        }
      })
    }

    // Send notification to parents
    await pusher.trigger(
      `family-${child.familyId}`,
      'reward-purchased',
      {
        childId: child.id,
        childName: child.nickname,
        rewardTitle: reward.title,
        coinCost: reward.coinCost,
        requiresApproval: reward.requiresApproval
      }
    )

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Failed to purchase reward:', error)
    return NextResponse.json(
      { error: 'Failed to purchase reward' },
      { status: 500 }
    )
  }
}
```

### Step 3: Create Real-time Updates with Pusher

Create `src/lib/pusher.ts`:

```typescript
import Pusher from 'pusher'
import PusherClient from 'pusher-js'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
})

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
  }
)
```

Create `src/hooks/usePusher.ts`:

```typescript
'use client'

import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher'
import { useAuth } from './useAuth'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'

export function usePusher() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.familyId) return

    const channel = pusherClient.subscribe(`family-${user.familyId}`)

    // Task completed notification
    channel.bind('task-completed', (data: any) => {
      if (user.role === 'PARENT') {
        toast({
          title: 'Task Completed! 🎉',
          description: `${data.childName} completed "${data.taskTitle}"`,
          action: data.requiresApproval ? 'Review' : undefined,
          onAction: () => router.push('/tasks')
        })
      }
    })

    // Reward purchased notification
    channel.bind('reward-purchased', (data: any) => {
      if (user.role === 'PARENT') {
        toast({
          title: 'Reward Purchased! 🛍️',
          description: `${data.childName} bought "${data.rewardTitle}" for ${data.coinCost} coins`,
          action: data.requiresApproval ? 'Approve' : undefined,
          onAction: () => router.push('/rewards')
        })
      }
    })

    // Level up notification
    channel.bind('level-up', (data: any) => {
      toast({
        title: 'Level Up! 🎮',
        description: `${data.childName} reached level ${data.newLevel}!`,
        variant: 'success'
      })
    })

    // Refresh data on updates
    channel.bind('data-updated', () => {
      router.refresh()
    })

    return () => {
      pusherClient.unsubscribe(`family-${user.familyId}`)
    }
  }, [user, router])
}
```

### Step 4: Create Virtual Pet System

Create `src/components/child/VirtualPet.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heart, Zap, Cookie, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VirtualPet as PetType } from '@prisma/client'

interface VirtualPetProps {
  pet: PetType
  onFeed: () => Promise<void>
  onPlay: () => Promise<void>
}

const petAnimations = {
  dragon: {
    happy: '🐲',
    neutral: '🐉',
    sad: '😔🐲',
    sleeping: '😴🐲'
  },
  unicorn: {
    happy: '🦄',
    neutral: '🦄',
    sad: '😢🦄',
    sleeping: '😴🦄'
  },
  robot: {
    happy: '🤖',
    neutral: '🤖',
    sad: '😔🤖',
    sleeping: '😴🤖'
  }
}

export function VirtualPet({ pet, onFeed, onPlay }: VirtualPetProps) {
  const [isFeeding, setIsFeeding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const [bounce, setBounce] = useState(false)

  const petEmoji = petAnimations[pet.type as keyof typeof petAnimations][
    pet.mood as keyof typeof petAnimations.dragon
  ]

  const handleFeed = async () => {
    setIsFeeding(true)
    setShowHeart(true)
    await onFeed()
    setTimeout(() => setShowHeart(false), 2000)
    setIsFeeding(false)
  }

  const handlePlay = async () => {
    setIsPlaying(true)
    setBounce(true)
    await onPlay()
    setTimeout(() => setBounce(false), 1000)
    setIsPlaying(false)
  }

  // Calculate time since last interaction
  const timeSinceLastFed = Date.now() - new Date(pet.lastFed).getTime()
  const timeSinceLastPlayed = Date.now() - new Date(pet.lastPlayed).getTime()
  const needsAttention = timeSinceLastFed > 8 * 60 * 60 * 1000 || // 8 hours
                        timeSinceLastPlayed > 8 * 60 * 60 * 1000

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{pet.name}</span>
          <span className="text-sm font-normal text-slate-gray/70">
            Level {pet.level}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pet Display */}
        <div className="relative h-48 flex items-center justify-center">
          <motion.div
            animate={{
              y: bounce ? [0, -20, 0] : 0,
              scale: pet.mood === 'happy' ? [1, 1.1, 1] : 1
            }}
            transition={{
              y: { duration: 0.5, repeat: bounce ? 2 : 0 },
              scale: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
            }}
            className="text-8xl"
          >
            {petEmoji}
          </motion.div>

          {/* Floating hearts when happy */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -50 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2"
              >
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attention indicator */}
          {needsAttention && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-0 right-0"
            >
              <div className="w-3 h-3 bg-warning rounded-full" />
            </motion.div>
          )}

          {/* Accessories */}
          {pet.accessories.length > 0 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {pet.accessories.includes('hat') && <span>🎩</span>}
              {pet.accessories.includes('glasses') && <span>🕶️</span>}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-gray/70 flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Happiness
              </span>
              <span className="text-sm font-medium">{pet.happiness}%</span>
            </div>
            <Progress
              value={pet.happiness}
              className="h-2"
              indicatorClassName={cn(
                pet.happiness > 70 ? 'bg-success' :
                pet.happiness > 40 ? 'bg-warning' :
                'bg-error'
              )}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-gray/70 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Energy
              </span>
              <span className="text-sm font-medium">{pet.energy}%</span>
            </div>
            <Progress
              value={pet.energy}
              className="h-2"
              indicatorClassName="bg-sunny-yellow"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-gray/70 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                XP to Next Level
              </span>
              <span className="text-sm font-medium">
                {pet.xp} / {pet.level * 100}
              </span>
            </div>
            <Progress
              value={(pet.xp / (pet.level * 100)) * 100}
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-purple-400 to-indigo-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleFeed}
            isLoading={isFeeding}
            variant="coral"
            className="w-full"
          >
            <Cookie className="w-4 h-4 mr-2" />
            Feed
          </Button>
          
          <Button
            onClick={handlePlay}
            isLoading={isPlaying}
            variant="mint"
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 5: Create Learning Arcade

Create `src/components/child/LearningArcade.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  Calculator,
  BookOpen,
  Microscope,
  Globe,
  Palette,
  Music,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Confetti } from '@/components/ui/confetti'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface LearningArcadeProps {
  childId: string
  onQuizComplete: (subject: string, score: number) => Promise<void>
}

const subjects = [
  { id: 'math', name: 'Math Monsters', icon: Calculator, color: 'bg-red-400' },
  { id: 'reading', name: 'Word Wizards', icon: BookOpen, color: 'bg-blue-400' },
  { id: 'science', name: 'Science Sparks', icon: Microscope, color: 'bg-green-400' },
  { id: 'geography', name: 'Globe Trotters', icon: Globe, color: 'bg-yellow-400' },
  { id: 'art', name: 'Art Attack', icon: Palette, color: 'bg-purple-400' },
  { id: 'music', name: 'Music Maestro', icon: Music, color: 'bg-pink-400' }
]

// Sample questions - in real app, these would come from API
const sampleQuestions: Record<string, Question[]> = {
  math: [
    {
      id: '1',
      question: 'What is 8 × 7?',
      options: ['54', '56', '58', '60'],
      correctAnswer: 1,
      explanation: '8 × 7 = 56'
    },
    {
      id: '2',
      question: 'What is 144 ÷ 12?',
      options: ['10', '11', '12', '13'],
      correctAnswer: 2,
      explanation: '144 ÷ 12 = 12'
    }
  ],
  reading: [
    {
      id: '1',
      question: 'What type of word is "quickly"?',
      options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
      correctAnswer: 3,
      explanation: '"Quickly" is an adverb - it describes how something is done'
    }
  ]
}

export function LearningArcade({ childId, onQuizComplete }: LearningArcadeProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const questions = selectedSubject ? sampleQuestions[selectedSubject] || [] : []
  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setCurrentQuestion(0)
    setScore(0)
    setQuizComplete(false)
  }

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    
    setShowResult(true)
    
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      handleQuizComplete()
    }
  }

  const handleQuizComplete = async () => {
    setQuizComplete(true)
    setIsSubmitting(true)
    
    const percentage = (score / questions.length) * 100
    if (percentage >= 80) {
      setShowConfetti(true)
    }
    
    try {
      await onQuizComplete(selectedSubject!, score)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePlayAgain = () => {
    setSelectedSubject(null)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizComplete(false)
  }

  return (
    <>
      <Confetti active={showConfetti} />
      
      <AnimatePresence mode="wait">
        {!selectedSubject ? (
          <motion.div
            key="subject-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-sunny-yellow" />
                  Choose Your Adventure!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {subjects.map((subject) => {
                    const Icon = subject.icon
                    return (
                      <motion.button
                        key={subject.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectSubject(subject.id)}
                        className={cn(
                          'p-6 rounded-xl text-white font-medium',
                          'flex flex-col items-center gap-3',
                          'transition-all hover:shadow-lg',
                          subject.color
                        )}
                      >
                        <Icon className="w-8 h-8" />
                        <span>{subject.name}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : quizComplete ? (
          <motion.div
            key="quiz-complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center">
              <CardContent className="py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-sunny-yellow" />
                <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-3xl font-bold text-success mb-4">
                  {score} / {questions.length}
                </p>
                <p className="text-slate-gray/70 mb-6">
                  {score === questions.length
                    ? 'Perfect score! Amazing! 🌟'
                    : score >= questions.length * 0.8
                    ? 'Great job! Keep it up! 🎉'
                    : score >= questions.length * 0.6
                    ? 'Good effort! Practice makes perfect! 💪'
                    : 'Nice try! Let\'s try again! 🚀'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handlePlayAgain} variant="outline">
                    Play Again
                  </Button>
                  <Button onClick={() => setSelectedSubject(null)}>
                    Choose New Subject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>
                    Question {currentQuestion + 1} of {questions.length}
                  </CardTitle>
                  <span className="text-sm font-medium text-slate-gray/70">
                    Score: {score}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              
              <CardContent className="space-y-6">
                <h3 className="text-xl font-medium">{question?.question}</h3>
                
                <div className="space-y-3">
                  {question?.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showResult}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-all',
                        'border-2 font-medium',
                        selectedAnswer === index
                          ? showResult
                            ? index === question.correctAnswer
                              ? 'border-success bg-success/10 text-success'
                              : 'border-error bg-error/10 text-error'
                            : 'border-sky-blue bg-sky-blue/10'
                          : 'border-slate-200 hover:border-sky-blue/50',
                        showResult &&
                          index === question.correctAnswer &&
                          'border-success bg-success/10 text-success'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && index === question.correctAnswer && (
                          <span className="text-2xl">✓</span>
                        )}
                        {showResult &&
                          selectedAnswer === index &&
                          index !== question.correctAnswer && (
                            <span className="text-2xl">✗</span>
                          )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {showResult && question?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-xl"
                  >
                    <p className="text-sm text-slate-gray/70">
                      {question.explanation}
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  {!showResult ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion}>
                      {currentQuestion < questions.length - 1
                        ? 'Next Question'
                        : 'Finish Quiz'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## API Development

### Step 6: Create Milestone/Timeline APIs

Create `src/app/api/milestones/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'PARENT',
        familyId: 'test-family-id'
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn()
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  }),
  usePathname: () => '/dashboard'
}))
```

### Step 2: Create Example Tests

Create `src/components/ui/__tests__/button.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button isLoading loadingText="Loading...">Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Loading...')
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Step 3: Create Deployment Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "CLOUDINARY_API_KEY": "@cloudinary_api_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret",
    "PUSHER_APP_ID": "@pusher_app_id",
    "PUSHER_KEY": "@pusher_key",
    "PUSHER_SECRET": "@pusher_secret",
    "RESEND_API_KEY": "@resend_api_key"
  }
}
```

### Step 4: Create Production Build Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "prisma db seed",
    "postinstall": "prisma generate"
  }
}
```

### Step 5: Create GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
```

---

## Final Implementation Notes

### Security Considerations

1. **Authentication**: All routes are protected with NextAuth session checks
2. **Authorization**: Role-based access control for parent vs child features
3. **Data Validation**: Zod schemas validate all API inputs
4. **SQL Injection**: Prisma ORM prevents SQL injection attacks
5. **XSS Protection**: React automatically escapes content
6. **CORS**: Configure proper CORS headers for production

### Performance Optimizations

1. **Image Optimization**: Use Next.js Image component with Cloudinary
2. **Code Splitting**: Leverage Next.js automatic code splitting
3. **Caching**: Implement React Query for data caching
4. **Database Indexes**: Add indexes for frequently queried fields
5. **Real-time Updates**: Use Pusher sparingly to reduce overhead

### Monitoring & Analytics

1. **Error Tracking**: Integrate Sentry for error monitoring
2. **Analytics**: Add Google Analytics or Plausible
3. **Performance**: Use Vercel Analytics
4. **Database Monitoring**: Set up Prisma metrics

### Mobile Responsiveness

The entire application is built mobile-first with responsive design:
- Touch-friendly interfaces for children
- Swipe gestures for quest cards
- Bottom navigation for easy thumb access
- Large tap targets for small fingers

### Accessibility

1. **ARIA Labels**: Proper labels for screen readers
2. **Keyboard Navigation**: Full keyboard support
3. **Color Contrast**: WCAG AA compliance
4. **Focus Indicators**: Clear focus states
5. **Alt Text**: Descriptive alt text for images

### Future Enhancements

1. **Native Apps**: React Native implementation
2. **Voice Commands**: Add voice interaction for younger children
3. **AI Integration**: Smart task suggestions based on child's progress
4. **Multiplayer**: Family challenges and competitions
5. **Offline Mode**: PWA with offline capabilities

---

## Deployment Steps

1. **Set up PostgreSQL database** (e.g., on Supabase or Railway)
2. **Configure Cloudinary account** for image storage
3. **Set up Pusher account** for real-time features
4. **Configure Resend** for email notifications
5. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```
6. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```
7. **Seed initial data** (optional):
   ```bash
   npx prisma db seed
   ```

The application is now ready for use! Parents can sign up, add their children, create tasks and rewards, while children can complete quests, earn rewards, and have fun with their virtual pet.
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.number().min(1).max(5),
  starValue: z.number().min(1),
  assignedToId: z.string().optional(),
  isRecurring: z.boolean(),
  recurringRule: z.any().optional(),
  requiresProof: z.boolean(),
  dueDate: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        familyId: session.user.familyId,
        isActive: true
      },
      include: {
        assignedTo: {
          include: { user: true }
        },
        completions: {
          where: {
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id }
    })

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId,
        createdById: parent.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      }
    })

    // If not assigned to specific child, assign to all children
    if (!validatedData.assignedToId) {
      const children = await prisma.child.findMany({
        where: { familyId: session.user.familyId }
      })

      // Create tasks for each child
      for (const child of children) {
        await prisma.task.create({
          data: {
            ...validatedData,
            familyId: session.user.familyId,
            createdById: parent.id,
            assignedToId: child.id,
            dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
          }
        })
      }
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
```

Create `src/app/api/tasks/[taskId]/complete/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      include: { family: { include: { settings: true } } }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        assignedToId: child.id,
        isActive: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if already completed today
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        taskId: task.id,
        childId: child.id,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Task already completed today' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { proofImage, notes } = body

    // Create completion record
    const completion = await prisma.taskCompletion.create({
      data: {
        taskId: task.id,
        childId: child.id,
        proofImage,
        notes,
        starsAwarded: task.starValue,
        isApproved: !task.requiresProof // Auto-approve if no proof required
      }
    })

    // If auto-approved, update child's stats
    if (!task.requiresProof) {
      const settings = child.family.settings!
      const coinsEarned = Math.floor(task.starValue / settings.starToCoinsRatio)

      await prisma.child.update({
        where: { id: child.id },
        data: {
          totalStars: { increment: task.starValue },
          currentCoins: { increment: coinsEarned },
          lifetimeCoins: { increment: coinsEarned },
          xp: { increment: task.difficulty * 10 }
        }
      })

      // Check for level up
      const newLevel = Math.floor(child.xp / 100) + 1
      if (newLevel > child.level) {
        await prisma.child.update({
          where: { id: child.id },
          data: { level: newLevel }
        })

        // Trigger level up notification
        await pusher.trigger(
          `family-${child.familyId}`,
          'level-up',
          {
            childId: child.id,
            childName: child.nickname,
            newLevel
          }
        )
      }

      // Update streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      const yesterdayTasks = await prisma.taskCompletion.count({
        where: {
          childId: child.id,
          completedAt: {
            gte: yesterday,
            lt: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })

      if (yesterdayTasks > 0) {
        await prisma.child.update({
          where: { id: child.id },
          data: {
            currentStreak: { increment: 1 },
            longestStreak: {
              set: Math.max(child.currentStreak + 1, child.longestStreak)
            }
          }
        })
      }
    }

    // Send real-time notification to parents
    await pusher.trigger(
      `family-${child.familyId}`,
      'task-completed',
      {
        taskId: task.id,
        childId: child.id,
        childName: child.nickname,
        taskTitle: task.title,
        requiresApproval: task.requiresProof
      }
    )

    return NextResponse.json(completion)
  } catch (error) {
    console.error('Failed to complete task:', error)
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    )
  }
}
```

### Step 2: Create Reward System APIs

Create `src/app/api/rewards/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRewardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.enum(['experience', 'item', 'privilege', 'screentime']),
  coinCost: z.number().min(1),
  quantity: z.number().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  requiresApproval: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    let whereClause: any = {
      familyId: session.user.familyId,
      isActive: true
    }

    // If requesting as child, filter by age
    if (childId) {
      const child = await prisma.child.findUnique({
        where: { id: childId }
      })
      
      if (child) {
        const age = Math.floor(
          (Date.now() - new Date(child.birthDate).getTime()) / 
          (365.25 * 24 * 60 * 60 * 1000)
        )
        
        whereClause = {
          ...whereClause,
          OR: [
            { minAge: null, maxAge: null },
            { minAge: { lte: age }, maxAge: null },
            { minAge: null, maxAge: { gte: age } },
            { minAge: { lte: age }, maxAge: { gte: age } }
          ]
        }
      }
    }

    const rewards = await prisma.reward.findMany({
      where: whereClause,
      include: {
        purchases: {
          where: { isRedeemed: false }
        }
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRewardSchema.parse(body)

    const reward = await prisma.reward.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId
      }
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    console.error('Failed to create reward:', error)
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    )
  }
}
```

Create `src/app/api/rewards/[rewardId]/purchase/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function POST(
  request: NextRequest,
  { params }: { params: { rewardId: string } }
) {
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

    const reward = await prisma.reward.findFirst({
      where: {
        id: params.rewardId,
        familyId: child.familyId,
        isActive: true
      }
    })

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Check if child has enough coins
    if (child.currentCoins < reward.coinCost) {
      return NextResponse.json(
        { error: 'Not enough coins' },
        { status: 400 }
      )
    }

    // Check quantity if limited
    if (reward.quantity !== null) {
      const purchaseCount = await prisma.rewardPurchase.count({
        where: {
          rewardId: reward.id,
          isRedeemed: false
        }
      })

      if (purchaseCount >= reward.quantity) {
        return NextResponse.json(
          { error: 'Reward out of stock' },
          { status: 400 }
        )
      }
    }

    // Create purchase in transaction
    const [purchase, updatedChild] = await prisma.$transaction([
      prisma.rewardPurchase.create({
        data: {
          rewardId: reward.id,
          childId: child.id,
          coinCost: reward.coinCost,
          isRedeemed: !reward.requiresApproval
        }
      }),
      prisma.child.update({
        where: { id: child.id },
        data: {
          currentCoins: { decrement: reward.coinCost }
        }
      })
    ])

    // Special handling for screen time rewards
    if (reward.category === 'screentime' && !reward.requiresApproval) {
      const bonusMinutes = parseInt(reward.description || '15')
      await prisma.child.update({
        where: { id: child.id },
        data: {
          bonusScreenMinutes: { increment: bonusMinutes }
        }
      })
    }

    // Send notification to parents
    await pusher.trigger(
      `family-${child.familyId}`,
      'reward-purchased',
      {
        childId: child.id,
        childName: child.nickname,
        rewardTitle: reward.title,
        coinCost: reward.coinCost,
        requiresApproval: reward.requiresApproval
      }
    )

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Failed to purchase reward:', error)
    return NextResponse.json(
      { error: 'Failed to purchase reward' },
      { status: 500 }
    )
  }
}
```

### Step 3: Create Real-time Updates with Pusher

Create `src/lib/pusher.ts`:

```typescript
import Pusher from 'pusher'
import PusherClient from 'pusher-js'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
})

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
  }
)
```

Create `src/hooks/usePusher.ts`:

```typescript
'use client'

import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher'
import { useAuth } from './useAuth'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'

export function usePusher() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.familyId) return

    const channel = pusherClient.subscribe(`family-${user.familyId}`)

    // Task completed notification
    channel.bind('task-completed', (data: any) => {
      if (user.role === 'PARENT') {
        toast({
          title: 'Task Completed! 🎉',
          description: `${data.childName} completed "${data.taskTitle}"`,
          action: data.requiresApproval ? 'Review' : undefined,
          onAction: () => router.push('/tasks')
        })
      }
    })

    // Reward purchased notification
    channel.bind('reward-purchased', (data: any) => {
      if (user.role === 'PARENT') {
        toast({
          title: 'Reward Purchased! 🛍️',
          description: `${data.childName} bought "${data.rewardTitle}" for ${data.coinCost} coins`,
          action: data.requiresApproval ? 'Approve' : undefined,
          onAction: () => router.push('/rewards')
        })
      }
    })

    // Level up notification
    channel.bind('level-up', (data: any) => {
      toast({
        title: 'Level Up! 🎮',
        description: `${data.childName} reached level ${data.newLevel}!`,
        variant: 'success'
      })
    })

    // Refresh data on updates
    channel.bind('data-updated', () => {
      router.refresh()
    })

    return () => {
      pusherClient.unsubscribe(`family-${user.familyId}`)
    }
  }, [user, router])
}
```

### Step 4: Create Virtual Pet System

Create `src/components/child/VirtualPet.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heart, Zap, Cookie, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VirtualPet as PetType } from '@prisma/client'

interface VirtualPetProps {
  pet: PetType
  onFeed: () => Promise<void>
  onPlay: () => Promise<void>
}

const petAnimations = {
  dragon: {
    happy: '🐲',
    neutral: '🐉',
    sad: '😔🐲',
    sleeping: '😴🐲'
  },
  unicorn: {
    happy: '🦄',
    neutral: '🦄',
    sad: '😢🦄',
    sleeping: '😴🦄'
  },
  robot: {
    happy: '🤖',
    neutral: '🤖',
    sad: '😔🤖',
    sleeping: '😴🤖'
  }
}

export function VirtualPet({ pet, onFeed, onPlay }: VirtualPetProps) {
  const [isFeeding, setIsFeeding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const [bounce, setBounce] = useState(false)

  const petEmoji = petAnimations[pet.type as keyof typeof petAnimations][
    pet.mood as keyof typeof petAnimations.dragon
  ]

  const handleFeed = async () => {
    setIsFeeding(true)
    setShowHeart(true)
    await onFeed()
    setTimeout(() => setShowHeart(false), 2000)
    setIsFeeding(false)
  }

  const handlePlay = async () => {
    setIsPlaying(true)
    setBounce(true)
    await onPlay()
    setTimeout(() => setBounce(false), 1000)
    setIsPlaying(false)
  }

  // Calculate time since last interaction
  const timeSinceLastFed = Date.now() - new Date(pet.lastFed).getTime()
  const timeSinceLastPlayed = Date.now() - new Date(pet.lastPlayed).getTime()
  const needsAttention = timeSinceLastFed > 8 * 60 * 60 * 1000 || // 8 hours
                        timeSinceLastPlayed > 8 * 60 * 60 * 1000

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{pet.name}</span>
          <span className="text-sm font-normal text-slate-gray/70">
            Level {pet.level}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pet Display */}
        <div className="relative h-48 flex items-center justify-center">
          <motion.div
            animate={{
              y: bounce ? [0, -20, 0] : 0,
              scale: pet.mood === 'happy' ? [1, 1.1, 1] : 1
            }}
            transition={{
              y: { duration: 0.5, repeat: bounce ? 2 : 0 },
              scale: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
            }}
            className="text-8xl"
          >
            {petEmoji}
          </motion.div>

          {/* Floating hearts when happy */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -50 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2"
              >
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attention indicator */}
          {needsAttention && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-0 right-0"
            >
              <div className="w-3 h-3 bg-warning rounded-full" />
            </motion.div>
          )}

          {/* Accessories */}
          {pet.accessories.length > 0 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {pet.accessories.includes('hat') && <span>🎩</span>}
              {pet.accessories.includes('glasses') && <span>🕶️</span>}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-gray/70 flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Happiness
              </span>
              <span className="text-sm font-medium">{pet.happiness}%</span>
            </div>
            <Progress
              value={pet.happiness}
              className="h-2"
              indicatorClassName={cn(
                pet.happiness > 70 ? 'bg-success' :
                pet.happiness > 40 ? 'bg-warning' :
                'bg-error'
              )}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-gray/70 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Energy
              </span>
              <span className="text-sm font-medium">{pet.energy}%</span>
            </div>
            <Progress
              value={pet.energy}
              className="h-2"
              indicatorClassName="bg-sunny-yellow"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-gray/70 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                XP to Next Level
              </span>
              <span className="text-sm font-medium">
                {pet.xp} / {pet.level * 100}
              </span>
            </div>
            <Progress
              value={(pet.xp / (pet.level * 100)) * 100}
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-purple-400 to-indigo-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleFeed}
            isLoading={isFeeding}
            variant="coral"
            className="w-full"
          >
            <Cookie className="w-4 h-4 mr-2" />
            Feed
          </Button>
          
          <Button
            onClick={handlePlay}
            isLoading={isPlaying}
            variant="mint"
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 5: Create Learning Arcade

Create `src/components/child/LearningArcade.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  Calculator,
  BookOpen,
  Microscope,
  Globe,
  Palette,
  Music,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Confetti } from '@/components/ui/confetti'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface LearningArcadeProps {
  childId: string
  onQuizComplete: (subject: string, score: number) => Promise<void>
}

const subjects = [
  { id: 'math', name: 'Math Monsters', icon: Calculator, color: 'bg-red-400' },
  { id: 'reading', name: 'Word Wizards', icon: BookOpen, color: 'bg-blue-400' },
  { id: 'science', name: 'Science Sparks', icon: Microscope, color: 'bg-green-400' },
  { id: 'geography', name: 'Globe Trotters', icon: Globe, color: 'bg-yellow-400' },
  { id: 'art', name: 'Art Attack', icon: Palette, color: 'bg-purple-400' },
  { id: 'music', name: 'Music Maestro', icon: Music, color: 'bg-pink-400' }
]

// Sample questions - in real app, these would come from API
const sampleQuestions: Record<string, Question[]> = {
  math: [
    {
      id: '1',
      question: 'What is 8 × 7?',
      options: ['54', '56', '58', '60'],
      correctAnswer: 1,
      explanation: '8 × 7 = 56'
    },
    {
      id: '2',
      question: 'What is 144 ÷ 12?',
      options: ['10', '11', '12', '13'],
      correctAnswer: 2,
      explanation: '144 ÷ 12 = 12'
    }
  ],
  reading: [
    {
      id: '1',
      question: 'What type of word is "quickly"?',
      options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
      correctAnswer: 3,
      explanation: '"Quickly" is an adverb - it describes how something is done'
    }
  ]
}

export function LearningArcade({ childId, onQuizComplete }: LearningArcadeProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const questions = selectedSubject ? sampleQuestions[selectedSubject] || [] : []
  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setCurrentQuestion(0)
    setScore(0)
    setQuizComplete(false)
  }

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    
    setShowResult(true)
    
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      handleQuizComplete()
    }
  }

  const handleQuizComplete = async () => {
    setQuizComplete(true)
    setIsSubmitting(true)
    
    const percentage = (score / questions.length) * 100
    if (percentage >= 80) {
      setShowConfetti(true)
    }
    
    try {
      await onQuizComplete(selectedSubject!, score)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePlayAgain = () => {
    setSelectedSubject(null)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizComplete(false)
  }

  return (
    <>
      <Confetti active={showConfetti} />
      
      <AnimatePresence mode="wait">
        {!selectedSubject ? (
          <motion.div
            key="subject-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-sunny-yellow" />
                  Choose Your Adventure!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {subjects.map((subject) => {
                    const Icon = subject.icon
                    return (
                      <motion.button
                        key={subject.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectSubject(subject.id)}
                        className={cn(
                          'p-6 rounded-xl text-white font-medium',
                          'flex flex-col items-center gap-3',
                          'transition-all hover:shadow-lg',
                          subject.color
                        )}
                      >
                        <Icon className="w-8 h-8" />
                        <span>{subject.name}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : quizComplete ? (
          <motion.div
            key="quiz-complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center">
              <CardContent className="py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-sunny-yellow" />
                <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-3xl font-bold text-success mb-4">
                  {score} / {questions.length}
                </p>
                <p className="text-slate-gray/70 mb-6">
                  {score === questions.length
                    ? 'Perfect score! Amazing! 🌟'
                    : score >= questions.length * 0.8
                    ? 'Great job! Keep it up! 🎉'
                    : score >= questions.length * 0.6
                    ? 'Good effort! Practice makes perfect! 💪'
                    : 'Nice try! Let\'s try again! 🚀'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handlePlayAgain} variant="outline">
                    Play Again
                  </Button>
                  <Button onClick={() => setSelectedSubject(null)}>
                    Choose New Subject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>
                    Question {currentQuestion + 1} of {questions.length}
                  </CardTitle>
                  <span className="text-sm font-medium text-slate-gray/70">
                    Score: {score}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              
              <CardContent className="space-y-6">
                <h3 className="text-xl font-medium">{question?.question}</h3>
                
                <div className="space-y-3">
                  {question?.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showResult}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-all',
                        'border-2 font-medium',
                        selectedAnswer === index
                          ? showResult
                            ? index === question.correctAnswer
                              ? 'border-success bg-success/10 text-success'
                              : 'border-error bg-error/10 text-error'
                            : 'border-sky-blue bg-sky-blue/10'
                          : 'border-slate-200 hover:border-sky-blue/50',
                        showResult &&
                          index === question.correctAnswer &&
                          'border-success bg-success/10 text-success'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && index === question.correctAnswer && (
                          <span className="text-2xl">✓</span>
                        )}
                        {showResult &&
                          selectedAnswer === index &&
                          index !== question.correctAnswer && (
                            <span className="text-2xl">✗</span>
                          )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {showResult && question?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-xl"
                  >
                    <p className="text-sm text-slate-gray/70">
                      {question.explanation}
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  {!showResult ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion}>
                      {currentQuestion < questions.length - 1
                        ? 'Next Question'
                        : 'Finish Quiz'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## API Development

### Step 6: Create Milestone/Timeline APIs

Create `src/app/api/milestones/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'