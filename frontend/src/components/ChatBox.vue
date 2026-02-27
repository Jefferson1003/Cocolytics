<template>
  <div :class="['chat-widget', { 'minimized': isMinimized }]">
    <!-- Chat Toggle Button (when minimized) -->
    <button v-if="isMinimized" @click="toggleChat" class="chat-toggle-btn">
      💬
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <!-- Chat Box (when expanded) -->
    <div v-else class="chat-box">
      <!-- Header -->
      <div class="chat-box-header">
        <div class="header-info">
          <h3>💬 Chat</h3>
          <span v-if="selectedUser" class="active-chat">{{ selectedUser.name }}</span>
        </div>
        <div class="header-actions">
          <button @click="toggleChat" class="btn-minimize" title="Minimize">−</button>
          <button @click="closeChat" class="btn-close" title="Close">×</button>
        </div>
      </div>

      <!-- Contacts List (no conversation selected) -->
      <div v-if="!selectedConversationId" class="contacts-view">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="🔍 Search contacts..." 
            class="search-input"
          />
        </div>

        <div v-if="loadingContacts" class="loading-contacts">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>

        <div v-else-if="filteredContacts.length === 0" class="no-contacts">
          <p>No contacts available</p>
        </div>

        <div v-else class="contacts-list">
          <div 
            v-for="contact in filteredContacts" 
            :key="contact.id"
            @click="startChat(contact)"
            class="contact-item"
          >
            <div class="contact-avatar">
              <img 
                v-if="contact.store_logo" 
                :src="getImageUrl(contact.store_logo)" 
                :alt="contact.name"
              />
              <span v-else class="avatar-text">{{ getInitial(contact.name) }}</span>
            </div>
            <div class="contact-info">
              <div class="contact-name">{{ contact.store_name || contact.name }}</div>
              <div v-if="contact.last_message" class="contact-last-msg">{{ contact.last_message }}</div>
            </div>
            <div v-if="contact.unread_count > 0" class="unread-badge">{{ contact.unread_count }}</div>
          </div>
        </div>
      </div>

      <!-- Chat Messages View (conversation selected) -->
      <div v-else class="chat-view">
        <div class="chat-header-bar">
          <button @click="backToContacts" class="btn-back">← Back</button>
          <div class="chat-user">
            <div class="user-avatar-small">
              <img 
                v-if="selectedUser?.store_logo" 
                :src="getImageUrl(selectedUser.store_logo)" 
                :alt="selectedUser.name"
              />
              <span v-else class="avatar-text-small">{{ getInitial(selectedUser?.name) }}</span>
            </div>
            <span>{{ selectedUser?.store_name || selectedUser?.name }}</span>
          </div>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="messages-area">
          <div v-if="loadingMessages" class="loading-messages">
            <div class="spinner"></div>
          </div>

          <div v-else-if="messages.length === 0" class="no-messages">
            <p>No messages yet. Say hi! 👋</p>
          </div>

          <div v-else class="messages-list">
            <div 
              v-for="msg in messages" 
              :key="msg.id"
              :class="['message', { 'message-sent': msg.sender_id === currentUserId, 'message-received': msg.sender_id !== currentUserId }]"
            >
              <div class="message-bubble">
                <p>{{ msg.message_text }}</p>
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input-area">
          <form @submit.prevent="sendMessage">
            <input 
              v-model="newMessage" 
              type="text" 
              placeholder="Type a message..." 
              class="message-input"
              :disabled="sending"
            />
            <button type="submit" :disabled="!newMessage.trim() || sending" class="btn-send">
              {{ sending ? '⏳' : '📤' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ChatBox',
  data() {
    return {
      isMinimized: true,
      contacts: [],
      messages: [],
      selectedConversationId: null,
      selectedUser: null,
      searchQuery: '',
      newMessage: '',
      loadingContacts: false,
      loadingMessages: false,
      sending: false,
      currentUserId: null,
      unreadCount: 0,
      pollInterval: null
    }
  },
  computed: {
    filteredContacts() {
      if (!this.searchQuery) return this.contacts
      const search = this.searchQuery.toLowerCase()
      return this.contacts.filter(c => 
        c.name.toLowerCase().includes(search) || 
        (c.store_name && c.store_name.toLowerCase().includes(search))
      )
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null
    this.currentUserId = user?.id
  },
  mounted() {
    this.fetchContacts()
    
    // Poll for new messages
    this.pollInterval = setInterval(() => {
      if (this.selectedConversationId && !this.isMinimized) {
        this.fetchMessages(this.selectedConversationId, true)
      }
      this.updateUnreadCount()
    }, 3000)
  },
  beforeUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  },
  methods: {
    toggleChat() {
      this.isMinimized = !this.isMinimized
      if (!this.isMinimized) {
        this.fetchContacts()
      }
    },
    closeChat() {
      this.isMinimized = true
      this.selectedConversationId = null
      this.selectedUser = null
    },
    async fetchContacts() {
      this.loadingContacts = true
      try {
        const token = localStorage.getItem('token')
        
        // Fetch conversations
        const convResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Fetch all traders
        const tradersResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/traders`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Combine conversations and traders
        const conversations = convResponse.data.conversations || []
        const traders = tradersResponse.data.traders || []
        
        // Map conversations to contacts with last message info
        const contactsFromConv = conversations.map(conv => ({
          id: conv.participants[0]?.id,
          name: conv.participants[0]?.name,
          store_name: conv.participants[0]?.store_name,
          store_logo: conv.participants[0]?.store_logo,
          conversation_id: conv.id,
          last_message: conv.last_message,
          unread_count: conv.unread_count || 0
        }))
        
        // Add traders not in conversations
        const convUserIds = contactsFromConv.map(c => c.id)
        const newTraders = traders
          .filter(t => t.id !== this.currentUserId && !convUserIds.includes(t.id))
          .map(t => ({
            id: t.id,
            name: t.name,
            store_name: t.store_name,
            store_logo: t.store_logo,
            conversation_id: null,
            last_message: null,
            unread_count: 0
          }))
        
        this.contacts = [...contactsFromConv, ...newTraders]
        this.updateUnreadCount()
      } catch (error) {
        console.error('Error fetching contacts:', error)
      } finally {
        this.loadingContacts = false
      }
    },
    async startChat(contact) {
      this.selectedUser = contact
      
      if (contact.conversation_id) {
        this.selectedConversationId = contact.conversation_id
        await this.fetchMessages(contact.conversation_id)
      } else {
        // Create new conversation
        try {
          const token = localStorage.getItem('token')
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`,
            { recipient_id: contact.id },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          this.selectedConversationId = response.data.conversation.id
          contact.conversation_id = response.data.conversation.id
          this.messages = []
        } catch (error) {
          console.error('Error creating conversation:', error)
        }
      }
    },
    async fetchMessages(conversationId, silent = false) {
      if (!silent) this.loadingMessages = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.messages = response.data.messages || []
        
        // Mark as read
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${conversationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Scroll to bottom
        this.$nextTick(() => {
          if (this.$refs.messagesContainer) {
            this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
          }
        })
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        this.loadingMessages = false
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return
      
      this.sending = true
      try {
        const token = localStorage.getItem('token')
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${this.selectedConversationId}/messages`,
          { message_text: this.newMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        this.newMessage = ''
        await this.fetchMessages(this.selectedConversationId, true)
      } catch (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message')
      } finally {
        this.sending = false
      }
    },
    backToContacts() {
      this.selectedConversationId = null
      this.selectedUser = null
      this.messages = []
      this.fetchContacts()
    },
    updateUnreadCount() {
      this.unreadCount = this.contacts.reduce((sum, c) => sum + (c.unread_count || 0), 0)
    },
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return `${import.meta.env.VITE_API_BASE_URL}/${path}`
    },
    getInitial(name) {
      return name ? name.charAt(0).toUpperCase() : '?'
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
      return `${Math.floor(diff / 86400000)}d`
    }
  }
}
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.chat-toggle-btn .badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: bold;
}

.chat-box {
  width: 360px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-box-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.active-chat {
  font-size: 12px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-minimize,
.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: background 0.2s;
}

.btn-minimize:hover,
.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.contacts-view,
.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.contacts-list {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.contact-item:hover {
  background: #f9fafb;
}

.contact-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 2px;
}

.contact-last-msg {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  background: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.loading-contacts,
.no-contacts,
.loading-messages,
.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.chat-header-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-back {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.chat-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text-small {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
}

.message-sent .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received .message-bubble {
  background: white;
  color: #1f2937;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-bubble p {
  margin: 0 0 4px 0;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-input-area {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.message-input-area form {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar styling */
.contacts-list::-webkit-scrollbar,
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.contacts-list::-webkit-scrollbar-track,
.messages-area::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.contacts-list::-webkit-scrollbar-thumb,
.messages-area::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.contacts-list::-webkit-scrollbar-thumb:hover,
.messages-area::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
