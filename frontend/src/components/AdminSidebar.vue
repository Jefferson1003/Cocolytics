<template>
  <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
    <div class="sidebar-header">
      <h2 v-show="sidebarOpen">👨‍💼 Admin</h2>
      <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen" title="Toggle sidebar">
        {{ sidebarOpen ? '◄' : '►' }}
      </button>
    </div>
    <nav class="sidebar-nav">
      <router-link to="/admin" class="nav-item" :class="{ active: isActive('/admin') }" title="Dashboard">
        <span class="nav-icon">📊</span>
        <span class="nav-label" v-show="sidebarOpen">Dashboard</span>
      </router-link>
      <router-link to="/admin/users" class="nav-item" :class="{ active: isActive('/admin/users') }" title="Manage Users">
        <span class="nav-icon">👥</span>
        <span class="nav-label" v-show="sidebarOpen">Manage Users</span>
      </router-link>
      <router-link to="/admin/features" class="nav-item" :class="{ active: isActive('/admin/features') }" title="Admin Features">
        <span class="nav-icon">🔧</span>
        <span class="nav-label" v-show="sidebarOpen">Features</span>
      </router-link>
      <router-link to="/admin/paper-approvals" class="nav-item" :class="{ active: isActive('/admin/paper-approvals') }" title="Paper Approvals">
        <span class="nav-icon">📄</span>
        <span class="nav-label" v-show="sidebarOpen">Paper Approvals</span>
      </router-link>
      <a href="#settings" class="nav-item" title="Settings">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label" v-show="sidebarOpen">Settings</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <button @click="logout" class="logout-btn" title="Logout">
        <span class="logout-icon">🚪</span>
        <span class="logout-label" v-show="sidebarOpen">Logout</span>
      </button>
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
  </aside>
</template>

<script>
export default {
  name: 'AdminSidebar',
  data() {
    return {
      sidebarOpen: true,
      showLogoutModal: false
    }
  },
  methods: {
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
    },
    isActive(path) {
      return this.$route.path === path
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e1e3f 0%, #2a2a4a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
  border-right: 1px solid rgba(76, 175, 80, 0.3);
}

.sidebar.collapsed {
  width: 90px;
}

.sidebar-header {
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
  gap: 12px;
  background: rgba(76, 175, 80, 0.05);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.6em;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #4CAF50;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2em;
  padding: 5px 10px;
  transition: transform 0.3s;
}

.sidebar-toggle:hover {
  transform: scale(1.1);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  margin: 0 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 10px;
  font-size: 1.05em;
  font-weight: 500;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  background: rgba(76, 175, 80, 0.15);
  color: #fff;
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(76, 175, 80, 0.25);
  color: #fff;
  border-left-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.nav-icon {
  font-size: 1.5em;
  min-width: 28px;
}

.nav-label {
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #ff4757 0%, #e84118 100%);
  border: none;
  color: white;
  padding: 14px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1.05em;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 71, 87, 0.4);
  background: linear-gradient(135deg, #ff6348 0%, #ff4757 100%);
}

.logout-icon {
  font-size: 1.3em;
  min-width: 28px;
}

.logout-label {
  white-space: nowrap;
}

/* Modal Overlay */
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
  z-index: 1001;
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
  .sidebar {
    width: 200px;
  }

  .sidebar.collapsed {
    width: 60px;
  }
}
</style>
