import { testDb } from '../setup/database';

describe('Demo Users Test', () => {
  test('should check if demo users exist', async () => {
    const parentDemo = await testDb.user.findUnique({
      where: { email: 'parent@demo.com' }
    });

    const childDemo = await testDb.user.findUnique({
      where: { email: 'child@demo.com' }
    });

    console.log('Parent demo user:', parentDemo);
    console.log('Child demo user:', childDemo);

    if (!parentDemo) {
      console.log('❌ Parent demo user does not exist');
    } else {
      console.log('✅ Parent demo user exists');
    }

    if (!childDemo) {
      console.log('❌ Child demo user does not exist');
    } else {
      console.log('✅ Child demo user exists');
    }
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });
});