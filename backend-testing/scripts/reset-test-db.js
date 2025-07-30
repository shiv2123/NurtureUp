const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function resetTestDatabase() {
  console.log('🔄 Resetting test database...');
  
  const testDbPath = path.join(__dirname, '../../nurtureup/prisma/test.db');
  
  try {
    // Remove existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
      console.log('✅ Removed existing test database');
    }
    
    // Change to nurtureup directory for prisma commands
    process.chdir(path.join(__dirname, '../../nurtureup'));
    
    // Set test environment
    process.env.DATABASE_URL = 'file:./prisma/test.db';
    
    // Create fresh database and run migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Applied database migrations');
    
    // Run seed script
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Seeded test database');
    } catch (error) {
      console.log('⚠️ Seed script not available or failed, continuing...');
    }
    
    console.log('🎉 Test database reset complete!');
    
  } catch (error) {
    console.error('❌ Error resetting test database:', error.message);
    process.exit(1);
  }
}

resetTestDatabase();