<template>
  <div id="app">
    <UserNavbar
      v-if="isAuthenticated && !isAdminRoute && !isStaffRoute"
      :deferredPrompt="deferredPrompt"
    />

    <main class="main-content" :class="{ 'no-nav': !isAuthenticated }">
      <router-view />
    </main>

    <footer class="simple-footer" v-if="isAuthenticated">
      <p>&copy; 2026 Cocolytics. All rights reserved.</p>
    </footer>
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
      user: null
    }
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    },
    isStaffRoute() {
      return this.$route.path.startsWith('/staff')
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
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      this.isAuthenticated = !!token
      this.user = userData ? JSON.parse(userData) : null
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
</style>