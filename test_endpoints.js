const http = require('http');

async function testApis() {
  const API_URL = 'http://localhost:5000/api/sellers';
  let token = '';

  const randStr = Math.random().toString(36).substring(7);
  const testSeller = {
    name: 'Test Seller',
    email: `test${randStr}@example.com`,
    password: 'password123',
    phone: '1234567890'
  };

  try {
    console.log('--- 1. Testing Registration ---');
    const regRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSeller)
    });
    const regData = await regRes.json();
    console.log('Registration Response:', regData);
    if (!regRes.ok) throw new Error('Registration failed');

    console.log('\n--- 2. Testing Login ---');
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testSeller.email, password: testSeller.password })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    if (!loginRes.ok) throw new Error('Login failed');
    
    token = loginData.token;

    console.log('\n--- 3. Testing Update Shop Details ---');
    const shopRes = await fetch(`${API_URL}/shop`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        shopName: 'My Awesome Pet Shop', 
        address: '123 Pet Street', 
        description: 'Best pets in town' 
      })
    });
    const shopData = await shopRes.json();
    console.log('Shop Update Response:', shopData);
    if (!shopRes.ok) throw new Error('Shop update failed');

    console.log('\n--- 4. Testing Add Product ---');
    const prodRes = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        name: 'Dog Food 5kg', 
        description: 'Premium dog food', 
        price: 25.99,
        image: 'http://example.com/dogfood.jpg'
      })
    });
    const prodData = await prodRes.json();
    console.log('Add Product Response:', prodData);
    if (!prodRes.ok) throw new Error('Add product failed');

    console.log('\n--- 5. Testing Dashboard ---');
    const dashRes = await fetch(`${API_URL}/dashboard`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log('Dashboard Response:');
    console.log('- Seller:', dashData.seller.name);
    console.log('- Shop:', dashData.seller.shopDetails);
    console.log('- Products count:', dashData.products.length);
    console.log('- Orders count:', dashData.orders.length);
    
    if (!dashRes.ok) throw new Error('Dashboard fetch failed');

    console.log('\n✅ All API tests passed successfully!');

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
  }
}

testApis();
