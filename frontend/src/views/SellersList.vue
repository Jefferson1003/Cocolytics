<template>
  <div class="user-layout">
    <UserNavbar />
    
    <div class="sellers-container">
      <div class="header">
        <h1>🛍️ Choose Your Seller</h1>
        <p>Browse products from our trusted coconut sellers</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner">⏳</div>
        <p>Loading sellers...</p>
      </div>

      <div v-else-if="sellers.length > 0" class="sellers-grid">
        <div v-for="seller in sellers" :key="seller.user_id" class="seller-card" @click="viewSellerProducts(seller.user_id)">
          <div class="seller-logo">
            <img v-if="seller.store_logo" :src="getImageUrl(seller.store_logo)" :alt="seller.store_name" />
            <div v-else class="default-logo">🥥</div>
          </div>
          
          <div class="seller-info">
            <h3>{{ seller.store_name || `${seller.name}'s Store` }}</h3>
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
          
          <button class="btn-view-store">
            View Store →
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🏪</div>
        <h3>No Sellers Available</h3>
        <p>Check back later for available sellers</p>
      </div>
    </div>
  </div>
</template>

<script>
import UserNavbar from '../components/UserNavbar.vue'

export default {
  name: 'SellersList',
  components: {
    UserNavbar
  },
  data() {
    return {
      sellers: [],
      loading: false,
      token: null
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    this.fetchSellers()
  },
  methods: {
    async fetchSellers() {
      this.loading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sellers`)
        if (!response.ok) throw new Error('Failed to fetch sellers')
        const data = await response.json()
        this.sellers = data.filter(s => s.product_count > 0) // Only show sellers with products
      } catch (error) {
        console.error('Error fetching sellers:', error)
      } finally {
        this.loading = false
      }
    },
    viewSellerProducts(sellerId) {
      this.$router.push(`/sellers/${sellerId}/products`)
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
.user-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 80px;
}

.sellers-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 50px;
}

.header h1 {
  font-size: 2.5em;
  color: white;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2em;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.loading-spinner {
  font-size: 3em;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sellers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.seller-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.seller-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.seller-logo {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.seller-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 3em;
  color: white;
}

.seller-info {
  text-align: center;
  flex-grow: 1;
}

.seller-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.5em;
  font-weight: 700;
}

.seller-description {
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.seller-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-size: 0.95em;
}

.stat-icon {
  font-size: 1.2em;
}

.seller-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #667eea;
  font-weight: 500;
}

.btn-view-store {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view-store:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.empty-icon {
  font-size: 5em;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.8em;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .sellers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
