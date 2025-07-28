import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { FamilySettingsManager } from '@/components/parent/FamilySettingsManager'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'PARENT') {
    redirect('/child/adventure')
  }

  // Fetch family and settings
  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId! },
    include: {
      settings: true,
      children: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }
    }
  })

  if (!family) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">
          Family Settings
        </h1>
      </div>

      <FamilySettingsManager family={family} />
    </div>
  )
}