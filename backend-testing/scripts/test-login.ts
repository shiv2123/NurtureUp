import fetch from 'node-fetch';

async function testDemoLogin() {
  console.log('🔑 Testing demo login...');
  
  try {
    // Test parent login
    console.log('\n👨‍👩‍👧‍👦 Testing parent login...');
    const parentResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'parent@demo.com',
        password: 'demo123',
        csrfToken: 'test', // We'll need to get the real one
        callbackUrl: '/parent/dashboard',
        json: 'true'
      })
    });

    console.log('Parent login status:', parentResponse.status);
    console.log('Parent login response:', await parentResponse.text());

    // Test child login
    console.log('\n👶 Testing child login...');
    const childResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'child@demo.com',
        password: 'demo123',
        csrfToken: 'test',
        callbackUrl: '/child/adventure',
        json: 'true'
      })
    });

    console.log('Child login status:', childResponse.status);
    console.log('Child login response:', await childResponse.text());

  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

testDemoLogin();