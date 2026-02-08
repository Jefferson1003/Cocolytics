<template>
  <div class="user-layout">
    <UserNavbar />



    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Welcome, {{ user?.name }}!</h1>
        <p>Here's your personal overview.</p>
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

      <!-- Our Mission Section -->
      <div class="mission-section">
        <div class="mission-card">
          <div class="mission-header">
            <h2>🎯 Our Mission</h2>
            <p class="mission-subtitle">Transforming Coconut Lumber Analytics</p>
          </div>
          <div class="mission-content">
            <div class="mission-text">
              <h3>What is Cocolytics?</h3>
              <p>
                Cocolytics is a comprehensive analytics platform designed specifically for coconut lumber operations.
                We provide real-time tracking, inventory management, and predictive analytics to help businesses
                optimize their coconut lumber production and supply chain processes.
              </p>
              <p>
                Our platform integrates advanced data visualization tools with automated reporting systems,
                enabling seamless monitoring of production efficiency, stock movement, demand patterns,
                and material wastage. With role-based access control, we ensure secure and controlled
                access for administrators, warehouse personnel, production supervisors, and sales staff.
              </p>
            </div>
            <div class="mission-features">
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <h4>Real-time Analytics</h4>
                <p>Monitor production metrics and inventory levels in real-time</p>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔄</span>
                <h4>Automated Reporting</h4>
                <p>Generate comprehensive reports automatically</p>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎯</span>
                <h4>Predictive Insights</h4>
                <p>Forecast inventory needs and optimize operations</p>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔒</span>
                <h4>Secure Access</h4>
                <p>Role-based permissions for different user types</p>
              </div>
            </div>
          </div>
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

      <!-- Staff Stores Section -->
      <StaffStoresSection />

      <div class="error-message" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import UserNavbar from '../components/UserNavbar.vue'
import StaffStoresSection from '../components/StaffStoresSection.vue'

export default {
  name: 'UserDashboard',
  components: {
    UserNavbar,
    StaffStoresSection
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
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding-top: 56px; /* Space for fixed header */
}

.dashboard-container {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 100%;
}

.dashboard-header {
  margin-bottom: 24px;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 1.5em;
  color: #81C784;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95em;
}

.user-info-card {
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-item .label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
}

.info-item .value {
  color: #81C784;
  font-weight: 500;
  font-size: 1em;
  text-align: right;
}

.role-badge {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.85em;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: #242442;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  font-size: 1.5em;
  color: white;
  margin: 0 0 4px 0;
}

.stat-info p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.9em;
}

.dashboard-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.section {
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.section h2 {
  color: #81C784;
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border-left: 4px solid #4CAF50;
}

.activity-icon {
  font-size: 1.4em;
  min-width: 30px;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-info h4 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 0.95em;
}

.activity-info p {
  margin: 0 0 4px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
  line-height: 1.3;
}

.activity-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75em;
}

.mission-section {
  margin-bottom: 20px;
}

.mission-card {
  background: #242442;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.mission-header {
  text-align: center;
  margin-bottom: 20px;
}

.mission-header h2 {
  color: #81C784;
  font-size: 1.3em;
  margin-bottom: 8px;
}

.mission-subtitle {
  color: rgba(129, 199, 132, 0.8);
  font-size: 1em;
  font-weight: 500;
}

.mission-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mission-text h3 {
  color: #81C784;
  font-size: 1.1em;
  margin-bottom: 12px;
}

.mission-text p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 0.95em;
}

.mission-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #4CAF50;
}

.feature-item .feature-icon {
  font-size: 1.4em;
  display: block;
  margin-bottom: 8px;
}

.feature-item h4 {
  color: #81C784;
  margin: 0 0 6px 0;
  font-size: 1em;
  font-weight: 600;
}

.feature-item p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.85em;
  line-height: 1.4;
}

.quick-actions {
  margin-bottom: 20px;
}

.quick-actions h2 {
  color: #81C784;
  margin-bottom: 16px;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-card {
  background: #242442;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.action-card:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.action-icon {
  font-size: 2em;
  display: block;
  margin-bottom: 8px;
}

.action-card h3 {
  margin: 0 0 6px 0;
  color: #81C784;
  font-size: 0.95em;
  font-weight: 600;
}

.action-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8em;
  line-height: 1.3;
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

.loading {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 20px;
  font-size: 0.95em;
}

/* Small screens - single column */
@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
