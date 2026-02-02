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

      <div class="error-message" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import UserNavbar from '../components/UserNavbar.vue'

export default {
  name: 'UserDashboard',
  components: {
    UserNavbar
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
}



.dashboard-container {
  flex: 1;
  margin-left: 0;
  padding: 30px;
  overflow-y: auto;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #81C784;
  margin-bottom: 10px;
}

.dashboard-header p {
  color: #888;
  font-size: 1.1rem;
}

.user-info-card {
  background: #242442;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  color: #81C784;
  font-weight: 500;
  font-size: 1.1rem;
}

.role-badge {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
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
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
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
  color: #4CAF50;
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
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.action-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 10px;
}

.action-card h3 {
  margin: 10px 0 5px 0;
  color: #4CAF50;
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

/* Mission Section Styles */
.mission-section {
  margin-bottom: 30px;
}

.mission-card {
  background: #242442;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.mission-header {
  text-align: center;
  margin-bottom: 30px;
}

.mission-header h2 {
  color: #4CAF50;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.mission-subtitle {
  color: #81C784;
  font-size: 1.1rem;
  font-weight: 500;
}

.mission-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.mission-text h3 {
  color: #81C784;
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.mission-text p {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 15px;
}

.mission-features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.feature-item {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #4CAF50;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(76, 175, 80, 0.15);
  transform: translateX(5px);
}

.feature-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 10px;
}

.feature-item h4 {
  color: #4CAF50;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.feature-item p {
  color: #ccc;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .mission-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .mission-card {
    padding: 20px;
  }

  .mission-header h2 {
    font-size: 1.5rem;
  }
}
</style>
