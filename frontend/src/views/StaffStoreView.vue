<template>
  <div class="staff-store-layout">
    <UserNavbar />

    <div class="store-container">
      <!-- Store Header -->
      <div v-if="storeInfo && !loading" class="store-header-banner">
        <div class="store-header-content">
          <div class="store-logo-large">
            <img v-if="storeInfo.store_logo" :src="getImageUrl(storeInfo.store_logo)" :alt="storeInfo.store_name" />
            <div v-else class="default-logo">🥥</div>
          </div>

          <div class="store-info-section">
            <h1>{{ storeInfo.store_name || storeInfo.staff_name }}</h1>
            <p class="store-desc">{{ storeInfo.store_description || 'Quality coconut products' }}</p>

            <div class="store-meta">
              <div class="meta-item" v-if="storeInfo.contact_number">
                <span class="meta-icon">📞</span>
                <span>{{ storeInfo.contact_number }}</span>
              </div>
              <div class="meta-item" v-if="storeInfo.store_address">
                <span class="meta-icon">📍</span>
                <span>{{ storeInfo.store_address }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span>{{ storeInfo.staff_name }}</span>
              </div>
            </div>

            <div class="store-quick-stats">
              <div class="quick-stat">
                <span class="quick-stat-value">{{ storeInfo.product_count }}</span>
                <span class="quick-stat-label">Products</span>
              </div>
              <div class="quick-stat">
                <span class="quick-stat-value">{{ storeInfo.total_stock }}</span>
                <span class="quick-stat-label">In Stock</span>
              </div>
              <div class="quick-stat">
                <span class="quick-stat-value" v-if="storeInfo.is_active">✓</span>
                <span class="quick-stat-value" v-else>✗</span>
                <span class="quick-stat-label">Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="products-section">
        <div class="section-title">
          <h2>📦 Products from {{ storeInfo?.store_name || storeInfo?.staff_name }}</h2>
          <p v-if="products.length > 0">{{ products.length }} available products</p>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner">⏳</div>
          <p>Loading products...</p>
        </div>

        <div v-else-if="products.length > 0" class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-image">
              <img v-if="product.product_picture" :src="getImageUrl(product.product_picture)" :alt="product.size" />
              <div v-else class="default-product-image">📦</div>
              <span class="stock-badge" :class="{ low: product.stock < 10 }">
                {{ product.stock }} in stock
              </span>
            </div>

            <div class="product-info">
              <h3>{{ product.size }}</h3>
              <p class="product-spec">
                <span class="spec-label">Length:</span>
                <span class="spec-value">{{ product.length }} cm</span>
              </p>
              
              <div class="product-actions">
                <button @click="addToCart(product)" class="btn-add-cart">
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-products">
          <div class="empty-icon">📦</div>
          <h3>No Products Available</h3>
          <p>This store currently has no available products</p>
          <router-link to="/sellers" class="btn-back">Browse Other Sellers</router-link>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="alert success">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert error">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import UserNavbar from '../components/UserNavbar.vue'

export default {
  name: 'StaffStoreView',
  components: {
    UserNavbar
  },
  data() {
    return {
      staffId: null,
      storeInfo: null,
      products: [],
      loading: true,
      successMessage: '',
      errorMessage: '',
      token: null
    }
  },
  mounted() {
    this.staffId = this.$route.params.staffId
    this.token = localStorage.getItem('token')
    this.fetchStoreData()
  },
  methods: {
    async fetchStoreData() {
      this.loading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff-stores/${this.staffId}/products`)
        if (!response.ok) throw new Error('Failed to fetch store data')
        const data = await response.json()
        this.storeInfo = data.store_info
        this.products = data.products
      } catch (error) {
        console.error('Error fetching store data:', error)
        this.errorMessage = 'Failed to load store. Please try again.'
        this.storeInfo = { store_name: 'Store', staff_name: 'Staff Member' }
        this.products = []
      } finally {
        this.loading = false
      }
    },
    addToCart(product) {
      if (!this.token) {
        this.errorMessage = 'Please log in to add items to cart'
        this.$router.push('/login')
        return
      }

      if (product.stock <= 0) {
        this.errorMessage = 'This product is out of stock'
        return
      }

      try {
        let cart = localStorage.getItem('cartItems')
        cart = cart ? JSON.parse(cart) : []

        const existingItem = cart.find(item => item.id === product.id)
        
        if (existingItem) {
          existingItem.quantity += 1
        } else {
          cart.push({
            id: product.id,
            size: product.size,
            length: product.length,
            quantity: 1,
            staff_id: product.staff_id,
            store_name: product.store_name
          })
        }

        localStorage.setItem('cartItems', JSON.stringify(cart))
        
        this.successMessage = `✓ Added ${product.size} to cart!`
        setTimeout(() => {
          this.successMessage = ''
        }, 3000)
      } catch (error) {
        console.error('Error adding to cart:', error)
        this.errorMessage = 'Error adding to cart'
      }
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
.staff-store-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 80px;
}

.store-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.store-header-banner {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%);
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  padding: 40px 30px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
}

.store-header-content {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.store-logo-large {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(76, 175, 80, 0.3);
  flex-shrink: 0;
}

.store-logo-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 4em;
}

.store-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.store-info-section h1 {
  font-size: 2.5em;
  color: #4CAF50;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
}

.store-desc {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1.1em;
  line-height: 1.5;
}

.store-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid rgba(76, 175, 80, 0.2);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95em;
}

.meta-icon {
  font-size: 1.2em;
  color: #4CAF50;
}

.store-quick-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.quick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  min-width: 80px;
}

.quick-stat-value {
  font-size: 1.8em;
  color: #81C784;
  font-weight: 700;
}

.quick-stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8em;
}

.products-section {
  background: rgba(36, 36, 66, 0.6);
  border-radius: 16px;
  padding: 32px 24px;
  border: 1px solid rgba(129, 199, 132, 0.2);
}

.section-title {
  margin-bottom: 28px;
}

.section-title h2 {
  font-size: 1.8em;
  color: #4CAF50;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.section-title p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
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
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.product-card {
  background: rgba(36, 36, 66, 0.8);
  border: 1px solid rgba(129, 199, 132, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-6px);
  border-color: #4CAF50;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);
}

.product-image {
  width: 100%;
  height: 180px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-product-image {
  font-size: 3em;
}

.stock-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 600;
}

.stock-badge.low {
  background: rgba(255, 152, 0, 0.9);
}

.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.product-info h3 {
  font-size: 1.1em;
  color: #81C784;
  margin: 0;
  font-weight: 600;
}

.product-spec {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
  margin: 0;
}

.spec-label {
  color: rgba(255, 255, 255, 0.5);
}

.spec-value {
  color: #4CAF50;
  font-weight: 600;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn-add-cart {
  flex: 1;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.btn-add-cart:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.empty-products {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-products h3 {
  color: rgba(255, 255, 255, 0.7);
  margin: 12px 0;
}

.empty-products p {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
}

.btn-back {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-back:hover {
  transform: translateY(-2px);
}

.alert {
  position: fixed;
  top: 100px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 600;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
  }
  to {
    transform: translateX(0);
  }
}

.alert.success {
  background: #4CAF50;
  color: white;
}

.alert.error {
  background: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .store-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .store-meta {
    justify-content: center;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
