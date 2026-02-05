<template>
  <div class="user-layout">
    <UserNavbar />
    
    <div class="store-container">
      <!-- Store Header -->
      <div class="store-header" v-if="seller">
        <div class="store-logo">
          <img v-if="seller.store_logo" :src="getImageUrl(seller.store_logo)" :alt="seller.store_name" />
          <div v-else class="default-logo">🥥</div>
        </div>
        <div class="store-info">
          <h1>{{ seller.store_name }}</h1>
          <p>{{ seller.store_description }}</p>
          <div class="store-contact" v-if="seller.contact_number">
            <span>📞 {{ seller.contact_number }}</span>
          </div>
        </div>
        <button @click="$router.go(-1)" class="btn-back">← Back to Sellers</button>
      </div>

      <!-- Products Grid -->
      <div class="products-section">
        <h2>📦 Available Products</h2>
        
        <div v-if="loading" class="loading">
          <div class="loading-spinner">⏳</div>
          <p>Loading products...</p>
        </div>

        <div v-else-if="products.length > 0" class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-image">
              <img v-if="product.product_picture" :src="getImageUrl(product.product_picture)" :alt="product.size" />
              <div v-else class="no-image">🥥</div>
            </div>
            
            <div class="product-info">
              <h3>{{ product.size }}</h3>
              <p class="product-details">
                <span>📏 {{ product.length }} cm</span>
                <span class="stock-badge" :class="{ 'low-stock': product.stock < 10 }">
                  📦 {{ product.stock }} in stock
                </span>
              </p>
            </div>
            
            <button @click="addToCart(product)" class="btn-add-cart" :disabled="product.stock === 0">
              <span v-if="product.stock > 0">🛒 Add to Cart</span>
              <span v-else>Out of Stock</span>
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No Products Available</h3>
          <p>This seller doesn't have any products in stock right now</p>
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
      token: null
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

.store-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.store-header {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.store-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.store-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 2.5em;
  color: white;
}

.store-info {
  flex-grow: 1;
}

.store-info h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 2em;
}

.store-info p {
  color: #666;
  margin: 0 0 10px 0;
}

.store-contact {
  color: #667eea;
  font-weight: 500;
}

.btn-back {
  padding: 12px 24px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #667eea;
  color: white;
}

.products-section h2 {
  color: white;
  font-size: 1.8em;
  margin-bottom: 30px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 3em;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.3em;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #666;
}

.stock-badge {
  padding: 4px 10px;
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border-radius: 6px;
  display: inline-block;
  font-weight: 600;
  font-size: 0.9em;
}

.stock-badge.low-stock {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

.btn-add-cart {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add-cart:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-add-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.alert {
  position: fixed;
  top: 100px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
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
  background: #d4edda;
  color: #155724;
}

@media (max-width: 768px) {
  .store-header {
    flex-direction: column;
    text-align: center;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
