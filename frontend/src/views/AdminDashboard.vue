<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>🛡️ Admin</h2>
        <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
          {{ sidebarOpen ? '✕' : '☰' }}
        </button>
      </div>
      <nav class="sidebar-nav">
        <a href="#overview" @click="activeSection = 'overview'" :class="{ active: activeSection === 'overview'}" class="nav-item">
          📊 Overview
        </a>
        <a href="#users" @click="activeSection = 'users'" :class="{ active: activeSection === 'users'}" class="nav-item">
          👥 User Management
        </a>
        <a href="#features" @click="activeSection = 'features'" :class="{ active: activeSection === 'features'}" class="nav-item">
          🔧 Features
        </a>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="nav-item">🏠 Back to Home</router-link>
      </div>
    </aside>

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

    <div class="error-message" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      user: null,
      dashboardData: null,
      users: [],
      error: '',
      sidebarOpen: true,
      activeSection: 'overview'
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
        const response = await axios.get('http://localhost:3000/api/admin/dashboard', {
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
        const response = await axios.get('http://localhost:3000/api/admin/users', {
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
        await axios.put(`http://localhost:3000/api/admin/users/${userId}/role`, 
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
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #4CAF50;
}

.sidebar-toggle {
  display: none;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: 15px 20px;
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border-left-color: #4CAF50;
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

.dashboard-container {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  overflow-y: auto;
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
