<template>
  <div class="admin-layout">
    <AdminSidebar />

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>👥 User Management</h1>
        <p>Manage all system users, roles, and permissions</p>
      </div>

      <div class="users-section">
        <div class="section-header">
          <h2>All Users</h2>
          <div class="search-bar">
            <input v-model="searchQuery" type="text" placeholder="Search by name or email..." class="search-input">
          </div>
        </div>

        <div class="users-table-container">
          <table class="users-table" v-if="filteredUsers.length">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'is-current': u.id === user.id }">
                <td class="name-cell">{{ u.name }}</td>
                <td class="email-cell">{{ u.email }}</td>
                <td>
                  <span class="role-badge" :class="u.role">{{ u.role }}</span>
                </td>
                <td class="date-cell">{{ formatDate(u.created_at) }}</td>
                <td>
                  <select 
                    v-model="u.role" 
                    @change="updateUserRole(u.id, u.role)"
                    class="role-select"
                    :disabled="u.id === user.id"
                    :title="u.id === user.id ? 'Cannot change your own role' : 'Change user role'"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-data">No users found. Loading...</p>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">Total Users:</span>
            <span class="stat-value">{{ users.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Admins:</span>
            <span class="stat-value">{{ users.filter(u => u.role === 'admin').length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Staff:</span>
            <span class="stat-value">{{ users.filter(u => u.role === 'staff').length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Regular Users:</span>
            <span class="stat-value">{{ users.filter(u => u.role === 'user').length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div class="error-message" v-if="error">{{ error }}</div>
    <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
  </div>
</template>

<script>
import axios from 'axios'
import AdminSidebar from '../components/AdminSidebar.vue'

export default {
  name: 'AdminUsers',
  components: {
    AdminSidebar
  },
  data() {
    return {
      user: null,
      users: [],
      searchQuery: '',
      error: '',
      successMessage: ''
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users
      const query = this.searchQuery.toLowerCase()
      return this.users.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      )
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    this.user = userData ? JSON.parse(userData) : null
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = response.data.users
      } catch (err) {
        this.error = 'Failed to fetch users'
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
        this.successMessage = 'User role updated successfully'
        setTimeout(() => this.successMessage = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to update user role'
        this.fetchUsers()
        setTimeout(() => this.error = '', 5000)
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  max-width: 100vw;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
}

.dashboard-container {
  flex: 1;
  margin-left: 280px;
  padding: 40px 50px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100vw - 280px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  box-sizing: border-box;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #4CAF50;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.dashboard-header p {
  color: #bbb;
  font-size: 1.2rem;
  font-weight: 400;
}

.users-section {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.section-header h2 {
  color: #4CAF50;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
}

.search-bar {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(30, 30, 63, 0.7);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: #888;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  background: rgba(30, 30, 63, 0.9);
}

.users-table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: 8px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
}

.users-table th {
  color: #4CAF50;
  font-weight: 700;
  font-size: 0.95em;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(76, 175, 80, 0.05);
  position: sticky;
  top: 0;
}

.users-table td {
  color: #ddd;
  font-size: 1.05em;
}

.users-table tbody tr {
  transition: all 0.3s ease;
}

.users-table tbody tr:hover {
  background: rgba(76, 175, 80, 0.05);
}

.users-table tbody tr.is-current {
  background: rgba(76, 175, 80, 0.1);
  font-weight: 500;
}

.name-cell {
  font-weight: 600;
  color: #e6f4ea;
}

.email-cell {
  font-family: 'Courier New', monospace;
  font-size: 0.95em;
}

.date-cell {
  color: #9bb4a0;
  font-size: 0.95em;
}

.role-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.3px;
  display: inline-block;
}

.role-badge.admin {
  background: rgba(76, 175, 80, 0.25);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.role-badge.staff {
  background: rgba(33, 150, 243, 0.25);
  color: #2196F3;
  border: 1px solid rgba(33, 150, 243, 0.4);
}

.role-badge.user {
  background: rgba(156, 39, 176, 0.25);
  color: #9C27B0;
  border: 1px solid rgba(156, 39, 176, 0.4);
}

.role-select {
  background: rgba(30, 30, 63, 0.7);
  color: #fff;
  border: 1px solid rgba(76, 175, 80, 0.3);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-select:hover:not(:disabled) {
  border-color: #4CAF50;
  background: rgba(30, 30, 63, 0.9);
}

.role-select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.role-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(76, 175, 80, 0.1);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.stat-label {
  color: #9bb4a0;
  font-size: 0.9em;
}

.stat-value {
  color: #4CAF50;
  font-size: 1.4em;
  font-weight: 700;
}

.error-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(244, 67, 54, 0.95);
  color: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  z-index: 1000;
  animation: slideInUp 0.3s ease-out;
}

.success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(76, 175, 80, 0.95);
  color: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  z-index: 1000;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.no-data {
  color: #888;
  text-align: center;
  padding: 40px 20px;
  font-size: 1.1em;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    margin-left: 0;
    padding: 20px;
    width: 100%;
    max-width: 100vw;
  }

  .dashboard-header h1 {
    font-size: 1.8rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-bar {
    min-width: 100%;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .users-table {
    font-size: 0.9em;
  }

  .users-table th,
  .users-table td {
    padding: 10px 8px;
  }
}
</style>
