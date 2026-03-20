<template>
  <!-- Mobile Top Header -->
  <header class="mobile-header">
    <div class="header-left">
      <button @click="toggleMenu" class="menu-btn">
        <span class="header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </button>
      <div class="brand-logo">
        <span class="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4h8l1 3-2.5 2 1.5 11h-8l1.5-11L7 7l1-3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="brand-name">Trader Portal</span>
      </div>
    </div>
  </header>

  <!-- Mobile Menu Overlay -->
  <div v-if="showMenu" class="menu-overlay" @click="showMenu = false">
    <div class="menu-content" @click.stop>
      <div class="menu-header">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Profile picture" class="avatar-image" />
            <span v-else>{{ userInitial }}</span>
          </div>
          <div class="user-details">
            <h3>{{ displayName }}</h3>
          </div>
        </div>
        <button class="menu-close" @click="showMenu = false" aria-label="Close menu">
          <span class="header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
        </button>
      </div>
      <nav class="menu-nav">
        <router-link to="/staff/profile" class="menu-item" @click="showMenu = false">
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="menu-label">My Profile</span>
        </router-link>
        <router-link to="/marketplace" class="menu-item" @click="showMenu = false">
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h16v9H4v-9Zm2-5h12l2 5H4l2-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="menu-label">Marketplace</span>
        </router-link>
        <router-link to="/operations" class="menu-item" @click="showMenu = false">
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="2"/>
              <path d="M19.4 15a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0-.1 1 7.8 7.8 0 0 0 .1 1l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="menu-label">Operations</span>
        </router-link>
        <router-link to="/orders/tracking" class="menu-item" @click="showMenu = false">
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8.5 12 4l8 4.5M4 8.5V17l8 4.5 8-4.5V8.5M12 12l8-3.5M12 12 4 8.5M12 12v9.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="menu-label">Order Tracking</span>
        </router-link>
        <router-link to="/cart" class="menu-item" @click="showMenu = false">
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h2l2 10h9l2-7H7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="10" cy="19" r="1.4" fill="currentColor"/>
              <circle cx="17" cy="19" r="1.4" fill="currentColor"/>
            </svg>
          </span>
          <span class="menu-label">Cart</span>
          <span v-if="cartCount > 0" class="menu-badge">{{ cartCount }}</span>
        </router-link>
        <router-link to="/chat" class="menu-item" @click="showMenu = false">
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16v10H8l-4 4V6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="menu-label">Trader Chat</span>
        </router-link>
        <button @click="logout" class="menu-item logout-item">
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4H5v16h5M14 8l5 4-5 4M19 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="menu-label">Logout</span>
        </button>
      </nav>
    </div>
  </div>

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
</template>

<script>
export default {
  name: 'StaffSidebar',
  data() {
    return {
      showMenu: false,
      showLogoutModal: false,
      displayName: 'Trader Member',
      avatarUrl: '',
      cartCount: 0
    }
  },
  computed: {
    userInitial() {
      return this.displayName ? this.displayName.charAt(0).toUpperCase() : 'T'
    }
  },
  mounted() {
    this.loadLoggedInUserName()
    this.refreshCartCount()
    window.addEventListener('storage', this.handleStorageChange)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
  },
  methods: {
    safeParseUser(rawUser) {
      if (!rawUser) return null
      try {
        return JSON.parse(rawUser)
      } catch (error) {
        console.warn('Invalid user data in localStorage:', error)
        return null
      }
    },
    extractUserName(user) {
      if (!user || typeof user !== 'object') return ''
      return (
        user.name ||
        user.staff_name ||
        user.full_name ||
        user.username ||
        ''
      )
    },
    extractProfileImage(profile) {
      if (!profile || typeof profile !== 'object') return ''
      return (
        profile.store_logo ||
        profile.profile_image ||
        profile.avatar ||
        profile.image ||
        ''
      )
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http')) return imagePath
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
      if (imagePath.startsWith('/')) return `${apiBaseUrl}${imagePath}`
      return `${apiBaseUrl}/uploads/${imagePath}`
    },
    async loadLoggedInUserName() {
      const user = this.safeParseUser(localStorage.getItem('user'))
      const localName = this.extractUserName(user)
      const localImage = this.extractProfileImage(user)
      if (localName) {
        this.displayName = localName
      }
      if (localImage) {
        this.avatarUrl = this.getImageUrl(localImage)
      }

      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${apiBaseUrl}/api/staff/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) return

        const profile = await response.json()
        const fetchedName = this.extractUserName(profile)
        const fetchedImage = this.extractProfileImage(profile)
        if (fetchedName) {
          this.displayName = fetchedName
        }
        if (fetchedImage) {
          this.avatarUrl = this.getImageUrl(fetchedImage)
        }
      } catch (error) {
        console.warn('Could not fetch staff profile name:', error)
      }
    },
    handleStorageChange(event) {
      if (event.key === 'user' || event.key === 'token') {
        this.loadLoggedInUserName()
      }
      if (event.key === 'cartItems') {
        this.refreshCartCount()
      }
    },
    toggleMenu() {
      this.showMenu = !this.showMenu
      if (this.showMenu) {
        this.refreshCartCount()
      }
    },
    refreshCartCount() {
      const rawCart = localStorage.getItem('cartItems')
      if (!rawCart) {
        this.cartCount = 0
        return
      }

      try {
        const items = JSON.parse(rawCart)
        if (!Array.isArray(items)) {
          this.cartCount = 0
          return
        }

        this.cartCount = items.reduce((sum, item) => {
          const quantity = Number(item?.quantity) || 0
          return sum + Math.max(quantity, 0)
        }, 0)
      } catch (error) {
        console.warn('Invalid cart data in localStorage:', error)
        this.cartCount = 0
      }
    },
    logout() {
      this.showLogoutModal = true
      this.showMenu = false
    },
    confirmLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
    cancelLogout() {
      this.showLogoutModal = false
    }
  }
}
</script>

<style scoped>
/* Mobile Header */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.header-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
}

.header-icon svg {
  width: 100%;
  height: 100%;
}

.menu-btn:active {
  background: rgba(255, 255, 255, 0.1);
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.brand-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
}

.brand-icon svg {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 1.2em;
  font-weight: 700;
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  z-index: 1001;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.menu-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  width: 85%;
  max-width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
  animation: slideInLeft 0.3s;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-details h3 {
  margin: 0;
  color: white;
  font-size: 1.02em;
  font-weight: 600;
  line-height: 1.2;
  white-space: normal;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: clip;
}

.menu-close {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 8px;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.menu-close:active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
  transform: scale(0.96);
}

.menu-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 8px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 15px;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s;
  background: none;
  border: none;
  width: 100%;
  font-family: inherit;
  font-size: 1em;
  cursor: pointer;
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.98);
}

.menu-item.router-link-active {
  background: rgba(100, 150, 255, 0.2);
  border: 1px solid rgba(100, 150, 255, 0.45);
}

.menu-icon {
  width: 22px;
  height: 22px;
  min-width: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.menu-icon svg {
  width: 100%;
  height: 100%;
}

.menu-label {
  font-size: 1em;
  font-weight: 500;
}

.menu-badge {
  margin-left: auto;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  font-size: 0.78em;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.logout-item {
  margin-top: auto;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.5);
}

.logout-item:active {
  background: rgba(231, 76, 60, 0.3);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(145deg, rgba(18, 47, 58, 0.98), rgba(22, 56, 68, 0.98));
  border: 1px solid rgba(76, 175, 80, 0.35);
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(76, 175, 80, 0.3);
}

.modal-header h2 {
  margin: 0;
  color: #eaf8f2;
  font-size: 1.3em;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8em;
  color: #c6dad4;
  cursor: pointer;
  transition: color 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:active {
  color: #e74c3c;
}

.modal-body {
  padding: 20px;
  color: #cfe3dd;
  font-weight: 500;
  font-size: 1em;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid rgba(76, 175, 80, 0.3);
  justify-content: flex-end;
}

.btn-cancel {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.12);
  color: #eaf8f2;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 1em;
}

.btn-cancel:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}

.btn-logout {
  padding: 12px 24px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: 1px solid rgba(255, 140, 120, 0.45);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 1em;
}

.btn-logout:active {
  background: linear-gradient(135deg, #f05454 0%, #d44232 100%);
  transform: scale(0.98);
}
</style>
