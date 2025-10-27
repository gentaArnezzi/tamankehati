// Test authentication and API calls
const API_BASE_URL = 'http://localhost:8000';

async function testAuth() {
  try {
    console.log('🔐 Testing authentication...');
    
    // Test login
    const loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@kehati.org',
        password: 'password'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData);
    
    const token = loginData.access_token;
    
    // Test dashboard API
    console.log('📊 Testing dashboard API...');
    const dashboardResponse = await fetch(`${API_BASE_URL}/api/v1/dashboard/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!dashboardResponse.ok) {
      throw new Error(`Dashboard API failed: ${dashboardResponse.status}`);
    }
    
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard API successful:', dashboardData);
    
    // Test users API
    console.log('👥 Testing users API...');
    const usersResponse = await fetch(`${API_BASE_URL}/api/v1/users/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Users API failed: ${usersResponse.status}`);
    }
    
    const usersData = await usersResponse.json();
    console.log('✅ Users API successful:', usersData.length, 'users');
    
    // Test flora API
    console.log('🌿 Testing flora API...');
    const floraResponse = await fetch(`${API_BASE_URL}/api/v1/flora/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!floraResponse.ok) {
      throw new Error(`Flora API failed: ${floraResponse.status}`);
    }
    
    const floraData = await floraResponse.json();
    console.log('✅ Flora API successful:', floraData.items.length, 'flora');
    
    // Test fauna API
    console.log('🐦 Testing fauna API...');
    const faunaResponse = await fetch(`${API_BASE_URL}/api/v1/fauna/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!faunaResponse.ok) {
      throw new Error(`Fauna API failed: ${faunaResponse.status}`);
    }
    
    const faunaData = await faunaResponse.json();
    console.log('✅ Fauna API successful:', faunaData.items.length, 'fauna');
    
    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();
