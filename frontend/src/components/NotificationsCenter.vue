<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h2>🔔 Notifications Center</h2>
      <div class="header-controls">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search notifications..."
            @input="filterNotifications"
          >
        </div>
        <div class="action-buttons">
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead" 
            class="btn btn-primary"
            :disabled="isLoading"
          >
            Mark All as Read
          </button>
          <button 
            @click="refreshNotifications" 
            class="btn btn-secondary"
            :disabled="isLoading"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Unread Count Badge -->
    <div v-if="unreadCount > 0" class="unread-badge">
      {{ unreadCount }} unread notification{{ unreadCount !== 1 ? 's' : '' }}
    </div>

    <!-- Notification Preferences Card -->
    <div class="preferences-card">
      <h3>📋 Notification Preferences</h3>
      <div class="preferences-grid">
        <label class="preference-item">
          <input v-model="preferences.LOW_STOCK_ENABLED" type="checkbox" @change="updatePreferences">
          <span>Low Stock Alerts</span>
        </label>
        <label class="preference-item">
          <input v-model="preferences.DRYING_DELAY_ENABLED" type="checkbox" @change="updatePreferences">
          <span>Drying Delay Alerts</span>
        </label>
        <label class="preference-item">
          <input v-model="preferences.DAILY_SUMMARY_ENABLED" type="checkbox" @change="updatePreferences">
          <span>Daily Summary</span>
        </label>
        <label class="preference-item">
          <input v-model="preferences.ORDER_UPDATE_ENABLED" type="checkbox" @change="updatePreferences">
          <span>Order Updates</span>
        </label>
      </div>
      <div class="summary-time">
        <label>Daily Summary Time:</label>
        <input v-model="preferences.summary_time" type="time" @change="updatePreferences">
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        v-for="tab in filterTabs" 
        :key="tab.value"
        @click="activeFilter = tab.value"
        :class="['tab-btn', { active: activeFilter === tab.value }]"
      >
        {{ tab.label }} {{ tab.value !== 'all' && getCountByType(tab.value) > 0 ? `(${getCountByType(tab.value)})` : '' }}
      </button>
    </div>

    <!-- Notifications List -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading notifications...</p>
    </div>

    <div v-else-if="filteredNotifications.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>No notifications found</p>
    </div>

    <div v-else class="notifications-list">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        :class="['notification-item', notification.severity, { unread: !notification.is_read }]"
      >
        <div class="notification-content">
          <div class="notification-header">
            <h4>{{ notification.title }}</h4>
            <span class="alert-type">{{ formatAlertType(notification.alert_type) }}</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div class="notification-meta">
            <span class="timestamp">{{ formatDate(notification.created_at) }}</span>
            <span v-if="notification.role_target !== 'all'" class="role-badge">
              {{ notification.role_target }}
            </span>
          </div>
        </div>
        <div class="notification-actions">
          <button 
            v-if="!notification.is_read"
            @click="markAsRead(notification.id)"
            class="action-btn read-btn"
            title="Mark as read"
          >
            ✓
          </button>
          <button 
            @click="deleteNotification(notification.id)"
            class="action-btn delete-btn"
            title="Delete notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalNotifications > limit" class="pagination">
      <button 
        @click="previousPage" 
        :disabled="offset === 0 || isLoading"
        class="btn btn-sm"
      >
        ← Previous
      </button>
      <span class="page-info">
        Page {{ Math.floor(offset / limit) + 1 }} of {{ Math.ceil(totalNotifications / limit) }}
      </span>
      <button 
        @click="nextPage" 
        :disabled="offset + limit >= totalNotifications || isLoading"
        class="btn btn-sm"
      >
        Next →
      </button>
    </div>

    <!-- Admin Controls -->
    <div v-if="userRole === 'admin'" class="admin-controls">
      <h3>⚙️ Admin Controls</h3>
      <div class="control-buttons">
        <button @click="triggerAlertChecks" class="btn btn-warning" :disabled="isLoading">
          🔍 Trigger Alert Checks
        </button>
        <button @click="generateDailySummaries" class="btn btn-warning" :disabled="isLoading">
          📊 Generate Daily Summaries
        </button>
        <button @click="sendTestNotification" class="btn btn-info" :disabled="isLoading">
          📬 Send Test Notification
        </button>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="alert alert-success">
      ✓ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-error">
      ✕ {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationsCenter',
  data() {
    return {
      notifications: [],
      filteredNotifications: [],
      preferences: {
        LOW_STOCK_ENABLED: true,
        DRYING_DELAY_ENABLED: true,
        DAILY_SUMMARY_ENABLED: true,
        ORDER_UPDATE_ENABLED: true,
        summary_time: '09:00:00'
      },
      isLoading: false,
      searchQuery: '',
      activeFilter: 'all',
      offset: 0,
      limit: 20,
      totalNotifications: 0,
      unreadCount: 0,
      successMessage: '',
      errorMessage: '',
      userRole: 'user',
      filterTabs: [
        { label: 'All', value: 'all' },
        { label: '⚠️ Low Stock', value: 'LOW_STOCK' },
        { label: '⏱️ Drying Delays', value: 'DRYING_DELAY' },
        { label: '📋 Summaries', value: 'DAILY_SUMMARY' },
        { label: '📦 Orders', value: 'ORDER_UPDATE' },
        { label: '🔴 Unread', value: 'unread' }
      ]
    };
  },
  computed: {
    apiBaseUrl() {
      return process.env.VUE_APP_API_URL || 'http://localhost:3000/api';
    }
  },
  mounted() {
    this.loadNotifications();
    this.loadPreferences();
    this.getUserRole();
    // Refresh notifications every 30 seconds
    setInterval(() => this.loadNotifications(), 30000);
  },
  methods: {
    async getUserRole() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        this.userRole = data.user?.role || 'user';
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    },
    async loadNotifications() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${this.apiBaseUrl}/notifications?limit=${this.limit}&offset=${this.offset}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await response.json();
        this.notifications = data.data || [];
        this.totalNotifications = data.total || 0;
        this.filterNotifications();
        await this.loadUnreadCount();
      } catch (error) {
        console.error('Error loading notifications:', error);
        this.errorMessage = 'Failed to load notifications';
      } finally {
        this.isLoading = false;
      }
    },
    async loadUnreadCount() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.apiBaseUrl}/notifications/unread/count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        this.unreadCount = data.unreadCount || 0;
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    },
    async loadPreferences() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.apiBaseUrl}/notifications/preferences`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        this.preferences = data.data || this.preferences;
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    },
    filterNotifications() {
      let filtered = this.notifications;

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(n => 
          n.title.toLowerCase().includes(query) || 
          n.message.toLowerCase().includes(query)
        );
      }

      // Filter by type
      if (this.activeFilter === 'unread') {
        filtered = filtered.filter(n => !n.is_read);
      } else if (this.activeFilter !== 'all') {
        filtered = filtered.filter(n => n.alert_type === this.activeFilter);
      }

      this.filteredNotifications = filtered;
    },
    getCountByType(type) {
      return this.notifications.filter(n => n.alert_type === type).length;
    },
    async markAsRead(notificationId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.apiBaseUrl}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.successMessage = 'Notification marked as read';
        this.loadNotifications();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error marking as read:', error);
        this.errorMessage = 'Failed to mark notification as read';
      }
    },
    async markAllAsRead() {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.apiBaseUrl}/notifications/mark-all/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.successMessage = 'All notifications marked as read';
        this.loadNotifications();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error marking all as read:', error);
        this.errorMessage = 'Failed to mark all as read';
      }
    },
    async deleteNotification(notificationId) {
      if (!confirm('Delete this notification?')) return;
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.apiBaseUrl}/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.successMessage = 'Notification deleted';
        this.loadNotifications();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error deleting notification:', error);
        this.errorMessage = 'Failed to delete notification';
      }
    },
    async updatePreferences() {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.apiBaseUrl}/notifications/preferences`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.preferences)
        });
        this.successMessage = 'Preferences updated';
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error updating preferences:', error);
        this.errorMessage = 'Failed to update preferences';
      }
    },
    async triggerAlertChecks() {
      if (!confirm('Run alert checks now?')) return;
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.apiBaseUrl}/notifications/trigger-checks`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.successMessage = 'Alert checks triggered';
        this.loadNotifications();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error triggering checks:', error);
        this.errorMessage = 'Failed to trigger checks';
      }
    },
    async generateDailySummaries() {
      if (!confirm('Generate daily summaries now?')) return;
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.apiBaseUrl}/notifications/generate-summaries`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.successMessage = 'Daily summaries generated';
        this.loadNotifications();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error generating summaries:', error);
        this.errorMessage = 'Failed to generate summaries';
      }
    },
    async sendTestNotification() {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.apiBaseUrl}/notifications/test`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            alert_type: 'SYSTEM',
            title: '🧪 Test Notification',
            message: 'This is a test notification from the notification system.'
          })
        });
        this.successMessage = 'Test notification sent';
        this.loadNotifications();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error sending test notification:', error);
        this.errorMessage = 'Failed to send test notification';
      }
    },
    refreshNotifications() {
      this.loadNotifications();
    },
    previousPage() {
      this.offset = Math.max(0, this.offset - this.limit);
      this.loadNotifications();
    },
    nextPage() {
      if (this.offset + this.limit < this.totalNotifications) {
        this.offset += this.limit;
        this.loadNotifications();
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    },
    formatAlertType(type) {
      const typeMap = {
        'LOW_STOCK': '📦 Low Stock',
        'DRYING_DELAY': '⏱️ Drying Delay',
        'DAILY_SUMMARY': '📋 Summary',
        'ORDER_UPDATE': '📦 Order',
        'SYSTEM': '⚙️ System'
      };
      return typeMap[type] || type;
    }
  }
};
</script>

<style scoped>
.notifications-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.notifications-header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.header-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #2196F3;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #0b7dda;
  transform: translateY(-2px);
}

.btn-warning {
  background-color: #ff9800;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e68900;
}

.btn-info {
  background-color: #00bcd4;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #0097a7;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}

.unread-badge {
  background-color: #ff5252;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 14px;
}

.preferences-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.preferences-card h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.preference-item:hover {
  transform: translateX(5px);
}

.preference-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.summary-time {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-time input {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.summary-time input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 15px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  color: #666;
}

.tab-btn:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.tab-btn.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
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
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border-radius: 8px;
  background: white;
  border-left: 5px solid #ccc;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.notification-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.notification-item.critical {
  border-left-color: #ff5252;
  background-color: #fff3e0;
}

.notification-item.warning {
  border-left-color: #ff9800;
  background-color: #fff8e1;
}

.notification-item.info {
  border-left-color: #2196F3;
  background-color: #e3f2fd;
}

.notification-item.unread {
  background-color: #f5f5f5;
  font-weight: 500;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;
}

.notification-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.alert-type {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.notification-message {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.timestamp {
  display: flex;
  align-items: center;
}

.role-badge {
  background-color: #9c27b0;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.read-btn {
  background-color: #4CAF50;
  color: white;
}

.read-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: #ff5252;
  color: white;
}

.delete-btn:hover {
  background-color: #ff1744;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 25px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.page-info {
  color: #666;
  font-weight: 500;
}

.admin-controls {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 25px;
}

.admin-controls h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.alert {
  padding: 15px 20px;
  border-radius: 6px;
  margin-top: 20px;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.alert-success {
  background-color: #c8e6c9;
  color: #2e7d32;
  border-left: 4px solid #4CAF50;
}

.alert-error {
  background-color: #ffcdd2;
  color: #c62828;
  border-left: 4px solid #ff5252;
}

@media (max-width: 768px) {
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-controls {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons .btn {
    flex: 1;
  }

  .notification-item {
    flex-direction: column;
  }

  .notification-actions {
    margin-left: 0;
    margin-top: 10px;
  }

  .preferences-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    justify-content: flex-start;
  }

  .control-buttons {
    flex-direction: column;
  }

  .control-buttons .btn {
    width: 100%;
  }
}
</style>
