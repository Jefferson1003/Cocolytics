<template>
  <div class="user-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>👤 User</h2>
        <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
          {{ sidebarOpen ? '✕' : '☰' }}
        </button>
      </div>
      <nav class="sidebar-nav">
        <a href="#dashboard" @click="activeSection = 'dashboard'" :class="{ active: activeSection === 'dashboard'}" class="nav-item">
          📊 Dashboard
        </a>
        <a href="#profile" @click="activeSection = 'profile'" :class="{ active: activeSection === 'profile'}" class="nav-item">
          👤 My Profile
        </a>
        <a href="#activity" @click="activeSection = 'activity'" :class="{ active: activeSection === 'activity'}" class="nav-item">
          📈 Activity
        </a>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="nav-item">🏠 Home</router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>👤 User Dashboard</h1>
        <p>Welcome, {{ user?.name }}! Here's your personal overview.</p>
      </div>

      <div class="user-info-card" v-if="user">
        <div class="info-item">
          <span class="label">Name:</span>
          <span class="value">{{ user.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">Email:</span>
          <span class="value">{{ user.email }}</span>
        </div>
        <div class="info-item">
          <span class="label">Role:</span>
          <span class="value role-badge">{{ user.role }}</span>
        </div>
      </div>

      <div class="stats-grid" v-if="dashboardData">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <h3>{{ dashboardData.totalDataPoints }}</h3>
            <p>Data Points</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>{{ dashboardData.lastActive }}</h3>
            <p>Last Active</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <h3>{{ dashboardData.accountAge }}</h3>
            <p>Account Age</p>
          </div>
        </div>
      </div>

      <div class="dashboard-sections">
        <div class="section features-section">
          <h2>✨ Available Features</h2>
          <ul class="features-list" v-if="dashboardData">
            <li v-for="feature in dashboardData.userFeatures" :key="feature">
              <span class="feature-icon">✅</span>
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="section recent-activity-section">
          <h2>📈 Recent Activity</h2>
          <div class="activity-list" v-if="dashboardData?.recentActivity">
            <div class="activity-item" v-for="(item, index) in dashboardData.recentActivity" :key="index">
              <div class="activity-icon">{{ item.icon }}</div>
              <div class="activity-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
                <span class="activity-date">{{ formatDate(item.date) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="loading">Loading activity...</div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div class="actions-grid">
          <div class="action-card">
            <span class="action-icon">📊</span>
            <h3>View Analytics</h3>
            <p>Check your personal analytics</p>
          </div>
          <div class="action-card">
            <span class="action-icon">⚙️</span>
            <h3>Settings</h3>
            <p>Manage your account settings</p>
          </div>
          <div class="action-card">
            <span class="action-icon">💬</span>
            <h3>Support</h3>
            <p>Contact our support team</p>
          </div>
          <div class="action-card">
            <span class="action-icon">📱</span>
            <h3>Mobile App</h3>
            <p>Download our mobile app</p>
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
  name: 'UserDashboard',
  data() {
    return {
      user: null,
      dashboardData: null,
      error: '',
      sidebarOpen: true,
      activeSection: 'dashboard'
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
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.dashboardData = response.data.data
      } catch (err) {
        // Provide default data if API not available
        this.dashboardData = {
          totalDataPoints: 24,
          lastActive: 'Today',
          accountAge: '6 months',
          userFeatures: [
            'View personal analytics',
            'Access your profile',
            'Review activity history',
            'Download reports',
            'Update preferences'
          ],
          recentActivity: [
            { icon: '📊', title: 'Logged In', description: 'You logged into your account', date: new Date() },
            { icon: '📝', title: 'Data Updated', description: 'Your profile data was updated', date: new Date(Date.now() - 86400000) },
            { icon: '📥', title: 'Report Downloaded', description: 'You downloaded a monthly report', date: new Date(Date.now() - 172800000) }
          ]
        }
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
.user-layout {
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
  color: #2196F3;
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
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border-left-color: #2196F3;
}

.nav-item.active {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
  border-left-color: #2196F3;
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
  color: #2196F3;
  margin-bottom: 10px;
}

.dashboard-header p {
  color: #888;
  font-size: 1.1rem;
}

.user-info-card {
  background: #242442;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item .label {
  color: #888;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.info-item .value {
  color: #fff;
  font-weight: 500;
  font-size: 1.1rem;
}

.role-badge {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  width: fit-content;
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 12px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  border-left: 4px solid #2196F3;
}

.activity-icon {
  font-size: 1.5rem;
  min-width: 30px;
}

.activity-info h4 {
  margin: 0 0 5px 0;
  color: #fff;
  font-size: 1rem;
}

.activity-info p {
  margin: 0 0 5px 0;
  color: #ccc;
  font-size: 0.9rem;
}

.activity-date {
  color: #888;
  font-size: 0.85rem;
}

.quick-actions {
  margin-bottom: 30px;
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
  background: #242442;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);
}

.action-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 10px;
}

.action-card h3 {
  margin: 10px 0 5px 0;
  color: #2196F3;
}

.action-card p {
  margin: 0;
  color: #ccc;
  font-size: 0.9rem;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.loading {
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
