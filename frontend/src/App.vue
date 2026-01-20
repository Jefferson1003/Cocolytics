<template>
  <div id="app">
    <nav class="navbar" v-if="isAuthenticated">
      <div class="nav-brand">
        <router-link to="/">🥥 Cocolytics</router-link>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
        <router-link v-if="user && user.role === 'admin'" to="/admin">Admin Dashboard</router-link>
        <router-link v-if="user && (user.role === 'staff' || user.role === 'admin')" to="/staff">Cocolumber Producer</router-link>
      </div>
      <div class="nav-actions">
        <button v-if="deferredPrompt" @click="installApp" class="install-btn">
          📥 Install App
        </button>
        <span class="user-name" v-if="user">👤 {{ user.name }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>
    
    <main class="main-content" :class="{ 'no-nav': !isAuthenticated }">
      <router-view />
    </main>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="cancelLogout">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Confirm Logout</h2>
          <button class="modal-close" @click="cancelLogout">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to log out?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="cancelLogout">Cancel</button>
          <button class="btn-logout" @click="confirmLogout">Logout</button>
        </div>
      </div>
    </div>
    
    <footer class="footer" v-if="isAuthenticated">
      <p>&copy; 2026 Cocolytics. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      deferredPrompt: null,
      isAuthenticated: false,
      user: null,
      showLogoutModal: false
    }
  },
  created() {
    this.checkAuth()
    // Watch for route changes to update auth state
    this.$router.afterEach(() => {
      this.checkAuth()
    })
  },
  mounted() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      this.deferredPrompt = e
      console.log('App is installable!')
    })

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('App was installed successfully!')
      this.deferredPrompt = null
    })
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      this.isAuthenticated = !!token
      this.user = userData ? JSON.parse(userData) : null
    },
    logout() {
      this.showLogoutModal = true
    },
    confirmLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.isAuthenticated = false
      this.user = null
      this.showLogoutModal = false
      this.$router.push('/login')
    },
    cancelLogout() {
      this.showLogoutModal = false
    },
    async installApp() {
      if (!this.deferredPrompt) return
      
      // Show the install prompt
      this.deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      
      // Clear the deferredPrompt
      this.deferredPrompt = null
    }
  }
}
</script>
<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.3rem;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.modal-close:hover {
  transform: scale(1.2);
}

.modal-body {
  padding: 2rem;
  text-align: center;
}

.modal-body p {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.btn-cancel, .btn-logout {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
}

.btn-cancel:hover {
  background-color: #d0d0d0;
}

.btn-logout {
  background-color: #ff6b6b;
  color: white;
}

.btn-logout:hover {
  background-color: #ff5252;
  transform: scale(1.05);
}
</style>