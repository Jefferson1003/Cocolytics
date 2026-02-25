<template>
  <div class="staff-layout">
    <StaffSidebar />
    
    <div class="main-content">
      <div class="chat-container">
        <div class="chat-header">
          <h1>💬 Trader Chat</h1>
          <p>Connect with other traders for buying and selling</p>
        </div>

        <div class="chat-layout">
          <!-- Conversations List Sidebar -->
          <div class="conversations-sidebar">
            <div class="sidebar-header">
              <h3>Messages</h3>
              <button @click="showNewChatModal = true" class="btn-new-chat" title="New Chat">
                <span>➕</span>
              </button>
            </div>

            <div v-if="loadingConversations" class="loading-state">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="conversations.length === 0" class="empty-state">
              <p>No conversations yet</p>
              <button @click="showNewChatModal = true" class="btn-primary">Start a Chat</button>
            </div>

            <div v-else class="conversations-list">
              <div 
                v-for="conv in conversations" 
                :key="conv.id"
                :class="['conversation-item', { active: selectedConversationId === conv.id }]"
              >
                <div @click="selectConversation(conv.id)" class="conversation-content">
                  <div class="conv-avatar">
                    <img 
                      v-if="conv.participants[0]?.store_logo" 
                      :src="getImageUrl(conv.participants[0].store_logo)" 
                      :alt="conv.participants[0].store_name"
                    />
                    <span v-else class="avatar-placeholder">{{ getInitial(conv.participants[0]?.name) }}</span>
                  </div>
                  <div class="conv-info">
                    <div class="conv-name">{{ conv.participants[0]?.store_name || conv.participants[0]?.name || 'Unknown' }}</div>
                    <div class="conv-last-message">{{ conv.last_message || 'No messages yet' }}</div>
                  </div>
                  <div class="conv-meta">
                    <div class="conv-time">{{ formatTime(conv.last_message_time) }}</div>
                    <div v-if="conv.unread_count > 0" class="unread-badge">{{ conv.unread_count }}</div>
                  </div>
                </div>
                <button 
                  @click.stop="confirmDeleteConversation(conv.id)" 
                  class="btn-delete-conv"
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <!-- Chat Messages Area -->
          <div class="chat-area">
            <!-- Show all traders when no conversation selected -->
            <div v-if="!selectedConversationId" class="traders-directory">
              <div class="directory-header">
                <h2>👥 All Traders</h2>
                <p>Click on any trader to start a conversation</p>
                <input 
                  v-model="traderSearch" 
                  type="text" 
                  placeholder="🔍 Search traders by name or store..." 
                  class="search-input-main"
                />
              </div>

              <div v-if="loadingTraders" class="loading-state">
                <div class="spinner-small"></div>
                <p>Loading traders...</p>
              </div>

              <div v-else-if="filteredTraders.length === 0" class="empty-traders">
                <div class="empty-icon">🏪</div>
                <h3>No traders found</h3>
                <p v-if="traderSearch">Try a different search term</p>
                <p v-else>No active traders available at the moment</p>
              </div>

              <div v-else class="traders-grid">
                <div 
                  v-for="trader in filteredTraders" 
                  :key="trader.id"
                  @click="startNewChat(trader.id)"
                  class="trader-card"
                >
                  <div class="trader-card-avatar">
                    <img 
                      v-if="trader.store_logo" 
                      :src="getImageUrl(trader.store_logo)" 
                      :alt="trader.store_name"
                    />
                    <span v-else class="avatar-placeholder-large">{{ getInitial(trader.name) }}</span>
                  </div>
                  <div class="trader-card-info">
                    <h3 class="trader-card-name">{{ trader.store_name || trader.name }}</h3>
                    <p class="trader-card-owner">{{ trader.name }}</p>
                    <p v-if="trader.store_description" class="trader-card-description">
                      {{ trader.store_description }}
                    </p>
                    <div v-if="trader.contact_number" class="trader-card-contact">
                      📞 {{ trader.contact_number }}
                    </div>
                  </div>
                  <div class="trader-card-action">
                    <span class="chat-icon">💬</span>
                  </div>
                </div>
              </div>
            </div>

            <template v-else>
              <!-- Chat Header -->
              <div class="chat-messages-header">
                <div class="chat-user-info">
                  <div class="user-avatar">
                    <img 
                      v-if="currentConversation?.participants[0]?.store_logo" 
                      :src="getImageUrl(currentConversation.participants[0].store_logo)" 
                      :alt="currentConversation.participants[0].store_name"
                    />
                    <span v-else class="avatar-placeholder">{{ getInitial(currentConversation?.participants[0]?.name) }}</span>
                  </div>
                  <div>
                    <h3>{{ currentConversation?.participants[0]?.store_name || currentConversation?.participants[0]?.name || 'Unknown' }}</h3>
                    <p class="user-subtitle">{{ currentConversation?.participants[0]?.name }}</p>
                  </div>
                </div>
              </div>

              <!-- Messages List -->
              <div ref="messagesContainer" class="messages-container">
                <div v-if="loadingMessages" class="loading-state">
                  <div class="spinner-small"></div>
                  <p>Loading messages...</p>
                </div>

                <div v-else-if="messages.length === 0" class="empty-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>

                <div v-else class="messages-list">
                  <div 
                    v-for="message in messages" 
                    :key="message.id"
                    :class="['message-item', { 'message-own': message.sender_id === currentUserId }]"
                  >
                    <div class="message-bubble" @contextmenu.prevent="toggleMessageOptions(message.id)">
                      <p class="message-text">{{ message.message_text }}</p>
                      <div class="message-footer">
                        <span class="message-time">{{ formatMessageTime(message.created_at) }}</span>
                        <span v-if="message.sender_id === currentUserId && message.is_read" class="read-receipt">✓✓</span>
                      </div>
                      <button @click="toggleMessageOptions(message.id)" class="message-menu-btn">⋮</button>
                    </div>
                    <div v-if="showMessageOptions[message.id]" class="message-options">
                      <button @click="copyMessage(message.message_text)" class="option-btn">
                        <span>📋</span> Copy
                      </button>
                      <button @click="openForwardModal(message)" class="option-btn">
                        <span>➡️</span> Forward
                      </button>
                      <button v-if="message.sender_id === currentUserId" @click="deleteMessage(message.id)" class="option-btn danger">
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message Input -->
              <div class="message-input-area">
                <form @submit.prevent="sendMessage" class="message-form">
                  <input
                    v-model="newMessage"
                    type="text"
                    placeholder="Type your message..."
                    class="message-input"
                    :disabled="sending"
                  />
                  <button type="submit" class="btn-send" :disabled="!newMessage.trim() || sending">
                    <span v-if="sending">⏳</span>
                    <span v-else>📤</span>
                  </button>
                </form>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- New Chat Modal -->
    <div v-if="showNewChatModal" class="modal-overlay" @click="closeNewChatModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Start New Chat</h2>
          <button @click="closeNewChatModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <input 
            v-model="traderSearch" 
            type="text" 
            placeholder="Search traders..." 
            class="search-input"
          />

          <div v-if="loadingTraders" class="loading-state">
            <div class="spinner-small"></div>
          </div>

          <div v-else class="traders-list">
            <div 
              v-for="trader in filteredTraders" 
              :key="trader.id"
              @click="startNewChat(trader.id)"
              class="trader-item"
            >
              <div class="trader-avatar">
                <img 
                  v-if="trader.store_logo" 
                  :src="getImageUrl(trader.store_logo)" 
                  :alt="trader.store_name"
                />
                <span v-else class="avatar-placeholder">{{ getInitial(trader.name) }}</span>
              </div>
              <div class="trader-info">
                <div class="trader-name">{{ trader.store_name || trader.name }}</div>
                <div class="trader-subtitle">{{ trader.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forward Message Modal -->
    <div v-if="showForwardModal" class="modal-overlay" @click="closeForwardModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Forward Message</h2>
          <button @click="closeForwardModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="forward-preview">
            <p><strong>Message:</strong></p>
            <div class="preview-bubble">{{ messageToForward?.message_text }}</div>
          </div>

          <p class="forward-instruction">Select a conversation to forward this message to:</p>

          <div v-if="loadingConversations" class="loading-state">
            <div class="spinner-small"></div>
          </div>

          <div v-else class="conversations-list-modal">
            <div 
              v-for="conv in conversations.filter(c => c.id !== selectedConversationId)" 
              :key="conv.id"
              @click="forwardMessage(conv.id)"
              class="conversation-item-modal"
            >
              <div class="conv-avatar">
                <img 
                  v-if="conv.participants[0]?.store_logo" 
                  :src="getImageUrl(conv.participants[0].store_logo)" 
                  :alt="conv.participants[0].store_name"
                />
                <span v-else class="avatar-placeholder">{{ getInitial(conv.participants[0]?.name) }}</span>
              </div>
              <div class="conv-info">
                <div class="conv-name">{{ conv.participants[0]?.store_name || conv.participants[0]?.name || 'Unknown' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      <span class="alert-icon">✓</span>
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'TraderChat',
  components: {
    StaffSidebar
  },
  data() {
    return {
      conversations: [],
      messages: [],
      traders: [],
      selectedConversationId: null,
      newMessage: '',
      showNewChatModal: false,
      showForwardModal: false,
      messageToForward: null,
      traderSearch: '',
      loadingConversations: true,
      loadingMessages: false,
      loadingTraders: false,
      sending: false,
      currentUserId: null,
      pollInterval: null,
      showMessageOptions: {},
      successMessage: '',
      conversationToDelete: null
    }
  },
  computed: {
    currentConversation() {
      return this.conversations.find(c => c.id === this.selectedConversationId)
    },
    filteredTraders() {
      if (!this.traderSearch) return this.traders
      const search = this.traderSearch.toLowerCase()
      return this.traders.filter(t => 
        t.name.toLowerCase().includes(search) || 
        (t.store_name && t.store_name.toLowerCase().includes(search))
      )
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null
    this.currentUserId = user?.id
    console.log('Current user ID:', this.currentUserId, 'User data:', user)
    
    // Fetch conversations and traders
    this.initializeChat()
  },
  async mounted() {
    // Poll for new messages every 5 seconds
    this.pollInterval = setInterval(() => {
      if (this.selectedConversationId) {
        this.fetchMessages(this.selectedConversationId, true)
      }
      this.fetchConversations()
    }, 5000)
  },
  beforeUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  },
  methods: {
    async initializeChat() {
      await this.fetchConversations()
      this.fetchTraders()
      
      // Check if there's a conversation ID in the query params
      if (this.$route.query.conversation) {
        const conversationId = parseInt(this.$route.query.conversation)
        console.log('Selecting conversation from query:', conversationId)
        // Select immediately after conversations are loaded
        await this.selectConversation(conversationId)
      }
    },
    async fetchConversations() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.conversations = response.data.conversations
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        this.loadingConversations = false
      }
    },
    async fetchMessages(conversationId, silent = false) {
      if (!silent) this.loadingMessages = true
      try {
        const token = localStorage.getItem('token')
        console.log('=== FETCHING MESSAGES ===')
        console.log('Conversation ID:', conversationId)
        console.log('Current User ID:', this.currentUserId)
        console.log('Token exists:', !!token)
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        console.log('API Response:', response.data)
        console.log('Messages received:', response.data.messages)
        
        // Force reactivity by creating new array
        this.messages = [...(response.data.messages || [])]
        console.log('Messages array length:', this.messages.length)
        console.log('Messages in component:', JSON.stringify(this.messages.map(m => ({
          id: m.id,
          text: m.message_text,
          sender_id: m.sender_id,
          current_user: this.currentUserId,
          is_own: m.sender_id === this.currentUserId
        }))))
        
        if (!silent && this.messages.length > 0) {
          this.$nextTick(() => {
            console.log('Scrolling to bottom')
            this.scrollToBottom()
          })
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        console.error('Error details:', error.response?.data)
        this.messages = []
      } finally {
        if (!silent) this.loadingMessages = false
      }
    },
    async fetchTraders() {
      this.loadingTraders = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/traders`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.traders = response.data.traders
      } catch (error) {
        console.error('Error fetching traders:', error)
      } finally {
        this.loadingTraders = false
      }
    },
    async selectConversation(conversationId) {
      console.log('Selecting conversation:', conversationId)
      console.log('Current user ID:', this.currentUserId)
      this.selectedConversationId = conversationId
      this.messages = [] // Clear old messages
      this.loadingMessages = true // Show loading state
      await this.fetchMessages(conversationId)
      console.log('Messages loaded:', this.messages.length)
      console.log('Current messages:', this.messages)
      console.log('All data ready for rendering')
    },
    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return
      
      this.sending = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/messages`,
          {
            conversation_id: this.selectedConversationId,
            message_text: this.newMessage.trim()
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        this.messages.push(response.data.message)
        this.newMessage = ''
        
        this.$nextTick(() => {
          this.scrollToBottom()
        })
        
        // Refresh conversations to update last message
        await this.fetchConversations()
      } catch (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message. Please try again.')
      } finally {
        this.sending = false
      }
    },
    async startNewChat(traderId) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`,
          { recipient_id: traderId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        this.closeNewChatModal()
        this.traderSearch = '' // Clear search when starting chat
        await this.fetchConversations()
        this.selectConversation(response.data.conversation_id)
      } catch (error) {
        console.error('Error creating conversation:', error)
        alert('Failed to start chat. Please try again.')
      }
    },
    closeNewChatModal() {
      this.showNewChatModal = false
      this.traderSearch = ''
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    toggleMessageOptions(messageId) {
      this.showMessageOptions[messageId] = !this.showMessageOptions[messageId]
      this.$forceUpdate()
    },
    copyMessage(messageText) {
      navigator.clipboard.writeText(messageText).then(() => {
        this.successMessage = 'Message copied to clipboard!'
        setTimeout(() => this.successMessage = '', 3000)
      }).catch(() => {
        alert('Failed to copy message')
      })
      this.showMessageOptions = {}
    },
    openForwardModal(message) {
      this.messageToForward = message
      this.showForwardModal = true
      this.showMessageOptions = {}
    },
    closeForwardModal() {
      this.showForwardModal = false
      this.messageToForward = null
      this.traderSearch = ''
    },
    async forwardMessage(conversationId) {
      if (!this.messageToForward) return
      
      try {
        const token = localStorage.getItem('token')
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/messages`,
          {
            conversation_id: conversationId,
            message_text: `📨 Forwarded: ${this.messageToForward.message_text}`
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        this.successMessage = 'Message forwarded successfully!'
        setTimeout(() => this.successMessage = '', 3000)
        this.closeForwardModal()
      } catch (error) {
        console.error('Error forwarding message:', error)
        alert('Failed to forward message. Please try again.')
      }
    },
    async deleteMessage(messageId) {
      if (!confirm('Are you sure you want to delete this message?')) return
      
      try {
        const token = localStorage.getItem('token')
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/messages/${messageId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Remove message from local state
        this.messages = this.messages.filter(m => m.id !== messageId)
        this.successMessage = 'Message deleted successfully!'
        setTimeout(() => this.successMessage = '', 3000)
        this.showMessageOptions = {}
      } catch (error) {
        console.error('Error deleting message:', error)
        alert('Failed to delete message. Please try again.')
      }
    },
    confirmDeleteConversation(conversationId) {
      if (!confirm('Are you sure you want to delete this entire conversation? This action cannot be undone.')) return
      this.deleteConversation(conversationId)
    },
    async deleteConversation(conversationId) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Remove conversation from local state
        this.conversations = this.conversations.filter(c => c.id !== conversationId)
        
        // If deleted conversation was selected, clear selection
        if (this.selectedConversationId === conversationId) {
          this.selectedConversationId = null
          this.messages = []
        }
        
        this.successMessage = 'Conversation deleted successfully!'
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        console.error('Error deleting conversation:', error)
        alert('Failed to delete conversation. Please try again.')
      }
    },
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return `${import.meta.env.VITE_API_BASE_URL}${path}`
    },
    getInitial(name) {
      return name ? name.charAt(0).toUpperCase() : '?'
    },
    formatTime(datetime) {
      if (!datetime) return ''
      const date = new Date(datetime)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'Just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
      
      return date.toLocaleDateString()
    },
    formatMessageTime(datetime) {
      if (!datetime) return ''
      const date = new Date(datetime)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background: #f5f7fa;
}

.chat-container {
  height: calc(100vh - 80px);
  margin: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header h1 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #333;
}

.chat-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.chat-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Conversations Sidebar */
.conversations-sidebar {
  width: 320px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

.sidebar-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.btn-new-chat {
  background: #4CAF50;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-new-chat:hover {
  background: #45a049;
  transform: scale(1.1);
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
  background: white;
  position: relative;
}

.conversation-item:hover {
  background: #f5f7fa;
}

.conversation-item.active {
  background: #e8f5e9;
  border-left: 3px solid #4CAF50;
}

.conversation-content {
  display: flex;
  align-items: center;
  padding: 15px 50px 15px 20px;
  flex: 1;
  cursor: pointer;
}

.btn-delete-conv {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  opacity: 0;
  transition: all 0.2s;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.conversation-item:hover .btn-delete-conv {
  opacity: 1;
}

.btn-delete-conv:hover {
  background: #ffebee;
  transform: translateY(-50%) scale(1.1);
}

.conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.conv-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-last-message {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-meta {
  text-align: right;
  margin-left: 10px;
  flex-shrink: 0;
}

.conv-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.unread-badge {
  background: #4CAF50;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

/* Traders Directory (shown when no conversation selected) */
.traders-directory {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.directory-header {
  padding: 25px 30px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.directory-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.directory-header p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
}

.search-input-main {
  width: 100%;
  padding: 12px 18px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.search-input-main:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.traders-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  align-content: start;
  background: #f9fafb;
}

.trader-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.trader-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  border-color: #4CAF50;
}

.trader-card-avatar {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trader-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-large {
  color: white;
  font-size: 28px;
  font-weight: bold;
}

.trader-card-info {
  flex: 1;
  min-width: 0;
}

.trader-card-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trader-card-owner {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
}

.trader-card-description {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #777;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.trader-card-contact {
  font-size: 12px;
  color: #4CAF50;
  font-weight: 500;
}

.trader-card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-icon {
  font-size: 24px;
  opacity: 0.5;
  transition: all 0.3s;
}

.trader-card:hover .chat-icon {
  opacity: 1;
  transform: scale(1.2);
}

.empty-traders {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-traders h3 {
  margin: 0 0 10px 0;
  color: #666;
}

.empty-traders p {
  margin: 5px 0;
  color: #999;
}

.chat-messages-header {
  padding: 15px 25px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 12px;
  overflow: hidden;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-user-info h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.user-subtitle {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #666;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 25px;
  background: #f9fafb;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
}

/* Message Item - Clean bubble design for both sender and receiver */
.message-item {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 6px;
  animation: messageSlideIn 0.3s ease-out;
}

.message-item.message-own {
  justify-content: flex-end;
}

/* Fade in animation for new messages */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chat Bubble - Both sender and receiver get bubble styling */
.message-bubble {
  position: relative;
  max-width: 70%;
  min-width: 100px;
  padding: 12px 16px 8px 16px;
  border-radius: 20px;
  background: #e9ecef;
  color: #333;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  word-wrap: break-word;
  word-break: break-word;
  transition: all 0.2s ease;
}

.message-bubble:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

/* Sender's messages - Green bubble on right */
.message-own .message-bubble {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border-radius: 20px 20px 5px 20px;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.message-own .message-bubble:hover {
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.4);
}

/* Receiver's messages - Gray bubble on left */
.message-item:not(.message-own) .message-bubble {
  background: #f1f3f5;
  color: #333;
  border-radius: 20px 20px 20px 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

.message-text {
  margin: 0 0 8px 0;
  line-height: 1.5;
  font-size: 14px;
  word-wrap: break-word;
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  color: rgba(0,0,0,0.45);
}

.message-own .message-time {
  color: rgba(255,255,255,0.75);
}

.read-receipt {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
}

.message-menu-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.1);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: inherit;
}

.message-bubble:hover .message-menu-btn {
  opacity: 1;
}

.message-menu-btn:hover {
  background: rgba(0,0,0,0.2);
}

.message-options {
  position: absolute;
  top: calc(100% + 4px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 4px;
  z-index: 10;
  min-width: 140px;
}

.message-own .message-options {
  right: 0;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  text-align: left;
  transition: background 0.2s;
}

.option-btn:hover {
  background: #f5f5f5;
}

.option-btn.danger {
  color: #f44336;
}

.option-btn.danger:hover {
  background: #ffebee;
}

.option-btn span {
  font-size: 16px;
}

.message-input-area {
  font-size: 14px;
  color: #333;
  text-align: left;
  transition: background 0.2s;
}

.option-btn:hover {
  background: #f5f5f5;
}

.option-btn.danger {
  color: #f44336;
}

.option-btn.danger:hover {
  background: #ffebee;
}

.option-btn span {
  font-size: 16px;
}

.message-input-area {
  padding: 15px 25px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.message-form {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #4CAF50;
}

.btn-send {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #4CAF50;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-send:hover:not(:disabled) {
  background: #45a049;
  transform: scale(1.05);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 20px 25px;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  padding: 12px 18px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 15px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #4CAF50;
}

.traders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trader-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.trader-item:hover {
  background: #f5f7fa;
}

.trader-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 12px;
  overflow: hidden;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trader-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trader-info {
  flex: 1;
}

.trader-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.trader-subtitle {
  font-size: 13px;
  color: #666;
}

/* Loading & Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
}

.spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-state p {
  margin-bottom: 15px;
}

.empty-messages {
  text-align: center;
  padding: 60px 40px;
  color: #999;
}

.empty-messages::before {
  content: "💬";
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-messages p {
  margin: 0;
  font-size: 15px;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-1px);
}

/* Forward Modal Styles */
.forward-preview {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}

.forward-preview p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.preview-bubble {
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #4CAF50;
  color: #333;
  line-height: 1.4;
}

.forward-instruction {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.conversations-list-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.conversation-item-modal {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #e0e0e0;
}

.conversation-item-modal:hover {
  background: #f5f7fa;
  border-color: #4CAF50;
}

/* Success Alert */
.alert {
  position: fixed;
  top: 100px;
  right: 30px;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alert-success {
  background: #4CAF50;
  color: white;
}

.alert-icon {
  font-size: 20px;
  font-weight: bold;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .chat-container {
    margin: 10px;
    height: calc(100vh - 60px);
  }
  
  .conversations-sidebar {
    width: 280px;
  }
  
  .message {
    max-width: 85%;
  }

  .message-options {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }

  .alert {
    top: 70px;
    right: 15px;
    left: 15px;
    max-width: calc(100% - 30px);
  }
}
</style>
