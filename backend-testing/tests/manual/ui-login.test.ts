import { testDb } from '../setup/database';
import bcrypt from 'bcryptjs';

describe('UI Login Flow Test', () => {
  test('should verify demo login credentials work with authorization function', async () => {
    // Import the authorization function from NextAuth config
    const { authOptions } = await import('../../../nurtureup/src/lib/auth');
    
    const credentialsProvider = authOptions.providers.find(
      (provider: any) => provider.id === 'credentials'
    );
    
    if (!credentialsProvider) {
      throw new Error('Credentials provider not found');
    }

    console.log('🔑 Testing parent demo login...');
    
    // Test parent login
    const parentResult = await credentialsProvider.authorize({
      email: 'parent@demo.com',
      password: 'demo123'
    });

    console.log('Parent login result:', parentResult);
    expect(parentResult).toBeTruthy();
    expect(parentResult.email).toBe('parent@demo.com');
    expect(parentResult.role).toBe('PARENT');

    console.log('🔑 Testing child demo login...');
    
    // Test child login
    const childResult = await credentialsProvider.authorize({
      email: 'child@demo.com',
      password: 'demo123'
    });

    console.log('Child login result:', childResult);
    expect(childResult).toBeTruthy();
    expect(childResult.email).toBe('child@demo.com');
    expect(childResult.role).toBe('CHILD');
  });

  test('should verify routes exist for redirects', async () => {
    // Check if the redirect routes exist
    const fs = require('fs');
    const path = require('path');
    
    const parentDashboardPath = path.join('../../../nurtureup/src/app/parent/dashboard/page.tsx');
    const childAdventurePath = path.join('../../../nurtureup/src/app/child/adventure/page.tsx');
    
    const parentExists = fs.existsSync(parentDashboardPath);
    const childExists = fs.existsSync(childAdventurePath);
    
    console.log('Parent dashboard route exists:', parentExists);
    console.log('Child adventure route exists:', childExists);
    
    expect(parentExists).toBe(true);
    expect(childExists).toBe(true);
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });
});