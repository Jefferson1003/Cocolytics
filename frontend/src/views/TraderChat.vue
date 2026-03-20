<template>
  <div class="staff-layout">
    <StaffSidebar />
    
    <div class="main-content">
      <div class="chat-container">
        <div class="chat-header">
          <h1>
            <span class="inline-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16v10H8l-4 4V6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              </svg>
            </span>
            Trader Chat
          </h1>
          <p>Connect with other traders for buying and selling</p>
        </div>

        <div class="chat-layout">
          <!-- Conversations List Sidebar -->
          <div class="conversations-sidebar">
            <div class="sidebar-header">
              <h3>Messages</h3>
              <button @click="showNewChatModal = true" class="btn-new-chat" title="New Chat">
                <span class="inline-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
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
                  <span class="inline-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7h8m-7 0v11m6-11v11M6 7h12l-1 13H7L6 7Zm3-3h6l1 3H8l1-3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Chat Messages Area -->
          <div class="chat-area">
            <!-- Show all traders when no conversation selected -->
            <div v-if="!selectedConversationId" class="traders-directory">
              <div class="directory-header">
                <h2>
                  <span class="inline-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8"/>
                      <circle cx="16" cy="10" r="2.5" stroke="currentColor" stroke-width="1.8"/>
                      <path d="M4 19a5 5 0 0 1 10 0M13.5 19a4 4 0 0 1 6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                  </span>
                  All Traders
                </h2>
                <p>Click on any trader to start a conversation</p>
                <input 
                  v-model="traderSearch" 
                  type="text" 
                  placeholder="Search traders by name or store..." 
                  class="search-input-main"
                />
              </div>

              <div v-if="loadingTraders" class="loading-state">
                <div class="spinner-small"></div>
                <p>Loading traders...</p>
              </div>

              <div v-else-if="filteredTraders.length === 0" class="empty-traders">
                <div class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10h16v9H4v-9Zm2-5h12l2 5H4l2-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  </svg>
                </div>
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
                      <span class="inline-icon tiny" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 4h3l1.5 4L8.5 9.5a14 14 0 0 0 6 6l1.5-2L20 15v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                        </svg>
                      </span>
                      {{ trader.contact_number }}
                    </div>
                  </div>
                  <div class="trader-card-action">
                    <span class="chat-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6h16v10H8l-4 4V6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                      </svg>
                    </span>
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
                  <span class="empty-msg-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6h16v10H8l-4 4V6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    </svg>
                  </span>
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
                        <span v-if="message.sender_id === currentUserId && message.is_read" class="read-receipt" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="m4.5 13 3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="m11.5 13 3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </span>
                      </div>
                      <button @click="toggleMessageOptions(message.id)" class="message-menu-btn">⋮</button>
                    </div>
                    <div v-if="showMessageOptions[message.id]" class="message-options">
                      <button @click="copyMessage(message.message_text)" class="option-btn">
                        <span class="inline-icon tiny" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="4" width="11" height="15" rx="2" stroke="currentColor" stroke-width="1.8"/>
                            <path d="M5 8V5a1 1 0 0 1 1-1h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                          </svg>
                        </span>
                        Copy
                      </button>
                      <button @click="openForwardModal(message)" class="option-btn">
                        <span class="inline-icon tiny" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12h12m0 0-4-4m4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </span>
                        Forward
                      </button>
                      <button v-if="message.sender_id === currentUserId" @click="deleteMessage(message.id)" class="option-btn danger">
                        <span class="inline-icon tiny" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 7h8m-7 0v11m6-11v11M6 7h12l-1 13H7L6 7Zm3-3h6l1 3H8l1-3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </span>
                        Delete
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
                    <span v-if="sending" class="spinner-send" aria-hidden="true"></span>
                    <span v-else class="inline-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12h12m0 0-4-4m4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
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
          <button @click="closeNewChatModal" class="btn-close" aria-label="Close">
            <span class="inline-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
          </button>
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
          <button @click="closeForwardModal" class="btn-close" aria-label="Close">
            <span class="inline-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
          </button>
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
      <span class="alert-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m6 12 4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
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
            message_text: `Forwarded: ${this.messageToForward.message_text}`
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
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.2), transparent 30%),
    radial-gradient(circle at right center, rgba(118, 75, 162, 0.16), transparent 28%),
    linear-gradient(135deg, #121428 0%, #1a1a2e 44%, #242442 100%);
}

.main-content {
  flex: 1;
  margin-left: 0;
  padding: 72px 20px 20px;
  display: flex;
  justify-content: center;
}

.chat-container {
  height: calc(100vh - 80px);
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(22, 33, 62, 0.98) 100%);
  border: 1px solid rgba(100, 150, 255, 0.22);
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.28);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.chat-header h1 {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #fff;
}

.chat-header p {
  margin: 0;
  color: rgba(214, 224, 255, 0.82);
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
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  background: rgba(12, 16, 33, 0.42);
}

.sidebar-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.btn-new-chat {
  background: rgba(100, 150, 255, 0.18);
  color: white;
  border: 1px solid rgba(100, 150, 255, 0.45);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-new-chat:hover {
  background: rgba(100, 150, 255, 0.26);
  transform: translateY(-1px);
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s;
  background: transparent;
  position: relative;
}

.conversation-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.conversation-item.active {
  background: rgba(100, 150, 255, 0.18);
  border-left: 3px solid rgba(175, 205, 255, 0.95);
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
  background: rgba(250, 112, 154, 0.18);
  transform: translateY(-50%) scale(1.1);
}

.conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(100, 150, 255, 0.2);
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
  color: #f4f7ff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-last-message {
  font-size: 13px;
  color: rgba(214, 224, 255, 0.7);
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
  color: rgba(214, 224, 255, 0.6);
  margin-bottom: 4px;
}

.unread-badge {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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
  background: rgba(11, 14, 28, 0.25);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.directory-header h2 {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #fff;
}

.directory-header p {
  margin: 0 0 15px 0;
  color: rgba(214, 224, 255, 0.76);
  font-size: 14px;
}

.search-input-main {
  width: 100%;
  padding: 12px 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.search-input-main:focus {
  border-color: rgba(102, 126, 234, 0.72);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
}

.traders-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  align-content: start;
  background: transparent;
}

.trader-card {
  background: linear-gradient(135deg, rgba(20, 25, 45, 0.95) 0%, rgba(18, 28, 50, 0.98) 100%);
  border: 1px solid rgba(100, 150, 255, 0.18);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.trader-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(100, 150, 255, 0.22);
  border-color: rgba(100, 150, 255, 0.38);
}

.trader-card-avatar {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(100, 150, 255, 0.2);
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
  color: #f4f7ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trader-card-owner {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: rgba(214, 224, 255, 0.76);
}

.trader-card-description {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: rgba(214, 224, 255, 0.68);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.trader-card-contact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #81c784;
  font-weight: 500;
}

.trader-card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-icon {
  width: 22px;
  height: 22px;
  color: rgba(175, 205, 255, 0.82);
  opacity: 0.5;
  transition: all 0.3s;
}

.chat-icon svg {
  width: 100%;
  height: 100%;
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
  color: rgba(214, 224, 255, 0.7);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: rgba(214, 224, 255, 0.6);
  margin-bottom: 20px;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-traders h3 {
  margin: 0 0 10px 0;
  color: #f4f7ff;
}

.empty-traders p {
  margin: 5px 0;
  color: rgba(214, 224, 255, 0.7);
}

.chat-messages-header {
  padding: 15px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
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
  background: rgba(100, 150, 255, 0.2);
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
  color: #fff;
}

.user-subtitle {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: rgba(214, 224, 255, 0.72);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 25px;
  background: rgba(11, 14, 28, 0.08);
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
  background: rgba(255, 255, 255, 0.08);
  color: #f4f7ff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
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
  background: rgba(255, 255, 255, 0.08);
  color: #f4f7ff;
  border-radius: 20px 20px 20px 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
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
  color: rgba(214, 224, 255, 0.72);
}

.message-own .message-time {
  color: rgba(255,255,255,0.75);
}

.read-receipt {
  width: 18px;
  height: 18px;
  display: inline-flex;
  color: rgba(255,255,255,0.9);
}

.read-receipt svg {
  width: 100%;
  height: 100%;
}

.message-menu-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255,255,255,0.1);
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
  background: rgba(26, 32, 56, 0.98);
  border: 1px solid rgba(255,255,255,0.12);
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
  color: #e8eeff;
  text-align: left;
  transition: background 0.2s;
}

.option-btn:hover {
  background: rgba(255,255,255,0.08);
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
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.message-form {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.message-input:focus {
  border-color: rgba(102, 126, 234, 0.72);
}

.btn-send {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(100, 150, 255, 0.45);
  background: rgba(100, 150, 255, 0.22);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-send:hover:not(:disabled) {
  background: rgba(100, 150, 255, 0.3);
  transform: translateY(-1px);
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
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.99) 100%);
  border: 1px solid rgba(100, 150, 255, 0.22);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #fff;
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
  background: rgba(255,255,255,0.12);
  color: #fff;
}

.modal-body {
  padding: 20px 25px;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  padding: 12px 18px;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 15px;
  outline: none;
  transition: border-color 0.3s;
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.search-input:focus {
  border-color: rgba(102, 126, 234, 0.72);
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
  background: rgba(255,255,255,0.08);
}

.trader-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 12px;
  overflow: hidden;
  background: rgba(100, 150, 255, 0.2);
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
  color: #fff;
  margin-bottom: 2px;
}

.trader-subtitle {
  font-size: 13px;
  color: rgba(214, 224, 255, 0.72);
}

/* Loading & Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(214, 224, 255, 0.7);
}

.spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(175, 205, 255, 0.2);
  border-top-color: rgba(175, 205, 255, 0.95);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: rgba(214, 224, 255, 0.7);
}

.empty-state p {
  margin-bottom: 15px;
}

.empty-messages {
  text-align: center;
  padding: 60px 40px;
  color: rgba(214, 224, 255, 0.7);
}

.empty-msg-icon {
  width: 48px;
  height: 48px;
  color: rgba(214, 224, 255, 0.6);
  display: inline-flex;
  margin-bottom: 16px;
}

.empty-msg-icon svg {
  width: 100%;
  height: 100%;
}

.empty-messages p {
  margin: 0;
  font-size: 15px;
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
}

.forward-preview p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: rgba(214, 224, 255, 0.72);
}

.preview-bubble {
  padding: 12px 15px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  border-left: 3px solid rgba(102, 126, 234, 0.72);
  color: #f4f7ff;
  line-height: 1.4;
}

.forward-instruction {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: rgba(214, 224, 255, 0.72);
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
  border: 1px solid rgba(255,255,255,0.12);
}

.conversation-item-modal:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(102, 126, 234, 0.72);
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
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.alert-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  flex-shrink: 0;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

.inline-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  flex-shrink: 0;
}

.inline-icon.tiny {
  width: 14px;
  height: 14px;
}

.inline-icon svg {
  width: 100%;
  height: 100%;
}

.spinner-send {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
