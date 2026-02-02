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
      return this.$route.path === '/admin'
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
}

html, body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f7fa;
  color: #333;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  overflow: auto;
}

.main-content.no-nav {
  margin-top: 0;
}

.simple-footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  border-top: 2px solid #4CAF50;
}

.simple-footer p {
  margin: 0;
  font-size: 0.9rem;
}
</style>