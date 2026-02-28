<template>
  <div class="admin-layout">
    <AdminSidebar />

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>🔧 Admin Features</h1>
        <p>Overview of all available admin features and capabilities</p>
      </div>

      <div class="features-section">
        <div class="section-header">
          <h2>Available Features</h2>
          <div class="filter-bar">
            <select v-model="selectedCategory" class="category-select">
              <option value="">All Categories</option>
              <option value="user-management">User Management</option>
              <option value="reporting">Reporting</option>
              <option value="content">Content</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="feature in filteredFeatures" :key="feature.id" :class="feature.category">
            <div class="feature-icon">{{ feature.icon }}</div>
            <div class="feature-body">
              <h3>{{ feature.name }}</h3>
              <p>{{ feature.description }}</p>
              <div class="feature-meta">
                <span class="status" :class="feature.status">{{ feature.status }}</span>
                <span class="category-tag">{{ feature.category }}</span>
              </div>
            </div>
            <div class="feature-action">
              <router-link v-if="feature.link" :to="feature.link" class="btn-link">
                → Access
              </router-link>
              <span v-else class="btn-disabled">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <div class="system-info">
        <h2>System Information</h2>
        <div class="info-grid">
          <div class="info-card">
            <span class="info-label">Admin Version</span>
            <span class="info-value">1.0.0</span>
          </div>
          <div class="info-card">
            <span class="info-label">Last Updated</span>
            <span class="info-value">Feb 15, 2026</span>
          </div>
          <div class="info-card">
            <span class="info-label">Status</span>
            <span class="info-value online">● Online</span>
          </div>
          <div class="info-card">
            <span class="info-label">Features Available</span>
            <span class="info-value">{{ features.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue'

export default {
  name: 'AdminFeatures',
  components: {
    AdminSidebar
  },
  data() {
    return {
      selectedCategory: '',
      features: [
        {
          id: 1,
          name: 'Manage Users',
          description: 'Create, edit, and manage user accounts and roles',
          icon: '👥',
          category: 'user-management',
          status: 'active',
          link: '/admin/users'
        },
        {
          id: 2,
          name: 'Reports Dashboard',
          description: 'View production, inventory, dispatch, and system reports',
          icon: '📊',
          category: 'reporting',
          status: 'active',
          link: '/admin/reports'
        },
        {
          id: 3,
          name: 'Paper Approvals',
          description: 'Review and approve paper-based uploads and submissions',
          icon: '📄',
          category: 'content',
          status: 'active',
          link: '/admin/paper-approvals'
        },
        {
          id: 4,
          name: 'System Settings',
          description: 'Configure system-wide settings and preferences',
          icon: '⚙️',
          category: 'system',
          status: 'coming-soon',
          link: null
        },
        {
          id: 5,
          name: 'Audit Logs',
          description: 'View comprehensive audit trail of all system actions',
          icon: '📋',
          category: 'system',
          status: 'coming-soon',
          link: null
        },
        {
          id: 6,
          name: 'User Analytics',
          description: 'Analyze user behavior and engagement metrics',
          icon: '📈',
          category: 'reporting',
          status: 'coming-soon',
          link: null
        },
        {
          id: 7,
          name: 'Content Management',
          description: 'Manage system content, notifications, and messaging',
          icon: '📝',
          category: 'content',
          status: 'coming-soon',
          link: null
        },
        {
          id: 8,
          name: 'API Management',
          description: 'Manage API keys and third-party integrations',
          icon: '🔌',
          category: 'system',
          status: 'coming-soon',
          link: null
        }
      ]
    }
  },
  computed: {
    filteredFeatures() {
      if (!this.selectedCategory) return this.features
      return this.features.filter(f => f.category === this.selectedCategory)
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
  margin-bottom: 40px;
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

.features-section {
  margin-bottom: 40px;
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

.filter-bar {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.category-select {
  width: 100%;
  padding: 10px 14px;
  background: rgba(30, 30, 63, 0.7);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-select:hover {
  border-color: #4CAF50;
  background: rgba(30, 30, 63, 0.9);
}

.category-select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(76, 175, 80, 0.4);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);
}

.feature-icon {
  font-size: 2.5rem;
  min-width: 60px;
  text-align: center;
}

.feature-body {
  flex: 1;
}

.feature-body h3 {
  color: #e6f4ea;
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.feature-body p {
  color: #9bb4a0;
  font-size: 0.95em;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.feature-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status.active {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.status.coming-soon {
  background: rgba(255, 193, 7, 0.2);
  color: #ffdd95;
  border: 1px solid rgba(255, 193, 7, 0.4);
}

.category-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  text-transform: capitalize;
  color: #bfe9c5;
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.feature-action {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.btn-link {
  padding: 8px 16px;
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.9em;
}

.btn-link:hover {
  background: rgba(76, 175, 80, 0.3);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.3);
}

.btn-disabled {
  padding: 8px 16px;
  color: #888;
  font-size: 0.9em;
  white-space: nowrap;
}

.system-info {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 24px;
}

.system-info h2 {
  color: #4CAF50;
  font-size: 1.4rem;
  margin: 0 0 20px 0;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-card {
  background: rgba(76, 175, 80, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  color: #9bb4a0;
  font-size: 0.9em;
  font-weight: 500;
}

.info-value {
  color: #e6f4ea;
  font-size: 1.3em;
  font-weight: 700;
}

.info-value.online {
  color: #4CAF50;
}

@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-layout {
    padding-top: 60px;
  }

  .dashboard-container {
    margin-left: 0 !important;
    padding: 20px 16px;
    width: 100% !important;
    max-width: 100vw !important;
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

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }

  .filter-bar,
  .category-select {
    width: 100%;
  }

  .features-section {
    border-radius: 12px;
  }

  .feature-card {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .feature-icon {
    font-size: 2rem;
  }

  .feature-body h3 {
    font-size: 1.1rem;
  }

  .feature-body p {
    font-size: 0.9rem;
  }

  .feature-action {
    margin-left: 0;
    justify-content: flex-start;
  }

  .system-info h2 {
    font-size: 1.3rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .dashboard-header p {
    font-size: 0.9rem;
  }
}
</style>
