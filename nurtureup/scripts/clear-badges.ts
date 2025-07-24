import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearBadges() {
  console.log('Clearing existing badges...')
  
  // Delete badge earned records first
  await prisma.badgeEarned.deleteMany({})
  console.log('✓ Cleared badge earned records')
  
  // Delete badges
  await prisma.badge.deleteMany({})
  console.log('✓ Cleared badges')
  
  console.log('Badge cleanup complete!')
}

clearBadges()
  .catch(console.error)
  .finally(() => prisma.$disconnect())