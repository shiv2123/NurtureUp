import { PrismaClient } from '../../../nurtureup/node_modules/@prisma/client';
import path from 'path';

// Create a test database client
const testDbPath = path.join(__dirname, '../../../nurtureup/prisma/test.db');

export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: `file:${testDbPath}`
    }
  },
  log: ['error'] // Only log errors in tests
});

export async function cleanDatabase() {
  // Use a more aggressive cleanup approach
  await testDb.$executeRaw`PRAGMA foreign_keys = OFF`;
  
  try {
    // Delete all data from all tables
    const tables = [
      'Session', 'LearningScore', 'BadgeEarned', 'Badge', 'VirtualPet',
      'RewardPurchase', 'Reward', 'TaskCompletion', 'Task', 'Milestone', 
      'FamilySettings', 'Child', 'Parent', 'User', 'Family'
    ];
    
    for (const table of tables) {
      try {
        await testDb.$executeRawUnsafe(`DELETE FROM "${table}"`);
      } catch (e) {
        // Table might not exist, continue
      }
    }
  } finally {
    await testDb.$executeRaw`PRAGMA foreign_keys = ON`;
  }
}

export async function seedTestData() {
  const timestamp = Date.now();
  
  // Create a test family with unique name
  const family = await testDb.family.create({
    data: {
      name: `Test Family ${timestamp}`,
      timezone: 'America/New_York',
      currency: 'USD'
    }
  });

  // Create test parent user with unique email
  const parentUser = await testDb.user.create({
    data: {
      email: `parent-${timestamp}@test.com`,
      password: '$2a$10$TEST_HASH', // Placeholder hash
      name: 'Test Parent',
      role: 'PARENT',
      familyId: family.id
    }
  });

  // Create parent profile
  const parent = await testDb.parent.create({
    data: {
      userId: parentUser.id,
      familyId: family.id,
      isPrimary: true
    }
  });

  // Create test child user with unique email
  const childUser = await testDb.user.create({
    data: {
      email: `child-${timestamp}@test.com`,
      password: '$2a$10$TEST_HASH', // Placeholder hash
      name: 'Test Child',
      role: 'CHILD',
      familyId: family.id
    }
  });

  // Create child profile
  const child = await testDb.child.create({
    data: {
      userId: childUser.id,
      familyId: family.id,
      nickname: 'TestKid',
      birthDate: new Date('2015-06-15'),
      level: 5,
      xp: 250,
      totalStars: 100,
      currentCoins: 50,
      lifetimeCoins: 200
    }
  });

  // Create test task
  const task = await testDb.task.create({
    data: {
      familyId: family.id,
      createdById: parent.id,
      title: 'Make Bed',
      description: 'Make your bed every morning',
      difficulty: 2,
      starValue: 10,
      assignedToId: child.id,
      isRecurring: true,
      recurringRule: JSON.stringify({ type: 'daily', days: [1,2,3,4,5] })
    }
  });

  // Create test reward
  const reward = await testDb.reward.create({
    data: {
      familyId: family.id,
      title: 'Extra Screen Time',
      description: '30 minutes of extra screen time',
      category: 'screentime',
      coinCost: 25,
      isActive: true
    }
  });

  return {
    family,
    parentUser,
    parent,
    childUser,
    child,
    task,
    reward
  };
}

export async function setupTestDatabase() {
  await cleanDatabase();
  return await seedTestData();
}