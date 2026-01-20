<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>👔 Cocolumber Producer</h1>
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
</template>

<script>
import axios from 'axios'

export default {
  name: 'StaffDashboard',
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
        const response = await axios.get('http://localhost:3000/api/staff/dashboard', {
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
.dashboard-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #2196F3;
  margin-bottom: 10px;
}

.dashboard-header p {
  color: #888;
  font-size: 1.1rem;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.section {
  background: #242442;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.section h2 {
  color: #2196F3;
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

.users-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #1a1a2e;
  border-radius: 10px;
}

.user-avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
}

.user-info h4 {
  color: #fff;
  margin: 0 0 4px 0;
}

.user-info p {
  color: #888;
  margin: 0;
  font-size: 0.9rem;
}

.user-date {
  color: #666;
  font-size: 0.8rem;
}

.quick-actions {
  background: #242442;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.quick-actions h2 {
  color: #2196F3;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  background: #1a1a2e;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.2);
}

.action-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 10px;
}

.action-card h3 {
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.action-card p {
  color: #888;
  margin: 0;
  font-size: 0.9rem;
}

.loading {
  color: #888;
  text-align: center;
  padding: 20px;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
