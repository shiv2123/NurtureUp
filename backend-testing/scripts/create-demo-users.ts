import { prisma } from '../../nurtureup/src/lib/prisma';
import bcrypt from 'bcryptjs';

async function createDemoUsers() {
  console.log('🎭 Creating demo users...');

  try {
    // Hash the password 'demo123'
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create demo family first
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
    });

    console.log('✅ Created demo family:', demoFamily.id);

    // Create parent demo user
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
    });

    console.log('✅ Created parent demo user:', parentUser.email);

    // Create child demo user
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
            nickname: 'DemoKid',
            birthDate: new Date('2015-01-01'),
            level: 3,
            xp: 150,
            totalStars: 50,
            currentCoins: 25,
            lifetimeCoins: 100,
            dailyScreenMinutes: 60,
            bonusScreenMinutes: 0,
            usedScreenMinutes: 0,
            lastScreenReset: new Date(),
            theme: 'candy',
            soundEnabled: true,
            currentStreak: 0,
            longestStreak: 0
          }
        }
      }
    });

    console.log('✅ Created child demo user:', childUser.email);

    // Create a demo task
    const demoTask = await prisma.task.create({
      data: {
        title: 'Clean Your Room',
        description: 'Make your bed and put toys away',
        category: 'CHORES',
        frequency: 'DAILY',
        starReward: 10,
        familyId: demoFamily.id,
        assignedToId: childUser.childProfile?.id,
        createdById: parentUser.id,
        isActive: true,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      }
    });

    console.log('✅ Created demo task:', demoTask.title);

    // Create a demo reward
    const demoReward = await prisma.reward.create({
      data: {
        title: 'Extra Screen Time',
        description: '30 minutes of extra screen time',
        category: 'SCREEN_TIME',
        coinCost: 20,
        familyId: demoFamily.id,
        createdById: parentUser.id,
        isActive: true
      }
    });

    console.log('✅ Created demo reward:', demoReward.title);

    console.log('🎉 Demo users and data created successfully!');
    console.log('📧 Parent login: parent@demo.com / demo123');
    console.log('👶 Child login: child@demo.com / demo123');
    
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUsers();