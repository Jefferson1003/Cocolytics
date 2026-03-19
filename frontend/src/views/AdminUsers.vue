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
                  <div class="action-controls">
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
                    <button
                      v-if="canDeleteUser(u)"
                      type="button"
                      class="delete-user-btn"
                      @click="openDeleteModal(u)"
                      :disabled="deletingUserId === u.id"
                    >
                      {{ deletingUserId === u.id ? 'Removing...' : 'Remove' }}
                    </button>
                    <span v-else class="protected-user-label">
                      {{ u.id === user.id ? 'Current account' : 'Protected' }}
                    </span>
                  </div>
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

    <div v-if="showDeleteModal" class="delete-modal-overlay" @click="closeDeleteModal">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-header">
          <h3>Remove Account</h3>
          <button type="button" class="delete-modal-close" @click="closeDeleteModal">&times;</button>
        </div>
        <p class="delete-modal-text">
          Remove <strong>{{ userToDelete?.name }}</strong> ({{ userToDelete?.email }})?
        </p>
        <p class="delete-modal-warning">
          This permanently removes the account and may also remove related user records tied to it.
        </p>
        <label class="delete-reason-label" for="delete-reason-input">
          Message for the removed account
        </label>
        <textarea
          id="delete-reason-input"
          v-model="deleteReason"
          class="delete-reason-input"
          rows="3"
          placeholder="Example: Your account was removed because you are no longer an active staff member."
        ></textarea>
        <label class="delete-confirm-label" for="delete-confirm-input">
          Confirmation keyword
        </label>
        <p class="delete-confirm-help">Type <strong>REMOVE</strong> in the field below before deleting the account.</p>
        <input
          id="delete-confirm-input"
          v-model="deleteConfirmationText"
          type="text"
          class="delete-confirm-input"
          placeholder="Type REMOVE"
        >
        <p v-if="deleteValidationError" class="delete-validation-error">{{ deleteValidationError }}</p>
        <div class="delete-modal-actions">
          <button type="button" class="cancel-delete-btn" @click="closeDeleteModal">Cancel</button>
          <button
            type="button"
            class="confirm-delete-btn"
            @click="deleteUser"
            :disabled="!userToDelete || deletingUserId === userToDelete?.id"
          >
            {{ deletingUserId === userToDelete?.id ? 'Removing...' : 'Remove Account' }}
          </button>
        </div>
      </div>
    </div>
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
      successMessage: '',
      showDeleteModal: false,
      userToDelete: null,
      deletingUserId: null,
      deleteConfirmationText: '',
      deleteReason: '',
      deleteValidationError: ''
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
    },
    canConfirmDelete() {
      return this.deleteConfirmationText.trim().toUpperCase() === 'REMOVE' && !!this.userToDelete
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
    canDeleteUser(targetUser) {
      return targetUser.id !== this.user?.id && targetUser.role !== 'admin'
    },
    openDeleteModal(targetUser) {
      if (!this.canDeleteUser(targetUser)) {
        return
      }

      this.userToDelete = { ...targetUser }
      this.deleteConfirmationText = ''
      this.deleteReason = `Your account was removed because it is no longer active. If you think this was a mistake, please contact the administrator.`
      this.deleteValidationError = ''
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      if (this.deletingUserId) {
        return
      }

      this.showDeleteModal = false
      this.userToDelete = null
      this.deleteConfirmationText = ''
      this.deleteReason = ''
      this.deleteValidationError = ''
    },
    async deleteUser() {
      if (!this.canConfirmDelete) {
        this.deleteValidationError = 'Type REMOVE in the confirmation field before deleting this account.'
        return
      }

      try {
        const token = localStorage.getItem('token')
        this.deletingUserId = this.userToDelete.id
        this.deleteValidationError = ''

        const response = await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${this.userToDelete.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { reason: this.deleteReason.trim() }
          }
        )

        this.users = this.users.filter(existingUser => existingUser.id !== this.userToDelete.id)
        this.successMessage = response.data?.message || 'User account removed successfully'
        this.closeDeleteModal()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to remove user account'
        setTimeout(() => this.error = '', 5000)
      } finally {
        this.deletingUserId = null
        this.showDeleteModal = false
        this.userToDelete = null
        this.deleteConfirmationText = ''
        this.deleteReason = ''
        this.deleteValidationError = ''
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
  --admin-sidebar-width: 280px;
  --admin-sidebar-collapsed-width: 90px;
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
  margin-left: var(--admin-sidebar-width);
  padding: 40px 50px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--admin-sidebar-width));
  max-width: calc(100vw - var(--admin-sidebar-width));
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

.action-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.delete-user-btn {
  border: 1px solid rgba(255, 107, 107, 0.35);
  background: rgba(255, 107, 107, 0.12);
  color: #ffd2d2;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  transition: all 0.3s ease;
}

.delete-user-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.55);
}

.delete-user-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.protected-user-label {
  color: #9bb4a0;
  font-size: 0.9em;
  font-weight: 600;
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

.delete-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 14, 18, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1200;
}

.delete-modal {
  width: min(100%, 480px);
  background: linear-gradient(145deg, rgba(18, 47, 58, 0.98), rgba(22, 56, 68, 0.98));
  border: 1px solid rgba(255, 107, 107, 0.25);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  padding: 22px;
}

.delete-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.delete-modal-header h3 {
  margin: 0;
  color: #ffe2e2;
}

.delete-modal-close {
  background: none;
  border: none;
  color: #d7e4df;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
}

.delete-modal-text {
  color: #e6f4ea;
  margin: 0 0 10px;
}

.delete-modal-warning {
  color: #f5c0c0;
  margin: 0 0 18px;
  line-height: 1.5;
}

.delete-confirm-label {
  display: block;
  color: #e6f4ea;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.delete-confirm-help {
  margin: 0 0 10px;
  color: #c6dad4;
  font-size: 0.9rem;
}

.delete-reason-label {
  display: block;
  color: #e6f4ea;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.delete-reason-input {
  width: 100%;
  margin-bottom: 16px;
  background: rgba(10, 27, 33, 0.66);
  color: #ecfff3;
  border: 1px solid rgba(255, 107, 107, 0.35);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.98rem;
  resize: vertical;
  min-height: 88px;
}

.delete-reason-input:focus {
  outline: none;
  border-color: rgba(255, 107, 107, 0.65);
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.15);
}

.delete-confirm-input {
  width: 100%;
  margin-bottom: 18px;
  background: rgba(10, 27, 33, 0.66);
  color: #ecfff3;
  border: 1px solid rgba(255, 107, 107, 0.35);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 1rem;
}

.delete-confirm-input:focus {
  outline: none;
  border-color: rgba(255, 107, 107, 0.65);
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.15);
}

.delete-validation-error {
  margin: 0 0 14px;
  color: #ffb8b3;
  font-size: 0.9rem;
  font-weight: 600;
}

.delete-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.cancel-delete-btn,
.confirm-delete-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 700;
}

.cancel-delete-btn {
  background: rgba(255, 255, 255, 0.12);
  color: #e6f4ea;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.confirm-delete-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #d64545 100%);
  color: #fff;
}

.confirm-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .admin-layout {
    --admin-sidebar-width: 240px;
    --admin-sidebar-collapsed-width: 84px;
  }

  .dashboard-container {
    padding: 20px 16px;
  }

  .dashboard-header {
    margin-bottom: 20px;
  }

  .dashboard-header h1 {
    font-size: 1.8rem;
  }

  .dashboard-header p {
    font-size: 1rem;
  }

  .users-section {
    border-radius: 12px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }

  .search-bar {
    min-width: 100%;
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .users-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .users-table {
    font-size: 0.85em;
    min-width: 600px;
  }

  .users-table th,
  .users-table td {
    padding: 10px 8px;
    white-space: nowrap;
  }

  .action-controls {
    align-items: flex-start;
    flex-direction: column;
  }

  .email-cell {
    font-size: 0.85em;
  }

  .role-select {
    font-size: 0.9em;
    padding: 6px 10px;
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .stat-value {
    font-size: 1.6em;
  }

  .error-message,
  .success-message {
    bottom: 10px;
    right: 10px;
    left: 10px;
    padding: 12px 16px;
    font-size: 0.95rem;
  }

  .delete-modal {
    padding: 18px;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .dashboard-header p {
    font-size: 0.9rem;
  }

  .section-header h2 {
    font-size: 1.2rem;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1280px) {
  .admin-layout {
    --admin-sidebar-width: 240px;
    --admin-sidebar-collapsed-width: 84px;
  }

  .dashboard-container {
    padding: 30px 32px;
  }
}
</style>
