-- ==========================================
-- TRADER CHAT SYSTEM DATABASE SCHEMA
-- ==========================================

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id INT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversation Participants Table (supports 1-on-1 and group chats)
CREATE TABLE IF NOT EXISTS conversation_participants (
  id INT NOT NULL AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_conversation_user (conversation_id, user_id),
  KEY idx_user_id (user_id),
  KEY idx_conversation_id (conversation_id),
  CONSTRAINT fk_conv_participant_conv FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_participant_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT NOT NULL AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conversation_id (conversation_id),
  KEY idx_sender_id (sender_id),
  KEY idx_created_at (created_at),
  CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_messages_conversation_created ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_unread_messages ON chat_messages(conversation_id, is_read);
