// Import the production prisma client directly
import { PrismaClient } from '@prisma/client';

describe('Production Database Test', () => {
  let prodDb: PrismaClient;

  beforeAll(async () => {
    // Connect to production database (dev.db)
    prodDb = new PrismaClient({
      datasources: {
        db: {
          url: 'file:../nurtureup/prisma/dev.db'
        }
      }
    });
  });

  test('should find demo users in production database', async () => {
    console.log('🔍 Checking demo users in production database...');
    
    const parentUser = await prodDb.user.findUnique({
      where: { email: 'parent@demo.com' }
    });
    
    const childUser = await prodDb.user.findUnique({
      where: { email: 'child@demo.com' }
    });
    
    console.log('Parent demo user:', parentUser ? 'EXISTS' : 'NOT FOUND');
    console.log('Child demo user:', childUser ? 'EXISTS' : 'NOT FOUND');
    
    if (parentUser) {
      console.log('✅ Parent details:', {
        id: parentUser.id,
        email: parentUser.email,
        name: parentUser.name,
        role: parentUser.role
      });
    }
    
    if (childUser) {
      console.log('✅ Child details:', {
        id: childUser.id,
        email: childUser.email,
        name: childUser.name,
        role: childUser.role
      });
    }
    
    expect(parentUser).toBeTruthy();
    expect(childUser).toBeTruthy();
  });

  afterAll(async () => {
    await prodDb.$disconnect();
  });
});