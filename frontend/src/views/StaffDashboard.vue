<template>
  <div class="staff-layout">
    <StaffSidebar />

    <!-- Main Content -->
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
        <router-link to="/staff/add-cocolumber" class="action-card">
          <span class="action-icon">🥒</span>
          <h3>Add Cocolumber</h3>
          <p>Insert new product to inventory</p>
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
.staff-layout {
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
  color: #2196F3;
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
  color: #2196F3;
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
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border-left-color: #2196F3;
}

.sidebar.collapsed .nav-item:hover {
  border-left-color: transparent;
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

.sidebar.collapsed .sidebar-footer {
  padding: 10px 0;
}

.dashboard-container {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}

.staff-layout .sidebar.collapsed ~ .dashboard-container {
  margin-left: 80px;
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

/* Logout Button */
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
  
  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }
}
</style>
