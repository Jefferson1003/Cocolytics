// Quick test script to verify chat API is working
// Run this in the browser console (F12) while on the website

async function testChatAPI() {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  console.log('🧪 Testing Chat API...');
  console.log('Token:', token ? '✅ Found' : '❌ Not found');
  console.log('API URL:', apiUrl);
  
  if (!token) {
    console.error('❌ No token found. Please login first.');
    return;
  }
  
  // Test 1: Get traders list
  try {
    console.log('\n📝 Test 1: Getting traders list...');
    const response = await fetch(`${apiUrl}/api/chat/traders`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Traders list retrieved:', data.traders?.length || 0, 'traders found');
      console.log('Sample trader:', data.traders?.[0]);
    } else {
      const error = await response.json();
      console.error('❌ Failed to get traders:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Error connecting to server:', error.message);
    console.error('Make sure backend is running on', apiUrl);
  }
  
  // Test 2: Get conversations
  try {
    console.log('\n📝 Test 2: Getting conversations...');
    const response = await fetch(`${apiUrl}/api/chat/conversations`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conversations retrieved:', data.conversations?.length || 0, 'conversations found');
    } else {
      const error = await response.json();
      console.error('❌ Failed to get conversations:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Error connecting to server:', error.message);
  }
  
  console.log('\n✅ Test complete!');
  console.log('If you see 403 errors, you need to be logged in as staff/admin');
  console.log('If you see connection errors, start the backend server: cd backend && node server.js');
}

// Run the test
testChatAPI();
