const express = require('express');
const router = express.Router();

// ==================== TRADER CHAT ROUTES ====================

/**
 * Get all conversations for the current user
 * Returns list of conversations with last message and unread count
 */
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;

    const [conversations] = await req.db.execute(`
      SELECT 
        c.id,
        c.last_message_at,
        c.updated_at,
        (SELECT COUNT(*) 
         FROM chat_messages cm 
         WHERE cm.conversation_id = c.id 
           AND cm.sender_id != ? 
           AND cm.is_read = FALSE
        ) as unread_count,
        (SELECT cm.message_text 
         FROM chat_messages cm 
         WHERE cm.conversation_id = c.id 
         ORDER BY cm.created_at DESC 
         LIMIT 1
        ) as last_message,
        (SELECT cm.created_at 
         FROM chat_messages cm 
         WHERE cm.conversation_id = c.id 
         ORDER BY cm.created_at DESC 
         LIMIT 1
        ) as last_message_time,
        GROUP_CONCAT(
          DISTINCT CASE 
            WHEN cp.user_id != ? 
            THEN CONCAT(u.id, ':', u.name, ':', COALESCE(sp.store_name, '')) 
          END 
          SEPARATOR '||'
        ) as other_participants
      FROM chat_conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN users u ON cp.user_id = u.id
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
      WHERE c.id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = ?
      )
      GROUP BY c.id
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `, [userId, userId, userId]);

    // Parse participants data
    const formattedConversations = conversations.map(conv => {
      const participants = [];
      if (conv.other_participants) {
        conv.other_participants.split('||').forEach(p => {
          if (p) {
            const [id, name, storeName] = p.split(':');
            participants.push({
              id: parseInt(id),
              name: name || 'Unknown',
              store_name: storeName || name
            });
          }
        });
      }

      return {
        id: conv.id,
        last_message: conv.last_message,
        last_message_time: conv.last_message_time || conv.updated_at,
        unread_count: conv.unread_count || 0,
        participants
      };
    });

    res.json({ success: true, conversations: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
});

/**
 * Get or create a conversation with another trader
 * POST body: { recipient_id }
 */
router.post('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipient_id } = req.body;

    if (!recipient_id) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (userId === parseInt(recipient_id)) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if recipient exists and is a staff member
    const [recipientCheck] = await req.db.execute(
      'SELECT id, name, role FROM users WHERE id = ? AND role IN ("staff", "admin")',
      [recipient_id]
    );

    if (recipientCheck.length === 0) {
      return res.status(404).json({ message: 'Recipient not found or not a trader' });
    }

    // Check if conversation already exists between these two users
    const [existingConv] = await req.db.execute(`
      SELECT c.id 
      FROM chat_conversations c
      INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
      INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
      WHERE cp1.user_id = ? AND cp2.user_id = ?
      GROUP BY c.id
      HAVING COUNT(DISTINCT cp1.user_id) = 2
        AND (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) = 2
      LIMIT 1
    `, [userId, recipient_id]);

    if (existingConv.length > 0) {
      // Return existing conversation
      return res.json({ 
        success: true, 
        conversation_id: existingConv[0].id,
        existing: true 
      });
    }

    // Create new conversation
    const [convResult] = await req.db.execute(
      'INSERT INTO chat_conversations (created_at) VALUES (NOW())'
    );

    const conversationId = convResult.insertId;

    // Add both participants
    await req.db.execute(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
      [conversationId, userId, conversationId, recipient_id]
    );

    res.json({ 
      success: true, 
      conversation_id: conversationId,
      existing: false 
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Failed to create conversation', error: error.message });
  }
});

/**
 * Get messages in a conversation
 * GET /conversations/:conversationId/messages
 */
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Verify user is participant in this conversation
    const [participation] = await req.db.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (participation.length === 0) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    // Get messages - use string interpolation for LIMIT/OFFSET instead of placeholders
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
    
    const [messages] = await req.db.execute(query, [conversationId]);

    // Mark messages as read (except own messages)
    await req.db.execute(`
      UPDATE chat_messages 
      SET is_read = TRUE 
      WHERE conversation_id = ? 
        AND sender_id != ? 
        AND is_read = FALSE
    `, [conversationId, userId]);

    // Update last_read_at for participant
    await req.db.execute(`
      UPDATE conversation_participants 
      SET last_read_at = NOW() 
      WHERE conversation_id = ? AND user_id = ?
    `, [conversationId, userId]);

    res.json({ 
      success: true, 
      messages: messages // Already in chronological order (ASC)

    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

/**
 * Send a message in a conversation
 * POST /messages
 * Body: { conversation_id, message_text }
 */
router.post('/messages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversation_id, message_text } = req.body;

    if (!conversation_id || !message_text || message_text.trim() === '') {
      return res.status(400).json({ message: 'Conversation ID and message text are required' });
    }

    // Verify user is participant in this conversation
    const [participation] = await req.db.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversation_id, userId]
    );

    if (participation.length === 0) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }

    // Insert message
    const [result] = await req.db.execute(
      'INSERT INTO chat_messages (conversation_id, sender_id, message_text, created_at) VALUES (?, ?, ?, NOW())',
      [conversation_id, userId, message_text.trim()]
    );

    // Update conversation's last_message_at
    await req.db.execute(
      'UPDATE chat_conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = ?',
      [conversation_id]
    );

    // Get the created message with sender info
    const [newMessage] = await req.db.execute(`
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
      WHERE cm.id = ?
    `, [result.insertId]);

    res.json({ 
      success: true, 
      message: newMessage[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

/**
 * Get list of all traders (staff) for starting new conversations
 * GET /traders
 */
router.get('/traders', async (req, res) => {
  try {
    const userId = req.user.id;

    const [traders] = await req.db.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        sp.store_name,
        sp.store_logo,
        sp.store_description,
        sp.contact_number,
        sp.is_active
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
      WHERE u.role IN ('staff', 'admin') 
        AND u.id != ?
        AND (sp.is_active IS NULL OR sp.is_active = TRUE)
      ORDER BY sp.store_name ASC, u.name ASC
    `, [userId]);

    res.json({ success: true, traders });
  } catch (error) {
    console.error('Get traders error:', error);
    res.status(500).json({ message: 'Failed to fetch traders', error: error.message });
  }
});

/**
 * Get unread message count for current user
 * GET /unread-count
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await req.db.execute(`
      SELECT COUNT(*) as unread_count
      FROM chat_messages cm
      INNER JOIN conversation_participants cp ON cm.conversation_id = cp.conversation_id
      WHERE cp.user_id = ? 
        AND cm.sender_id != ?
        AND cm.is_read = FALSE
    `, [userId, userId]);

    res.json({ 
      success: true, 
      unread_count: result[0].unread_count 
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
  }
});

/**
 * Delete a message
 * DELETE /messages/:messageId
 * Only the sender can delete their own messages
 */
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    // Check if message exists and belongs to user
    const [message] = await req.db.execute(
      'SELECT id, sender_id FROM chat_messages WHERE id = ?',
      [messageId]
    );

    if (message.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message[0].sender_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete the message
    await req.db.execute('DELETE FROM chat_messages WHERE id = ?', [messageId]);

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
});

/**
 * Delete a conversation
 * DELETE /conversations/:conversationId
 * Only participants can delete conversations
 * This deletes all messages and removes all participants (CASCADE)
 */
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Check if user is a participant in this conversation
    const [participant] = await req.db.execute(
      'SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (participant.length === 0) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    // Delete the conversation - CASCADE will automatically delete messages and participants
    const [result] = await req.db.execute('DELETE FROM chat_conversations WHERE id = ?', [conversationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
  }
});

module.exports = router;
