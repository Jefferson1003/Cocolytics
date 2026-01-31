<template>
  <div class="admin-layout">
    <AdminSidebar />

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Welcome, {{ user?.name }}! You have full administrative access.</p>
      </div>

      <div class="stats-grid" v-if="dashboardData">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>{{ dashboardData.totalUsers }}</h3>
          <p>Total Users</p>
        </div>
      </div>
      <div class="stat-card" v-for="stat in dashboardData.usersByRole" :key="stat.role">
        <div class="stat-icon">
          {{ stat.role === 'admin' ? '🛡️' : stat.role === 'staff' ? '👔' : '👤' }}
        </div>
        <div class="stat-info">
          <h3>{{ stat.count }}</h3>
          <p>{{ stat.role.charAt(0).toUpperCase() + stat.role.slice(1) }}s</p>
        </div>
      </div>
    </div>

    <div class="dashboard-sections">
      <div class="section features-section">
        <h2>🔧 Admin Features</h2>
        <ul class="features-list" v-if="dashboardData">
          <li v-for="feature in dashboardData.adminFeatures" :key="feature">
            <span class="feature-icon">✅</span>
            {{ feature }}
          </li>
        </ul>
      </div>

      <div class="section users-section">
        <h2>👥 User Management</h2>
        <div class="users-table-container">
          <table class="users-table" v-if="users.length">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="role-badge" :class="u.role">{{ u.role }}</span>
                </td>
                <td>
                  <select 
                    v-model="u.role" 
                    @change="updateUserRole(u.id, u.role)"
                    class="role-select"
                    :disabled="u.id === user.id"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-data">Loading users...</p>
        </div>
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

    <div class="error-message" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import AdminSidebar from '../components/AdminSidebar.vue'

export default {
  name: 'AdminDashboard',
  components: {
    AdminSidebar
  },
  data() {
    return {
      user: null,
      dashboardData: null,
      users: [],
      error: ''
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    this.user = userData ? JSON.parse(userData) : null
    this.fetchDashboardData()
    this.fetchUsers()
  },
  methods: {
    async fetchDashboardData() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.dashboardData = response.data.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load dashboard data'
      }
    },
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = response.data.users
      } catch (err) {
        console.error('Failed to fetch users:', err)
      }
    },
    async updateUserRole(userId, newRole) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/role`, 
          { role: newRole },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to update user role'
        this.fetchUsers() // Refresh to revert changes
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background: #242442;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.sidebar.collapsed .sidebar-header {
  padding: 15px 10px;
  justify-content: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #4CAF50;
  flex: 1;
}

.sidebar-toggle {
  display: block;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s ease;
}

.sidebar-toggle:hover {
  color: #4CAF50;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.sidebar.collapsed .nav-item {
  padding: 15px 10px;
  justify-content: center;
  gap: 0;
}

.nav-icon {
  min-width: 24px;
  font-size: 1.2rem;
}

.nav-label {
  flex: 1;
}

.sidebar.collapsed .nav-label {
  display: none;
}

.nav-item:hover {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border-left-color: #4CAF50;
}

.sidebar.collapsed .nav-item:hover {
  border-left-color: transparent;
}

.nav-item.active {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border-left-color: #4CAF50;
}

.sidebar-footer {
  padding: 20px 0;
  border-top: 1px solid #333;
}

.sidebar.collapsed .sidebar-footer {
  padding: 10px 0;
}

.logout-btn {
  width: 90%;
  margin: 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #f44336;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.sidebar.collapsed .logout-btn {
  width: 60%;
  padding: 10px;
  gap: 0;
}

.logout-icon {
  min-width: 20px;
  font-size: 1rem;
}

.logout-label {
  flex: 1;
}

.sidebar.collapsed .logout-label {
  display: none;
}

.logout-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.dashboard-container {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}

.admin-layout .sidebar.collapsed ~ .dashboard-container {
  margin-left: 80px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #4CAF50;
  margin-bottom: 10px;
}

.dashboard-header p {
  color: #888;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #242442;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  font-size: 1.8rem;
  color: #fff;
  margin: 0;
}

.stat-info p {
  color: #888;
  margin: 0;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.section {
  background: #242442;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.section h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 12px 0;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ccc;
}

.features-list li:last-child {
  border-bottom: none;
}

.feature-icon {
  font-size: 1.2rem;
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #333;
}

.users-table th {
  color: #888;
  font-weight: 600;
}

.users-table td {
  color: #ccc;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.role-badge.staff {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

.role-badge.user {
  background: rgba(156, 39, 176, 0.2);
  color: #9C27B0;
}

.role-select {
  background: #1a1a2e;
  color: #fff;
  border: 1px solid #333;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.role-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.no-data {
  color: #888;
  text-align: center;
  padding: 20px;
}

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
  z-index: 2000;
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

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 200px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: block;
  }

  .dashboard-container {
    margin-left: 0;
    padding: 20px;
  }
  
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }
}
</style>
