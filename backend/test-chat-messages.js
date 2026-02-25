const mysql = require('mysql2/promise');

async function testChatMessages() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cocolytics',
    waitForConnections: true,
    connectionLimit: 10
  });

  try {
    // Simulate the exact query from the API
    const conversationId = 5;
    const limit = 50;
    const offset = 0;

    const query = `
      SELECT 
        cm.id,
        cm.message_text,
        cm.is_read,
        cm.created_at,
        cm.sender_id,
        u.name as sender_name,
        sp.store_name as sender_store_name,
        sp.store_logo as sender_logo
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
      WHERE cm.conversation_id = ?
      ORDER BY cm.created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [messages] = await pool.execute(query, [conversationId]);

    console.log('Messages found:', messages.length);
    console.log('Messages data:', JSON.stringify(messages, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testChatMessages();
