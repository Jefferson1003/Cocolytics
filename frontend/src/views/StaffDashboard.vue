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

    <!-- Browse Sellers Section -->
    <div class="browse-sellers-section">
      <h2>🛍️ Browse Traders</h2>
      <p class="section-subtitle">Buy products from trusted coconut traders</p>

      <div v-if="loadingSellers" class="loading">
        <div class="loading-spinner">⏳</div>
        <p>Loading traders...</p>
      </div>

      <div v-else-if="sellers.length > 0" class="sellers-grid">
        <div v-for="seller in sellers" :key="seller.staff_id" class="seller-card">
          <div class="seller-logo">
            <img v-if="seller.store_logo" :src="getImageUrl(seller.store_logo)" :alt="seller.store_name" />
            <div v-else class="default-logo">🥥</div>
          </div>
          
          <div class="seller-info">
            <h3>{{ seller.store_name || `${seller.staff_name}'s Store` }}</h3>
            <p class="seller-description">{{ seller.store_description || 'Quality coconut products' }}</p>
            
            <div class="seller-stats">
              <div class="stat">
                <span class="stat-icon">📦</span>
                <span class="stat-value">{{ seller.product_count }} Products</span>
              </div>
              <div class="stat">
                <span class="stat-icon">📊</span>
                <span class="stat-value">{{ seller.total_stock }} In Stock</span>
              </div>
            </div>
            
            <div class="seller-contact" v-if="seller.contact_number">
              <span class="contact-icon">📞</span>
              <span>{{ seller.contact_number }}</span>
            </div>
          </div>
          
          <button @click="viewSellerProducts(seller.staff_id)" class="btn-view-store">
            View Store →
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🏪</div>
        <h3>No Traders Available</h3>
        <p>Check back later for available traders</p>
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
      error: '',
      sellers: [],
      loadingSellers: false
    }
  },
  created() {
    const userData = localStorage.getItem('user')
    this.user = userData ? JSON.parse(userData) : null
    this.fetchDashboardData()
  },
  mounted() {
    this.fetchSellers()
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
    },
    async fetchSellers() {
      try {
        this.loadingSellers = true
        const token = localStorage.getItem('token')
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/sellers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.sellers = response.data.data.filter(seller => seller.product_count > 0)
      } catch (err) {
        console.log('Failed to load sellers')
      } finally {
        this.loadingSellers = false
      }
    },
    viewSellerProducts(sellerId) {
      this.$router.push(`/sellers/${sellerId}`)
    },
    getImageUrl(imagePath) {
      if (!imagePath) return '/images/placeholder.png'
      if (imagePath.startsWith('http')) return imagePath
      if (imagePath.startsWith('/')) return imagePath
      return `/uploads/${imagePath}`
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

/* Browse Sellers Section */
.browse-sellers-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px 24px;
  margin-top: 32px;
  backdrop-filter: blur(10px);
  color: white;
}

.browse-sellers-section h2 {
  font-size: 1.6em;
  margin-bottom: 8px;
  color: white;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
  font-size: 0.95em;
}

.sellers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.seller-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.seller-card:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.seller-logo {
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.seller-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 2.5em;
}

.seller-info {
  flex: 1;
}

.seller-info h3 {
  font-size: 1.1em;
  margin: 0 0 8px 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.seller-description {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.seller-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.08);
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.8);
}

.stat-icon {
  font-size: 1.1em;
}

.stat-value {
  font-weight: 500;
}

.seller-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-icon {
  font-size: 1.1em;
}

.btn-view-store {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95em;
  text-decoration: none;
}

.btn-view-store:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-view-store:active {
  transform: scale(0.98);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 12px;
}

.empty-state h3 {
  color: white;
  margin: 12px 0 8px 0;
}

.empty-state p {
  margin: 0;
  font-size: 0.95em;
}

@media (max-width: 768px) {
  .sellers-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .browse-sellers-section {
    padding: 24px 16px;
  }
}

@media (max-width: 480px) {
  .sellers-grid {
    grid-template-columns: 1fr;
  }

  .browse-sellers-section h2 {
    font-size: 1.3em;
  }
}
</style>
