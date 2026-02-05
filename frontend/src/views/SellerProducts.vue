<template>
  <div class="user-layout">
    <UserNavbar />
    
    <div class="store-dashboard-container">
      <!-- Store Header Banner -->
      <div class="store-banner" v-if="seller">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <div class="store-logo-large">
            <img v-if="seller.store_logo" :src="getImageUrl(seller.store_logo)" :alt="seller.store_name" />
            <div v-else class="default-logo-large">🥥</div>
          </div>
          <div class="store-main-info">
            <h1>{{ seller.store_name }}</h1>
            <p class="store-tagline">{{ seller.store_description }}</p>
            <div class="store-meta">
              <span v-if="seller.contact_number" class="meta-item">📞 {{ seller.contact_number }}</span>
              <span class="meta-item">📦 {{ products.length }} Products</span>
              <span class="meta-item">🏪 Available Now</span>
            </div>
          </div>
          <button @click="$router.push('/sellers')" class="btn-back-float">← All Sellers</button>
        </div>
      </div>

      <!-- Store Stats Cards -->
      <div class="stats-section" v-if="!loading">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>{{ products.length }}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ totalStock }}</h3>
            <p>Items in Stock</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ availableProducts }}</h3>
            <p>Available Now</p>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="products-section">
        <div class="section-header">
          <h2>🛒 Shop Products</h2>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search products..." 
            class="search-input"
          />
        </div>
        
        <div v-if="loading" class="loading">
          <div class="loading-spinner">⏳</div>
          <p>Loading store products...</p>
        </div>

        <div v-else-if="filteredProducts.length > 0" class="products-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card">
            <div class="product-image">
              <img v-if="product.product_picture" :src="getImageUrl(product.product_picture)" :alt="product.size" />
              <div v-else class="no-image">🥥</div>
              <div class="stock-indicator" :class="getStockClass(product.stock)">
                <span v-if="product.stock === 0">⛔ Out of Stock</span>
                <span v-else-if="product.stock < 5">⚠️ Critical</span>
                <span v-else-if="product.stock < 10">⚠️ Low Stock</span>
              </div>
            </div>
            
            <div class="product-info">
              <h3>{{ product.size }}</h3>
              <div class="info-row">
                <span class="info-label">Length:</span>
                <span class="info-value">{{ product.length }} cm</span>
              </div>
              <div class="info-row">
                <span class="info-label">Stock:</span>
                <span class="info-value stock-value">{{ product.stock }} units</span>
              </div>
              <div class="info-row">
                <span class="info-label">ID:</span>
                <span class="info-value">#{{ product.id }}</span>
              </div>
            </div>
            
            <button @click="addToCart(product)" class="btn-add-cart" :disabled="product.stock === 0">
              <span v-if="product.stock > 0">🛒 Add to Cart</span>
              <span v-else>⛔ Out of Stock</span>
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No Products Found</h3>
          <p v-if="searchQuery">Try adjusting your search</p>
          <p v-else>This store doesn't have any products in stock right now</p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      <span class="alert-icon">✓</span>
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import UserNavbar from '../components/UserNavbar.vue'

export default {
  name: 'SellerProducts',
  components: {
    UserNavbar
  },
  data() {
    return {
      seller: null,
      products: [],
      loading: false,
      successMessage: '',
      token: null,
      searchQuery: ''
    }
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products
      const query = this.searchQuery.toLowerCase()
      return this.products.filter(p => 
        p.size.toLowerCase().includes(query) || 
        p.length.toString().includes(query)
      )
    },
    totalStock() {
      return this.products.reduce((sum, p) => sum + p.stock, 0)
    },
    availableProducts() {
      return this.products.filter(p => p.stock > 0).length
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    this.fetchSellerProducts()
  },
  methods: {
    async fetchSellerProducts() {
      this.loading = true
      const sellerId = this.$route.params.sellerId
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sellers/${sellerId}/products`)
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        
        this.products = data
        if (data.length > 0) {
          this.seller = {
            store_name: data[0].store_name || `${data[0].staff_name}'s Store`,
            staff_name: data[0].staff_name,
            store_description: 'Quality coconut products'
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },
    addToCart(product) {
      // Add to cart logic here
      this.successMessage = `Added ${product.size} to cart!`
      setTimeout(() => this.successMessage = '', 3000)
    },
    getStockClass(stock) {
      if (stock === 0) return 'out-of-stock'
      if (stock < 5) return 'critical-stock'
      if (stock < 10) return 'low-stock'
      return ''
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

.store-dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* Store Banner */
.store-banner {
  position: relative;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(56, 142, 60, 0.9) 100%);
  border-radius: 20px;
  padding: 50px 40px;
  margin-bottom: 40px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0,0,0,0.1) 0%, transparent 100%);
  pointer-events: none;
}

.banner-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 30px;
}

.store-logo-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.store-logo-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo-large {
  font-size: 4em;
  color: #4CAF50;
}

.store-main-info {
  flex: 1;
}

.store-main-info h1 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 2.8em;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.store-tagline {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.2em;
  margin: 0 0 15px 0;
}

.store-meta {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
}

.meta-item {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 1.05em;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.btn-back-float {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05em;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.btn-back-float:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-5px);
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(76, 175, 80, 0.3);
}

.stat-icon {
  font-size: 3em;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 12px;
}

.stat-content h3 {
  margin: 0;
  color: #4CAF50;
  font-size: 2.5em;
  font-weight: 700;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #ddd;
  font-size: 1.1em;
}

/* Products Section */
.products-section {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-header h2 {
  margin: 0;
  color: #4CAF50;
  font-size: 2em;
  font-weight: 700;
}

.search-input {
  padding: 12px 20px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 10px;
  width: 300px;
  font-size: 1em;
  background: rgba(30, 30, 63, 0.7);
  color: #fff;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.search-input::placeholder {
  color: #888;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  background: linear-gradient(135deg, rgba(45, 78, 76, 0.5) 0%, rgba(30, 30, 63, 0.7) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.5);
}

.product-image {
  position: relative;
  width: 100%;
  height: 220px;
  background: rgba(30, 30, 63, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 4em;
  color: rgba(76, 175, 80, 0.3);
}

.stock-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85em;
  backdrop-filter: blur(10px);
}

.out-of-stock {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.critical-stock {
  background: rgba(255, 152, 0, 0.9);
  color: white;
}

.low-stock {
  background: rgba(255, 193, 7, 0.9);
  color: white;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  margin: 0 0 15px 0;
  color: #4CAF50;
  font-size: 1.4em;
  font-weight: 700;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #aaa;
  font-size: 0.95em;
}

.info-value {
  color: #fff;
  font-weight: 600;
}

.stock-value {
  color: #4CAF50;
}

.btn-add-cart {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.05em;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add-cart:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049 0%, #388E3C 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-add-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #666;
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 5em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #4CAF50;
  margin-bottom: 10px;
  font-size: 1.8em;
}

.empty-state p {
  color: #aaa;
  font-size: 1.1em;
}

.alert {
  position: fixed;
  top: 100px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alert-success {
  background: #4CAF50;
  color: white;
  font-weight: 600;
}

.alert-icon {
  font-size: 1.3em;
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .store-main-info h1 {
    font-size: 2em;
  }

  .store-meta {
    justify-content: center;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }

  .search-input {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
