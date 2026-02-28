<template>
  <div class="staff-layout">
    <StaffSidebar />
    <div class="communications-main">
      <div class="communications-container">
        <div class="header">
          <h1>📡 Communications & Insights</h1>
          <p>Manage messages, reports, and connections</p>
        </div>

        <!-- Tab Navigation -->
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="['tab-btn', { active: activeTab === tab.value }]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- Tab 1: Messages (Notifications) -->
        <div v-if="activeTab === 'messages'" class="tab-content">
          <NotificationsCenter />
        </div>

        <!-- Tab 2: Reports -->
        <div v-if="activeTab === 'reports'" class="tab-content">
          <div class="reports-section">
            <div class="filters-row">
              <select v-model="selectedPeriod" @change="filterReports" class="period-select">
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <button @click="printReport" class="print-btn">
                🖨️ Print Report
              </button>
            </div>

            <div v-if="reportsLoading" class="loading">
              <div class="spinner"></div>
              <p>Loading reports...</p>
            </div>

            <div v-else class="reports-grid">
              <div class="report-card">
                <div class="report-head">
                  <h3>Total Sales</h3>
                  <span class="report-chip">Live</span>
                </div>
                <div class="report-kpi">₱ {{ formatCurrency(filteredStats.revenue || 0) }}</div>
                <p class="report-meta">Revenue from cocolumber sales</p>
                <div class="report-foot">
                  <span>Items: {{ filteredStats.total_items || 0 }}</span>
                </div>
              </div>

              <div class="report-card">
                <div class="report-head">
                  <h3>Items Sold</h3>
                  <span class="report-chip">Active</span>
                </div>
                <div class="report-kpi">{{ filteredStats.total_items || 0 }} units</div>
                <p class="report-meta">Total cocolumber quantity sold</p>
                <div class="report-foot">
                  <span>Total Revenue: ₱{{ formatCurrency(filteredStats.revenue || 0) }}</span>
                </div>
              </div>

              <div class="report-card">
                <div class="report-head">
                  <h3>Orders</h3>
                  <span class="report-chip">Live</span>
                </div>
                <div class="report-kpi">{{ filteredStats.total_orders || 0 }} orders</div>
                <p class="report-meta">Total orders received</p>
                <div class="report-foot">
                  <span>Completed: {{ filteredStats.total_orders || 0 }}</span>
                </div>
              </div>

              <div class="report-card">
                <div class="report-head">
                  <h3>Rating</h3>
                  <span class="report-chip">{{ totalStats.avg_rating || 0 }}</span>
                </div>
                <div class="report-kpi">{{ totalStats.avg_rating || 0 }} ⭐</div>
                <p class="report-meta">Customer satisfaction score</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Chat -->
        <div v-if="activeTab === 'chat'" class="tab-content">
          <div class="chat-section">
            <div class="chat-layout">
              <!-- Conversations List -->
              <div class="conversations-sidebar">
                <div class="sidebar-header">
                  <h3>💬 Conversations</h3>
                  <button @click="showNewChatModal = true" class="btn-new-chat">➕</button>
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
                    @click="selectConversation(conv.id)"
                  >
                    <div class="conv-avatar">
                      <span>{{ getInitial(conv.participants?.[0]?.name) }}</span>
                    </div>
                    <div class="conv-info">
                      <div class="conv-name">{{ conv.participants?.[0]?.store_name || 'Unknown' }}</div>
                      <div class="conv-last-message">{{ conv.last_message || 'No messages' }}</div>
                    </div>
                    <div class="conv-meta">
                      <div class="conv-time">{{ formatTime(conv.last_message_time) }}</div>
                      <div v-if="conv.unread_count > 0" class="unread-badge">{{ conv.unread_count }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Chat Messages Area -->
              <div class="chat-area">
                <div v-if="!selectedConversationId" class="traders-directory">
                  <div class="directory-header">
                    <h2>👥 All Traders</h2>
                    <p>Click to start a conversation</p>
                    <input 
                      v-model="traderSearch" 
                      type="text" 
                      placeholder="🔍 Search traders..." 
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
                  </div>

                  <div v-else class="traders-grid">
                    <div 
                      v-for="trader in filteredTraders" 
                      :key="trader.id"
                      @click="startNewChat(trader.id)"
                      class="trader-card"
                    >
                      <div class="trader-card-avatar">
                        <span>{{ getInitial(trader.name) }}</span>
                      </div>
                      <div class="trader-card-info">
                        <h4>{{ trader.store_name || trader.name }}</h4>
                        <p>{{ trader.store_description || 'Coconut Products' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="chat-messages">
                  <div class="messages-header">
                    <h3>{{ selectedTraderName }}</h3>
                  </div>
                  <div class="messages-list">
                    <div v-if="chatMessages.length === 0" class="no-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                    <div v-for="msg in chatMessages" :key="msg.id" :class="['message', msg.is_sender ? 'sent' : 'received']">
                      <div class="message-content">{{ msg.message }}</div>
                      <div class="message-time">{{ formatTime(msg.created_at) }}</div>
                    </div>
                  </div>
                  <div class="message-input-area">
                    <input 
                      v-model="newMessage" 
                      @keyup.enter="sendMessage"
                      type="text" 
                      placeholder="Type your message..." 
                      class="message-input"
                    />
                    <button @click="sendMessage" class="btn-send">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Chat Modal -->
          <div v-if="showNewChatModal" class="modal-overlay" @click="showNewChatModal = false">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h2>Start New Chat</h2>
                <button class="modal-close" @click="showNewChatModal = false">&times;</button>
              </div>
              <div class="modal-body">
                <input 
                  v-model="newChatSearch" 
                  type="text" 
                  placeholder="Search traders..." 
                  class="form-input"
                />
                <div class="traders-list-modal">
                  <div 
                    v-for="trader in filteredNewChatTraders" 
                    :key="trader.id"
                    @click="confirmStartChat(trader.id)"
                    class="trader-item"
                  >
                    <span>{{ trader.store_name || trader.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'
import NotificationsCenter from '../components/NotificationsCenter.vue'

export default {
  name: 'Communications',
  components: {
    StaffSidebar,
    NotificationsCenter
  },
  data() {
    return {
      activeTab: 'messages',
      tabs: [
        { label: 'Messages', value: 'messages', icon: '💌' },
        { label: 'Reports', value: 'reports', icon: '📊' },
        { label: 'Chat', value: 'chat', icon: '💬' }
      ],
      // Reports
      selectedPeriod: 'month',
      totalStats: {},
      filteredStats: {},
      reportsLoading: false,
      // Chat
      conversations: [],
      selectedConversationId: null,
      selectedTraderName: '',
      chatMessages: [],
      newMessage: '',
      loadingConversations: false,
      loadingTraders: false,
      traders: [],
      traderSearch: '',
      newChatSearch: '',
      showNewChatModal: false,
      // Messages
      successMessage: '',
      errorMessage: '',
      token: null
    }
  },
  computed: {
    filteredTraders() {
      if (!this.traderSearch) return this.traders
      return this.traders.filter(t => 
        (t.store_name || t.name).toLowerCase().includes(this.traderSearch.toLowerCase())
      )
    },
    filteredNewChatTraders() {
      if (!this.newChatSearch) return this.traders
      return this.traders.filter(t => 
        (t.store_name || t.name).toLowerCase().includes(this.newChatSearch.toLowerCase())
      )
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    this.fetchReports()
    this.fetchConversations()
    this.fetchTraders()
  },
  methods: {
    // Reports Methods
    async fetchReports() {
      this.reportsLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/reports`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        const data = await response.json()
        this.totalStats = data.total || {}
        this.filterReports()
      } catch (error) {
        console.error('Error:', error)
        this.errorMessage = 'Failed to load reports'
      } finally {
        this.reportsLoading = false
      }
    },
    filterReports() {
      this.filteredStats = this.totalStats
    },
    printReport() {
      window.print()
    },
    // Chat Methods
    async fetchConversations() {
      this.loadingConversations = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.conversations = await response.json()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loadingConversations = false
      }
    },
    async fetchTraders() {
      this.loadingTraders = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sellers`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.traders = await response.json()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loadingTraders = false
      }
    },
    selectConversation(convId) {
      this.selectedConversationId = convId
      const conv = this.conversations.find(c => c.id === convId)
      if (conv) {
        this.selectedTraderName = conv.participants?.[0]?.store_name || 'Unknown'
        this.fetchChatMessages(convId)
      }
    },
    async fetchChatMessages(convId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${convId}/messages`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.chatMessages = await response.json()
      } catch (error) {
        console.error('Error:', error)
      }
    },
    async startNewChat(traderId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ trader_id: traderId })
        })
        if (!response.ok) throw new Error('Failed')
        const conv = await response.json()
        this.showNewChatModal = false
        this.selectConversation(conv.id)
        this.fetchConversations()
      } catch (error) {
        this.errorMessage = 'Failed to start chat'
      }
    },
    async confirmStartChat(traderId) {
      await this.startNewChat(traderId)
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.selectedConversationId) return
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            conversation_id: this.selectedConversationId,
            message: this.newMessage
          })
        })
        if (!response.ok) throw new Error('Failed')
        this.newMessage = ''
        this.fetchChatMessages(this.selectedConversationId)
      } catch (error) {
        this.errorMessage = 'Failed to send message'
      }
    },
    // Utilities
    formatCurrency(value) {
      return parseFloat(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })
    },
    formatTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    },
    getInitial(name) {
      return name ? name.charAt(0).toUpperCase() : '?'
    }
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 70px;
}

.communications-main {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.communications-container {
  max-width: 100%;
}

.header {
  margin-bottom: 24px;
  text-align: center;
}

.header h1 {
  font-size: 2.5em;
  color: white;
  margin-bottom: 8px;
  font-weight: 700;
}

.header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1em;
}

/* Tab Navigation */
.tabs-header {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.tab-btn.active {
  background: white;
  color: #667eea;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Reports Styles */
.reports-section {
  background: transparent;
}

.filters-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.period-select,
.search-input-main {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
}

.period-select:focus,
.search-input-main:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.print-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.report-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}

.report-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.report-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.report-head h3 {
  margin: 0;
  color: white;
  font-size: 1.05em;
}

.report-chip {
  padding: 4px 12px;
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
}

.report-kpi {
  font-size: 2em;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.report-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  margin: 0 0 12px 0;
}

.report-foot {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.5);
}

/* Chat Styles */
.chat-section {
  background: transparent;
}

.chat-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  height: 600px;
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.conversations-sidebar {
  background: rgba(0, 0, 0, 0.2);
  border-right: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  color: white;
  font-size: 1em;
}

.btn-new-chat {
  padding: 6px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1em;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 10px;
  align-items: center;
}

.conversation-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.conversation-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-left: 3px solid #667eea;
}

.conv-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-name {
  color: white;
  font-weight: 600;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-last-message {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-meta {
  flex-shrink: 0;
  text-align: right;
}

.conv-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75em;
}

.unread-badge {
  background: #ff6b6b;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75em;
  margin-top: 4px;
  font-weight: 600;
}

.chat-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.traders-directory {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
}

.directory-header {
  margin-bottom: 24px;
}

.directory-header h2 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 1.3em;
}

.directory-header p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 12px 0;
}

.traders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.trader-card {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.trader-card:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.trader-card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.trader-card-info h4 {
  margin: 0;
  color: white;
  font-size: 0.9em;
}

.trader-card-info p {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8em;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-header {
  padding: 16px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.messages-header h3 {
  margin: 0;
  color: white;
  font-size: 1.05em;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  align-items: flex-start;
}

.message.sent {
  align-self: flex-end;
  align-items: flex-end;
}

.message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  word-break: break-word;
}

.message.received .message-content {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.message-time {
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.message-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.message-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.95em;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.btn-send {
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
}

.btn-send:hover {
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: #242442;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1em;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  margin-bottom: 12px;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.traders-list-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.trader-item {
  padding: 10px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.trader-item:hover {
  background: rgba(102, 126, 234, 0.2);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
  font-weight: 600;
}

.alert {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  animation: slideDown 0.3s;
  max-width: 400px;
}

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.alert-success {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.alert-error {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

@media (max-width: 768px) {
  .chat-layout {
    grid-template-columns: 1fr;
    height: auto;
    max-height: 600px;
  }

  .conversations-sidebar {
    display: none;
  }

  .traders-grid {
    grid-template-columns: 1fr;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 0.9em;
  }
}
</style>
