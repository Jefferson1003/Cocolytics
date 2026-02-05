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
        <div v-for="seller in sellers" :key="seller.staff_id" class="seller-card" @click="viewSellerProducts(seller.staff_id)">
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
      this.$router.push(`/sellers/${sellerId}`)
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
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 80px;
}

.sellers-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 50px;
}

.header h1 {
  font-size: 2.8em;
  color: #4CAF50;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
}

.header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.3em;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: #4CAF50;
}

.loading-spinner {
  font-size: 4em;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  font-size: 1.2em;
  color: #ddd;
}

.sellers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
}

.seller-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(10px);
}

.seller-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4);
  border-color: rgba(76, 175, 80, 0.6);
}

.seller-logo {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
  border: 3px solid rgba(76, 175, 80, 0.2);
}

.seller-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 3.5em;
  color: white;
}

.seller-info {
  text-align: center;
  flex-grow: 1;
}

.seller-info h3 {
  margin: 0 0 10px 0;
  color: #4CAF50;
  font-size: 1.6em;
  font-weight: 700;
}

.seller-description {
  color: #ddd;
  margin: 0 0 20px 0;
  line-height: 1.6;
  min-height: 50px;
}

.seller-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #81C784;
  font-size: 1em;
  font-weight: 600;
}

.stat-icon {
  font-size: 1.3em;
}

.stat-value {
  color: #4CAF50;
}

.seller-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4CAF50;
  font-weight: 600;
  padding: 8px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
}

.contact-icon {
  font-size: 1.2em;
}

.btn-view-store {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.15em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-view-store:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, #45a049 0%, #388E3C 100%);
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.4) 0%, rgba(30, 30, 63, 0.6) 100%);
  border: 2px dashed rgba(76, 175, 80, 0.3);
  border-radius: 16px;
}

.empty-icon {
  font-size: 6em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #4CAF50;
  font-size: 2em;
  margin-bottom: 10px;
  font-weight: 700;
}

.empty-state p {
  color: #ddd;
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .sellers-grid {
    grid-template-columns: 1fr;
  }

  .header h1 {
    font-size: 2.2em;
  }

  .header p {
    font-size: 1.1em;
  }
}
</style>
