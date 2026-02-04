<template>
  <div class="staff-layout">
    <StaffSidebar />

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>👔 Coconut Producer</h1>
        <p>Welcome, {{ user?.name }}! You have staff access.</p>
      </div>

    <div class="dashboard-sections">
      <div class="section features-section">
        <h2>🔧 Staff Features</h2>
        <ul class="features-list" v-if="dashboardData">
          <li v-for="feature in dashboardData.staffFeatures" :key="feature">
            <span class="feature-icon">✅</span>
            {{ feature }}
          </li>
        </ul>
        <div v-else class="loading">Loading features...</div>
      </div>

      <div class="section recent-users-section">
        <h2>👥 Recent Users</h2>
        <div class="users-list" v-if="dashboardData?.recentUsers">
          <div class="user-card" v-for="u in dashboardData.recentUsers" :key="u.id">
            <div class="user-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <h4>{{ u.name }}</h4>
              <p>{{ u.email }}</p>
              <span class="user-date">Joined: {{ formatDate(u.created_at) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="loading">Loading recent users...</div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>⚡ Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/staff/add-cocolumber" class="action-card">
          <span class="action-icon">🥥</span>
          <h3>Add Coconut</h3>
          <p>Insert new product to inventory</p>
        </router-link>
        <router-link to="/staff/orders" class="action-card">
          <span class="action-icon">📋</span>
          <h3>Manage Orders</h3>
          <p>View and update order status</p>
        </router-link>
        <div class="action-card">
          <span class="action-icon">📊</span>
          <h3>View Reports</h3>
          <p>Access daily and weekly reports</p>
        </div>
        <div class="action-card">
          <span class="action-icon">📝</span>
          <h3>Manage Content</h3>
          <p>Edit and update content</p>
        </div>
        <div class="action-card">
          <span class="action-icon">💬</span>
          <h3>Support Tickets</h3>
          <p>Handle customer inquiries</p>
        </div>
        <div class="action-card">
          <span class="action-icon">📈</span>
          <h3>Data Entry</h3>
          <p>Add and update records</p>
        </div>
      </div>
    </div>

    <div class="error-message" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'StaffDashboard',
  components: {
    StaffSidebar
  },
  data() {
    return {
      user: null,
      dashboardData: null,
      error: ''
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    this.user = userData ? JSON.parse(userData) : null
    this.fetchDashboardData()
  },
  methods: {
    async fetchDashboardData() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/staff/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.dashboardData = response.data.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load dashboard data'
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
.staff-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 70px;
}

.dashboard-container {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-header {
  margin-bottom: 24px;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 1.5em;
  color: white;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95em;
}

.dashboard-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
}

.section {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  width: 100%;
}

.section h2 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95em;
}

.features-list li:last-child {
  border-bottom: none;
}

.feature-icon {
  font-size: 1.1em;
  flex-shrink: 0;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #1a1a2e;
  border-radius: 12px;
}

.user-avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h4 {
  color: white;
  margin: 0 0 4px 0;
  font-size: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.85em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75em;
  display: block;
  margin-top: 2px;
}

.quick-actions {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
  width: 100%;
}

.quick-actions h2 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.action-card:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.action-icon {
  font-size: 2em;
  display: block;
  margin-bottom: 8px;
}

.action-card h3 {
  color: white;
  margin: 0 0 6px 0;
  font-size: 0.95em;
  font-weight: 600;
}

.action-card p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.8em;
  line-height: 1.3;
}

.loading {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 20px;
  font-size: 0.95em;
}

.error-message {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 0.9em;
  text-align: center;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
  animation: scaleIn 0.3s ease-out;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.2em;
  margin: 0;
}

.modal-close {
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
  transition: transform 0.2s;
}

.modal-close:active {
  transform: scale(0.9);
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.modal-body p {
  font-size: 1em;
  color: #333;
  margin: 0;
}

.modal-footer {
  padding: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-logout {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 0.95em;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
}

.btn-cancel:active {
  background-color: #d0d0d0;
  transform: scale(0.98);
}

.btn-logout {
  background-color: #e74c3c;
  color: white;
}

.btn-logout:active {
  background-color: #c0392b;
  transform: scale(0.98);
}

/* Small screens - single column */
@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
