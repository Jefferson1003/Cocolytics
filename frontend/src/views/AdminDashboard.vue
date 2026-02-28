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
      <div class="section quick-links-section">
        <h2>🚀 Quick Links</h2>
        <div class="quick-links-grid">
          <router-link to="/admin/users" class="quick-link-card">
            <span class="link-icon">👥</span>
            <span class="link-text">Manage Users</span>
          </router-link>
          <router-link to="/admin/reports" class="quick-link-card">
            <span class="link-icon">📊</span>
            <span class="link-text">View Reports</span>
          </router-link>
          <router-link to="/admin/features" class="quick-link-card">
            <span class="link-icon">🔧</span>
            <span class="link-text">All Features</span>
          </router-link>
          <router-link to="/admin/paper-approvals" class="quick-link-card">
            <span class="link-icon">📄</span>
            <span class="link-text">Paper Approvals</span>
          </router-link>
        </div>
      </div>
    </div>
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
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.dashboardData = response.data.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load dashboard data'
      }
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

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e1e3f 0%, #2a2a4a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 90px;
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

.admin-layout .sidebar.collapsed ~ .dashboard-container {
  margin-left: 90px;
  width: calc(100% - 90px);
  max-width: calc(100vw - 90px);
}

.dashboard-header {
  margin-bottom: 30px;
  flex-shrink: 0;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  flex-shrink: 0;
}

@media (max-width: 1600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(36, 68, 66, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(76, 175, 80, 0.3);
}

.stat-icon {
  font-size: 3rem;
}

.stat-info h3 {
  font-size: 2.2rem;
  color: #fff;
  margin: 0;
  font-weight: 700;
}

.stat-info p {
  color: #aaa;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.section {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section h2 {
  color: #4CAF50;
  margin-bottom: 24px;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.quick-links-section {
  position: relative;
  overflow: hidden;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick-link-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #e6f4ea;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-link-card:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%);
  border-color: #4CAF50;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);
}

.link-icon {
  font-size: 2.5rem;
}

.link-text {
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  color: #e6f4ea;
}

.reports-section {
  position: relative;
  overflow: hidden;
  font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
}

.reports-section::before {
  content: "";
  position: absolute;
  inset: -120px -80px auto auto;
  height: 260px;
  width: 260px;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.35) 0%, rgba(76, 175, 80, 0) 70%);
  opacity: 0.6;
  pointer-events: none;
}

.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.reports-subtitle {
  color: #9bb4a0;
  margin: 6px 0 0;
  font-size: 1rem;
}

.reports-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.report-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  background: #4CAF50;
  color: #0f2027;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-btn.outline {
  background: transparent;
  border: 1px solid rgba(76, 175, 80, 0.6);
  color: #cfe9d3;
}

.report-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(76, 175, 80, 0.25);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.report-card {
  background: linear-gradient(135deg, rgba(15, 32, 39, 0.85) 0%, rgba(28, 41, 52, 0.9) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 240px;
  position: relative;
}

.report-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.report-head h3 {
  margin: 0;
  color: #e6f4ea;
  font-size: 1.2rem;
  letter-spacing: 0.2px;
}

.report-chip {
  background: rgba(76, 175, 80, 0.2);
  color: #bfe9c5;
  border: 1px solid rgba(76, 175, 80, 0.4);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.report-chip.amber {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffdd95;
}

.report-chip.teal {
  background: rgba(0, 188, 212, 0.2);
  border-color: rgba(0, 188, 212, 0.4);
  color: #8be8f5;
}

.report-chip.violet {
  background: rgba(156, 39, 176, 0.2);
  border-color: rgba(156, 39, 176, 0.4);
  color: #e1a7f0;
}

.report-chip.gray {
  background: rgba(189, 189, 189, 0.15);
  border-color: rgba(189, 189, 189, 0.3);
  color: #d0d0d0;
}

.report-kpi {
  font-size: 1.6rem;
  color: #4CAF50;
  font-weight: 700;
}

.report-meta {
  color: #9bb4a0;
  font-size: 0.95rem;
  margin: 0;
}

.report-chart {
  height: 80px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(120deg, rgba(76, 175, 80, 0.25), rgba(15, 32, 39, 0.05));
}

.report-chart::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.06) 6px,
    transparent 6px,
    transparent 14px
  );
  animation: scanline 6s linear infinite;
}

.report-chart.production {
  background: linear-gradient(120deg, rgba(76, 175, 80, 0.4), rgba(32, 58, 67, 0.2));
}

.report-chart.inventory {
  background: linear-gradient(120deg, rgba(255, 193, 7, 0.35), rgba(32, 58, 67, 0.2));
}

.report-chart.dispatch {
  background: linear-gradient(120deg, rgba(33, 150, 243, 0.35), rgba(32, 58, 67, 0.2));
}

.report-chart.yield {
  background: linear-gradient(120deg, rgba(0, 188, 212, 0.35), rgba(32, 58, 67, 0.2));
}

.report-chart.forecast {
  background: linear-gradient(120deg, rgba(156, 39, 176, 0.35), rgba(32, 58, 67, 0.2));
}

.report-foot {
  display: flex;
  justify-content: space-between;
  color: #b7c8bc;
  font-size: 0.9rem;
}

.logs-card {
  gap: 10px;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.log-pill {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
}

.log-pill.ok {
  background: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
}

.log-pill.warn {
  background: #ffc107;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.6);
}

.log-pill.alert {
  background: #ff6b6b;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.6);
}

.log-title {
  color: #e6f4ea;
  font-weight: 600;
}

.log-time {
  color: #9bb4a0;
  font-size: 0.85rem;
}

@keyframes scanline {
  0% {
    transform: translateX(-20%);
  }
  100% {
    transform: translateX(20%);
  }
}

@media (max-width: 1200px) {
  .reports-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 16px 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
  display: flex;
  align-items: center;
  gap: 14px;
  color: #ddd;
  font-size: 1.05em;
  transition: all 0.3s ease;
}

.features-list li:hover {
  padding-left: 8px;
  color: #fff;
}

.features-list li:last-child {
  border-bottom: none;
}

.feature-icon {
  font-size: 1.4rem;
}

.users-table-container {
  overflow: hidden;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.users-table th,
.users-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
  overflow: hidden;
  text-overflow: ellipsis;
}

.users-table th:nth-child(1),
.users-table td:nth-child(1) {
  width: 25%;
}

.users-table th:nth-child(2),
.users-table td:nth-child(2) {
  width: 35%;
}

.users-table th:nth-child(3),
.users-table td:nth-child(3) {
  width: 20%;
}

.users-table th:nth-child(4),
.users-table td:nth-child(4) {
  width: 20%;
}

.users-table th {
  color: #4CAF50;
  font-weight: 700;
  font-size: 0.95em;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(76, 175, 80, 0.05);
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

.role-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.3px;
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

.role-select:hover {
  border-color: #4CAF50;
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
  .admin-layout {
    padding-top: 60px;
  }

  .sidebar {
    transform: translateX(-100%);
    width: 280px !important;
    z-index: 9999;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: none;
  }

  .dashboard-container {
    margin-left: 0 !important;
    width: 100% !important;
    max-width: 100vw !important;
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

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-info h3 {
    font-size: 1.6rem;
  }
  
  .dashboard-sections {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .section {
    padding: 20px 16px;
  }

  .section h2 {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }

  .quick-links-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .quick-link-card {
    padding: 16px;
  }

  .link-icon {
    font-size: 2rem;
  }

  .link-text {
    font-size: 0.95rem;
  }

  .reports-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .reports-actions {
    width: 100%;
  }

  .report-btn {
    flex: 1;
    min-width: 0;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .dashboard-header p {
    font-size: 0.9rem;
  }

  .quick-links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
