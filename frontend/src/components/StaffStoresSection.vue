<template>
  <div class="staff-stores-section">
    <div class="section-header">
      <h2>🏪 Staff Stores - Shop by Seller</h2>
      <p class="section-subtitle">Choose your favorite seller and browse their products</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner">⏳</div>
      <p>Loading staff stores...</p>
    </div>

    <div v-else-if="stores.length > 0" class="stores-grid">
      <div v-for="store in stores" :key="store.staff_id" class="store-card" @click="openStore(store.staff_id)">
        <div class="store-header">
          <div class="store-logo">
            <img v-if="store.store_logo" :src="getImageUrl(store.store_logo)" :alt="store.store_name" />
            <div v-else class="default-logo">🥥</div>
          </div>
          <div class="store-status" v-if="store.is_active" title="Active">
            <span class="status-badge">✓ Active</span>
          </div>
        </div>

        <div class="store-info">
          <h3 class="store-name">{{ store.store_name || store.staff_name }}</h3>
          <p class="store-description">{{ store.store_description || 'Quality coconut products' }}</p>

          <div class="store-stats">
            <div class="stat">
              <span class="stat-label">Products</span>
              <span class="stat-value">{{ store.product_count }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">In Stock</span>
              <span class="stat-value">{{ store.total_stock }}</span>
            </div>
          </div>

          <div class="store-details">
            <div v-if="store.contact_number" class="detail-item">
              <span class="detail-icon">📞</span>
              <span>{{ store.contact_number }}</span>
            </div>
            <div v-if="store.store_address" class="detail-item">
              <span class="detail-icon">📍</span>
              <span>{{ store.store_address }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👤</span>
              <span>{{ store.staff_name }}</span>
            </div>
          </div>
        </div>

        <button class="btn-visit-store">
          Visit Store →
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🏪</div>
      <h3>No Staff Stores Available</h3>
      <p>Check back later for available staff stores</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffStoresSection',
  data() {
    return {
      stores: [],
      loading: false
    }
  },
  mounted() {
    this.fetchStaffStores()
  },
  methods: {
    async fetchStaffStores() {
      this.loading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff-stores`)
        if (!response.ok) throw new Error('Failed to fetch staff stores')
        this.stores = await response.json()
      } catch (error) {
        console.error('Error fetching staff stores:', error)
        this.stores = []
      } finally {
        this.loading = false
      }
    },
    openStore(staffId) {
      this.$router.push(`/staff-store/${staffId}`)
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http')) return imagePath
      if (imagePath.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/${imagePath}`
    }
  }
}
</script>

<style scoped>
.staff-stores-section {
  background: rgba(36, 36, 66, 0.6);
  border-radius: 16px;
  padding: 32px 24px;
  margin: 24px 0;
  border: 1px solid rgba(129, 199, 132, 0.2);
  backdrop-filter: blur(10px);
}

.section-header {
  margin-bottom: 28px;
  text-align: left;
}

.section-header h2 {
  font-size: 1.8em;
  color: #4CAF50;
  margin-bottom: 8px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95em;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  font-size: 3em;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #4CAF50;
  font-size: 1em;
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.store-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%);
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.store-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.store-card:hover {
  transform: translateY(-8px);
  border-color: #4CAF50;
  box-shadow: 0 12px 32px rgba(76, 175, 80, 0.2);
}

.store-card:hover::before {
  opacity: 1;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.store-logo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(76, 175, 80, 0.2);
}

.store-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 2.5em;
}

.store-status {
  display: flex;
  gap: 8px;
}

.status-badge {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
}

.store-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.store-name {
  font-size: 1.3em;
  color: #81C784;
  margin: 0;
  font-weight: 700;
}

.store-description {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.9em;
  line-height: 1.4;
}

.store-stats {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8em;
}

.stat-value {
  color: #4CAF50;
  font-size: 1.3em;
  font-weight: 700;
}

.store-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(76, 175, 80, 0.2);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
}

.detail-icon {
  font-size: 1.1em;
  color: #4CAF50;
}

.btn-visit-store {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn-visit-store:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: rgba(255, 255, 255, 0.7);
  margin: 12px 0;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}
</style>
