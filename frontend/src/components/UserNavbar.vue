<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/">🌴 Cocolytics</router-link>
    </div>
    <div class="nav-links">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/cart" class="cart-link">🛒 Cart</router-link>
    </div>
    <div class="nav-actions">
      <button v-if="deferredPrompt" @click="installApp" class="install-btn">
        📥 Install App
      </button>
      <span class="user-name" v-if="user">👤 {{ user.name }}</span>
      <button @click="logout" class="logout-btn">Logout</button>
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
  </nav>
</template>

<script>
export default {
  name: 'UserNavbar',
  props: {
    deferredPrompt: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      user: null,
      showLogoutModal: false
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    this.user = userData ? JSON.parse(userData) : null
  },
  methods: {
    installApp() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt()
        this.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted installation')
          }
          this.deferredPrompt = null
        })
      }
    },
    logout() {
      this.showLogoutModal = true
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
.navbar {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-brand a {
  font-size: 1.5em;
  font-weight: 700;
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.nav-brand a:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 30px;
  flex: 1;
  margin-left: 50px;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.cart-link {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255,255,255,0.06);
  padding: 6px 10px;
  border-radius: 6px;
}

.nav-links a:hover {
  color: white;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.install-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.install-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.user-name {
  font-weight: 500;
  white-space: nowrap;
  color: #81C784;
}

.logout-btn {
  background: rgba(231, 76, 60, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8em;
  color: #95a5a6;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 20px 25px;
  color: #666;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  background: #ecf0f1;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #d5dbdb;
}

.btn-logout {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    height: auto;
    gap: 15px;
    padding: 15px;
  }

  .nav-links {
    margin-left: 0;
    gap: 15px;
  }

  .nav-actions {
    gap: 10px;
  }
}
</style>
