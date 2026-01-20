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
        <router-link v-if="user && (user.role === 'staff' || user.role === 'admin')" to="/staff">Staff Dashboard</router-link>
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
      user: null
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.isAuthenticated = false
      this.user = null
      this.$router.push('/login')
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
