<template>
  <!-- Mobile Top Header -->
  <header class="mobile-header">
    <div class="header-left">
      <button @click="showMenu = !showMenu" class="menu-btn">
        <span class="menu-icon">☰</span>
      </button>
      <div class="brand-logo">
        <span class="brand-icon">👔</span>
        <span class="brand-name">Staff Portal</span>
      </div>
    </div>
  </header>

  <!-- Mobile Menu Overlay -->
  <div v-if="showMenu" class="menu-overlay" @click="showMenu = false">
    <div class="menu-content" @click.stop>
      <div class="menu-header">
        <div class="user-info">
          <div class="user-avatar">S</div>
          <div class="user-details">
            <h3>Staff Member</h3>
            <p>Staff Portal</p>
          </div>
        </div>
        <button class="menu-close" @click="showMenu = false">&times;</button>
      </div>
      <nav class="menu-nav">
        <router-link to="/staff" class="menu-item" @click="showMenu = false">
          <span class="menu-icon">🏠</span>
          <span class="menu-label">Home</span>
        </router-link>
        <router-link to="/staff/inventory" class="menu-item" @click="showMenu = false">
          <span class="menu-icon">📦</span>
          <span class="menu-label">Inventory</span>
        </router-link>
        <router-link to="/staff/add-cocolumber" class="menu-item" @click="showMenu = false">
          <span class="menu-icon">➕</span>
          <span class="menu-label">Add Product</span>
        </router-link>
        <router-link to="/staff/orders" class="menu-item" @click="showMenu = false">
          <span class="menu-icon">📋</span>
          <span class="menu-label">Orders</span>
        </router-link>
        <router-link to="/staff/paper-uploads" class="menu-item" @click="showMenu = false">
          <span class="menu-icon">📄</span>
          <span class="menu-label">Upload Papers</span>
        </router-link>
        <router-link to="/staff/camera-scanner" class="menu-item" @click="showMenu = false">
          <span class="menu-icon">📷</span>
          <span class="menu-label">Camera Scanner</span>
        </router-link>
        <button @click="logout" class="menu-item logout-item">
          <span class="menu-icon">🚪</span>
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
      showLogoutModal: false
    }
  },
  methods: {
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
  font-size: 1.5em;
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
  font-size: 1.5em;
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
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
  animation: slideInLeft 0.3s;
  overflow-y: auto;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  gap: 12px;
  flex: 1;
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
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-details h3 {
  margin: 0;
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-details p {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.8em;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.menu-close:active {
  color: rgba(255, 255, 255, 0.7);
}

.menu-nav {
  padding: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 15px;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  margin-bottom: 8px;
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

.menu-icon {
  font-size: 1.5em;
  min-width: 30px;
}

.menu-label {
  font-size: 1em;
  font-weight: 500;
}

.logout-item {
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
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.3em;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8em;
  color: #95a5a6;
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
  color: #666;
  font-size: 1em;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 12px 24px;
  background: #ecf0f1;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 1em;
}

.btn-cancel:active {
  background: #d5dbdb;
  transform: scale(0.98);
}

.btn-logout {
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 1em;
}

.btn-logout:active {
  background: #c0392b;
  transform: scale(0.98);
}
</style>
