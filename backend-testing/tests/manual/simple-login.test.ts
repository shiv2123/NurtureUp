import { testDb } from '../setup/database';

describe('Simple Login Test', () => {
  test('should verify demo users exist with correct passwords', async () => {
    console.log('🔍 Checking demo users in production database...');
    
    const parentUser = await testDb.user.findUnique({
      where: { email: 'parent@demo.com' }
    });
    
    const childUser = await testDb.user.findUnique({
      where: { email: 'child@demo.com' }
    });
    
    expect(parentUser).toBeTruthy();
    expect(childUser).toBeTruthy();
    
    console.log('✅ Parent demo user exists:', parentUser?.email);
    console.log('✅ Child demo user exists:', childUser?.email);
    console.log('✅ Parent role:', parentUser?.role);
    console.log('✅ Child role:', childUser?.role);
    
    // Test password verification
    const bcrypt = require('bcryptjs');
    
    if (parentUser?.password) {
      const parentPasswordValid = await bcrypt.compare('demo123', parentUser.password);
      console.log('✅ Parent password valid:', parentPasswordValid);
      expect(parentPasswordValid).toBe(true);
    }
    
    if (childUser?.password) {
      const childPasswordValid = await bcrypt.compare('demo123', childUser.password);
      console.log('✅ Child password valid:', childPasswordValid);
      expect(childPasswordValid).toBe(true);
    }
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });
});