<template>
  <div id="app">
    <UserNavbar
      v-if="showUserNavbar"
      :deferredPrompt="deferredPrompt"
    />

    <main class="main-content" :class="{ 'no-nav': !isAuthenticated }">
      <router-view />
    </main>

    <footer class="simple-footer" v-if="isAuthenticated">
      <p>&copy; 2026 Cocolytics. All rights reserved.</p>
    </footer>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-notification"
        :class="toast.type"
        @click="dismissToast(toast.id)"
      >
        <div class="toast-icon">{{ toast.icon }}</div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click.stop="dismissToast(toast.id)">&times;</button>
      </div>
    </div>

  </div>
</template>

<script>
import UserNavbar from './components/UserNavbar.vue'

export default {
  name: 'App',
  components: {
    UserNavbar
  },
  data() {
    return {
      deferredPrompt: null,
      isAuthenticated: false,
      user: null,
      toasts: [],
      lastNotificationCheck: null,
      notificationCheckInterval: null
    }
  },
  computed: {
    showUserNavbar() {
      return this.isAuthenticated && this.user?.role === 'user'
    },
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    },
    isStaffRoute() {
      return this.$route.path.startsWith('/staff')
    },
    isLoginPage() {
      return this.$route.path === '/login'
    },
    apiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api`
        : '/api';
    }
  },
  created() {
    this.checkAuth()
    this.$router.afterEach(() => {
      this.checkAuth()
    })
  },
  mounted() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      console.log('App is installable!')
    })

    window.addEventListener('appinstalled', () => {
      console.log('App was installed successfully!')
      this.deferredPrompt = null
    })

    // Start checking for new notifications if authenticated
    if (this.isAuthenticated) {
      this.startNotificationPolling()
    }
  },
  beforeUnmount() {
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval)
    }
  },
  watch: {
    isAuthenticated(newVal) {
      if (newVal) {
        this.startNotificationPolling()
      } else {
        if (this.notificationCheckInterval) {
          clearInterval(this.notificationCheckInterval)
        }
      }
    }
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      this.isAuthenticated = !!token
      this.user = userData ? JSON.parse(userData) : null
    },
    startNotificationPolling() {
      // Check immediately
      this.checkNewNotifications()
      
      // Then check every 10 seconds for new notifications
      this.notificationCheckInterval = setInterval(() => {
        this.checkNewNotifications()
      }, 10000)
    },
    async checkNewNotifications() {
      if (!this.isAuthenticated) return

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(
          `${this.apiBaseUrl}/notifications?limit=5&offset=0`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
        
        if (!response.ok) return
        
        const data = await response.json()
        const notifications = data.data || []

        // Filter for new MESSAGE notifications
        const newMessages = notifications.filter(notif => {
          const notifTime = new Date(notif.created_at).getTime()
          return notif.alert_type === 'MESSAGE' && 
                 !notif.is_read &&
                 (!this.lastNotificationCheck || notifTime > this.lastNotificationCheck)
        })

        // Show toasts for new messages
        newMessages.forEach(notif => {
          this.showToast({
            title: notif.title,
            message: notif.message,
            type: 'message',
            icon: '💬'
          })
        })

        // Update last check timestamp
        if (notifications.length > 0) {
          const latestTime = Math.max(...notifications.map(n => new Date(n.created_at).getTime()))
          if (!this.lastNotificationCheck || latestTime > this.lastNotificationCheck) {
            this.lastNotificationCheck = latestTime
          }
        }
      } catch (error) {
        console.error('Error checking notifications:', error)
      }
    },
    showToast({ title, message, type = 'info', icon = '🔔', duration = 5000 }) {
      const id = Date.now() + Math.random()
      const toast = { id, title, message, type, icon }
      this.toasts.push(toast)

      // Auto-dismiss after duration
      setTimeout(() => {
        this.dismissToast(id)
      }, duration)
    },
    dismissToast(id) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  color: #333;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  /* Mobile optimization */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  /* Hide scrollbar but keep functionality */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
  background: transparent;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.main-content.no-nav {
  margin-top: 0;
}

.simple-footer {
  background: rgba(26, 26, 46, 0.95);
  color: white;
  text-align: center;
  padding: 16px;
  border-top: 1px solid rgba(76, 175, 80, 0.3);
  backdrop-filter: blur(10px);
}

.simple-footer p {
  margin: 0;
  font-size: 0.85em;
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

/* Prevent horizontal scroll */
body {
  overflow-x: hidden;
  position: relative;
}

/* Smooth transitions */
* {
  transition-property: background-color, color, border-color, opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
}

/* Touch-friendly buttons */
button, a, input, textarea, select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Fix for iOS input zoom */
input, textarea, select {
  font-size: 16px;
}

/* Hide all scrollbars globally but keep scroll functionality */
* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

*::-webkit-scrollbar {
  display: none;
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  width: calc(100% - 40px);
}

.toast-notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.toast-notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

.toast-notification.message {
  border-left: 4px solid #4CAF50;
}

.toast-notification.info {
  border-left: 4px solid #2196F3;
}

.toast-notification.warning {
  border-left: 4px solid #FF9800;
}

.toast-notification.error {
  border-left: 4px solid #F44336;
}

.toast-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
}

.toast-message {
  color: #666;
  font-size: 13px;
  word-wrap: break-word;
}

.toast-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  line-height: 1;
}

.toast-close:hover {
  color: #333;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 60px;
    right: 10px;
    left: 10px;
    max-width: none;
    width: calc(100% - 20px);
  }
  
  .toast-notification {
    padding: 12px;
  }
  
  .toast-title {
    font-size: 13px;
  }
  
  .toast-message {
    font-size: 12px;
  }
}
</style>