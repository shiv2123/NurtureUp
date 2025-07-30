import { prisma } from '../../nurtureup/src/lib/prisma';
import bcrypt from 'bcryptjs';

async function checkDemoUsers() {
  console.log('🔍 Checking demo users...');

  try {
    const parentDemo = await prisma.user.findUnique({
      where: { email: 'parent@demo.com' },
      include: {
        family: true,
        parentProfile: true
      }
    });

    const childDemo = await prisma.user.findUnique({
      where: { email: 'child@demo.com' },
      include: {
        family: true,
        childProfile: true
      }
    });

    console.log('Parent demo user:', parentDemo);
    console.log('Child demo user:', childDemo);

    if (parentDemo && childDemo) {
      // Test password
      const parentPasswordValid = await bcrypt.compare('demo123', parentDemo.password!);
      const childPasswordValid = await bcrypt.compare('demo123', childDemo.password!);
      
      console.log('Parent password valid:', parentPasswordValid);
      console.log('Child password valid:', childPasswordValid);
    }
    
  } catch (error) {
    console.error('❌ Error checking demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDemoUsers();