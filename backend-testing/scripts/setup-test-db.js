const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupTestDatabase() {
  console.log('🚀 Setting up test database...');
  
  const testDbPath = path.join(__dirname, '../../nurtureup/prisma/test.db');
  const mainDbPath = path.join(__dirname, '../../nurtureup/prisma/dev.db');
  
  try {
    // Remove existing test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
      console.log('✅ Removed existing test database');
    }
    
    // Copy the main database to create test database
    if (fs.existsSync(mainDbPath)) {
      fs.copyFileSync(mainDbPath, testDbPath);
      console.log('✅ Created test database from main database');
    } else {
      // If no main database exists, create a fresh one
      console.log('📝 Creating fresh test database...');
      process.chdir(path.join(__dirname, '../../nurtureup'));
      
      // Set test environment
      process.env.DATABASE_URL = 'file:./prisma/test.db';
      
      // Run migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Applied database migrations');
      
      // Run seed script
      try {
        execSync('npx prisma db seed', { stdio: 'inherit' });
        console.log('✅ Seeded test database');
      } catch (error) {
        console.log('⚠️ Seed script not available or failed, continuing...');
      }
    }
    
    console.log('🎉 Test database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    process.exit(1);
  }
}

setupTestDatabase();