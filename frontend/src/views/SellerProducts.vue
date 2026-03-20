<template>
  <div :class="isClientUser ? 'client-store-layout' : 'staff-layout'">
    <StaffSidebar v-if="!isClientUser" />
    
    <div class="store-dashboard-container">
      <!-- Trader Banner -->
      <div class="store-banner" v-if="seller">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <div class="store-logo-large">
            <img v-if="seller.store_logo" :src="getImageUrl(seller.store_logo)" :alt="seller.store_name" />
            <div v-else class="default-logo-large" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/>
                <path d="M9 10.5h.01M15 10.5h.01M9.5 15c.6.6 1.4 1 2.5 1s1.9-.4 2.5-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <div class="store-main-info">
            <h1>{{ seller.store_name }}</h1>
            <p class="store-tagline">{{ seller.store_description }}</p>
            <div class="store-meta">
              <span v-if="seller.contact_number" class="meta-item">
                <span class="icon small" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4h3l1.5 4L8.5 9.5a14 14 0 0 0 6 6l1.5-2L20 15v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                  </svg>
                </span>
                {{ seller.contact_number }}
              </span>
              <span class="meta-item">
                <span class="icon small" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10h16v9H4v-9Zm2-5h12l2 5H4l2-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  </svg>
                </span>
                {{ products.length }} Products
              </span>
              <span class="meta-item">
                <span class="icon small" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M6 19a6 6 0 0 1 12 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                Available Now
              </span>
            </div>
            <div class="store-actions">
              <button v-if="isTraderUser" @click="messageTrader" class="btn-message-trader-banner">
                <span class="icon small" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6h16v10H8l-4 4V6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  </svg>
                </span>
                Message Trader
              </button>
            </div>
          </div>
          <button @click="$router.push('/sellers')" class="btn-back-float">← All Traders</button>
        </div>
      </div>

      <!-- Trader Stats Cards -->
      <div class="stats-section" v-if="!loading">
        <div class="stat-card">
          <div class="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h16v9H4v-9Zm2-5h12l2 5H4l2-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ products.length }}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19h16M7 15V9m5 6V6m5 9v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalStock }}</h3>
            <p>Items in Stock</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="m6 12 4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ availableProducts }}</h3>
            <p>Available Now</p>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="products-section">
        <div class="section-header">
          <h2>
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h16v9H4v-9Zm2-5h12l2 5H4l2-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              </svg>
            </span>
            Shop Products
          </h2>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search products..." 
            class="search-input"
          />
        </div>
        
        <div v-if="loading" class="loading">
          <div class="loading-spinner" aria-hidden="true"></div>
          <p>Loading trader products...</p>
        </div>

        <div v-else-if="filteredProducts.length > 0" class="products-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card">
            <div class="product-image">
              <img v-if="product.product_picture" :src="getImageUrl(product.product_picture)" :alt="product.size" />
              <div v-else class="no-image" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M9 10.5h.01M15 10.5h.01M9.5 15c.6.6 1.4 1 2.5 1s1.9-.4 2.5-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="stock-indicator" :class="getStockClass(product.stock)">
                <span v-if="product.stock === 0">Out of Stock</span>
                <span v-else-if="product.stock < 5">Critical</span>
                <span v-else-if="product.stock < 10">Low Stock</span>
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
            
            <div v-if="product.stock > 0" class="cart-controls">
              <div class="quantity-selector">
                <button @click="decreaseQuantity(product.id)" class="qty-btn" :disabled="getProductQuantity(product.id) <= 1">−</button>
                <input 
                  type="number" 
                  :value="getProductQuantity(product.id)"
                  @input="setProductQuantity(product.id, $event.target.value, product.stock)"
                  min="1"
                  :max="product.stock"
                  class="qty-input"
                />
                <button @click="increaseQuantity(product.id, product.stock)" class="qty-btn" :disabled="getProductQuantity(product.id) >= product.stock">+</button>
              </div>
              <div class="action-buttons">
                <button @click="addToCart(product)" class="btn-add-cart">
                  <span class="icon small" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6h2l2 10h9l2-7H7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="10" cy="19" r="1.4" fill="currentColor"/>
                      <circle cx="17" cy="19" r="1.4" fill="currentColor"/>
                    </svg>
                  </span>
                  Add to Cart
                </button>
                <button @click="buyNow(product)" class="btn-buy-now">
                  <span class="icon small" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v8m0 0 3-3m-3 3-3-3M5 14h14v6H5v-6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  Buy Now
                </button>
              </div>
            </div>
            <button v-else class="btn-add-cart" disabled>
              Out of Stock
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h16v9H4v-9Zm2-5h12l2 5H4l2-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No Products Found</h3>
          <p v-if="searchQuery">Try adjusting your search</p>
          <p v-else>This trader doesn't have any products in stock right now</p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      <span class="alert-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m6 12 4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-error">
      <span class="alert-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'SellerProducts',
  components: {
    StaffSidebar
  },
  data() {
    return {
      seller: null,
      products: [],
      loading: false,
      successMessage: '',
      errorMessage: '',
      token: null,
      user: null,
      searchQuery: '',
      productQuantities: {}
    }
  },
  computed: {
    userRole() {
      return this.user?.role || null
    },
    isClientUser() {
      return this.userRole === 'user'
    },
    isTraderUser() {
      return this.userRole === 'staff' || this.userRole === 'admin'
    },
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
    const userData = localStorage.getItem('user')
    this.user = userData ? JSON.parse(userData) : null
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
        // Initialize quantities for all products
        data.forEach(product => {
          this.productQuantities[product.id] = 1
        })
        if (data.length > 0) {
          this.seller = {
            staff_id: data[0].staff_id,
            store_name: data[0].store_name || `${data[0].staff_name}'s Trader`,
            staff_name: data[0].staff_name,
            store_logo: data[0].store_logo,
            contact_number: data[0].contact_number,
            store_description: data[0].store_description || 'Quality coconut products'
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },
    async messageTrader() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.errorMessage = 'Please login first'
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
          return
        }

        // Get user info to verify they are staff/admin
        const userData = localStorage.getItem('user')
        const user = userData ? JSON.parse(userData) : null
        
        if (!user || !['staff', 'admin'].includes(user.role)) {
          this.errorMessage = 'Only traders (staff) can message other traders'
          setTimeout(() => this.errorMessage = '', 5000)
          return
        }

        if (!this.seller || !this.seller.staff_id) {
          this.errorMessage = 'Trader information not available'
          setTimeout(() => this.errorMessage = '', 3000)
          return
        }

        console.log('Starting chat with trader:', this.seller.staff_id)

        // Create or get existing conversation
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`,
          { recipient_id: this.seller.staff_id },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        console.log('Chat conversation created/retrieved:', response.data)

        // Navigate to chat page with conversation selected
        this.$router.push({
          path: '/chat',
          query: { conversation: response.data.conversation_id }
        })
      } catch (error) {
        console.error('Error starting chat:', error)
        console.error('Error details:', error.response)
        
        let errorMsg = 'Failed to start chat. '
        
        if (error.response) {
          // Server responded with error
          if (error.response.status === 403) {
            errorMsg = 'You do not have permission to message traders. Only staff/admin can chat.'
          } else if (error.response.status === 401) {
            errorMsg = 'Please login again. Your session may have expired.'
          } else if (error.response.status === 404) {
            errorMsg = 'Trader not found or not available for chat.'
          } else {
            errorMsg = error.response.data?.message || errorMsg + 'Please try again.'
          }
        } else if (error.request) {
          // Request made but no response
          errorMsg = 'Cannot connect to server. Please check if the backend is running.'
        } else {
          errorMsg = error.message || errorMsg + 'Please try again.'
        }
        
        this.errorMessage = errorMsg
        setTimeout(() => this.errorMessage = '', 5000)
      }
    },
    getProductQuantity(productId) {
      return this.productQuantities[productId] || 1
    },
    setProductQuantity(productId, value, maxStock) {
      let qty = parseInt(value)
      if (isNaN(qty) || qty < 1) qty = 1
      if (qty > maxStock) qty = maxStock
      this.productQuantities[productId] = qty
    },
    increaseQuantity(productId, maxStock) {
      const current = this.getProductQuantity(productId)
      if (current < maxStock) {
        this.productQuantities[productId] = current + 1
      }
    },
    decreaseQuantity(productId) {
      const current = this.getProductQuantity(productId)
      if (current > 1) {
        this.productQuantities[productId] = current - 1
      }
    },
    addToCart(product) {
      if (!this.token) {
        this.errorMessage = 'Please log in to add items to cart'
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
        return
      }

      if (product.stock <= 0) {
        this.errorMessage = 'This product is out of stock'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      try {
        const quantityToAdd = this.getProductQuantity(product.id)
        let cart = localStorage.getItem('cartItems')
        cart = cart ? JSON.parse(cart) : []

        const existingItem = cart.find(item => item.id === product.id)
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantityToAdd
          if (newQuantity <= product.stock) {
            existingItem.quantity = newQuantity
          } else {
            this.errorMessage = 'Cannot add more than available stock'
            setTimeout(() => this.errorMessage = '', 3000)
            return
          }
        } else {
          cart.push({
            id: product.id,
            size: product.size,
            length: product.length,
            quantity: quantityToAdd,
            staff_id: product.staff_id,
            store_name: product.store_name || this.seller?.store_name
          })
        }

        localStorage.setItem('cartItems', JSON.stringify(cart))
        
        this.successMessage = `Added ${quantityToAdd} x ${product.size} to cart.`
        // Reset quantity to 1 after adding
        this.productQuantities[product.id] = 1
        setTimeout(() => {
          this.successMessage = ''
        }, 3000)
      } catch (error) {
        console.error('Error adding to cart:', error)
        this.errorMessage = 'Error adding to cart'
        setTimeout(() => this.errorMessage = '', 3000)
      }
    },
    buyNow(product) {
      if (!this.token) {
        this.errorMessage = 'Please log in to continue'
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
        return
      }

      if (product.stock <= 0) {
        this.errorMessage = 'This product is out of stock'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      try {
        const quantityToAdd = this.getProductQuantity(product.id)
        let cart = localStorage.getItem('cartItems')
        cart = cart ? JSON.parse(cart) : []

        const existingItem = cart.find(item => item.id === product.id)
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantityToAdd
          if (newQuantity <= product.stock) {
            existingItem.quantity = newQuantity
          } else {
            this.errorMessage = 'Cannot add more than available stock'
            setTimeout(() => this.errorMessage = '', 3000)
            return
          }
        } else {
          cart.push({
            id: product.id,
            size: product.size,
            length: product.length,
            quantity: quantityToAdd,
            staff_id: product.staff_id,
            store_name: product.store_name || this.seller?.store_name
          })
        }

        localStorage.setItem('cartItems', JSON.stringify(cart))
        
        // Reset quantity to 1
        this.productQuantities[product.id] = 1
        
        // Redirect to checkout page
        this.$router.push({
          path: '/orders/tracking',
          query: { checkout: '1' }
        })
      } catch (error) {
        console.error('Error processing buy now:', error)
        this.errorMessage = 'Error processing purchase'
        setTimeout(() => this.errorMessage = '', 3000)
      }
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
.staff-layout,
.client-store-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.2), transparent 30%),
    radial-gradient(circle at right center, rgba(118, 75, 162, 0.16), transparent 28%),
    linear-gradient(135deg, #121428 0%, #1a1a2e 44%, #242442 100%);
  background-attachment: fixed;
  padding-top: 80px;
}

.store-dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* Trader Banner */
.store-banner {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(22, 33, 62, 0.98) 100%);
  border: 1px solid rgba(100, 150, 255, 0.22);
  border-radius: 18px;
  padding: 50px 40px;
  margin-bottom: 40px;
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.28);
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.22) 0%, rgba(118, 75, 162, 0.26) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.store-logo-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo-large {
  width: 52px;
  height: 52px;
  color: rgba(225, 236, 255, 0.88);
}

.default-logo-large svg {
  width: 100%;
  height: 100%;
}

.store-main-info {
  flex: 1;
}

.store-main-info h1 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 2.25em;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.store-tagline {
  color: rgba(214, 224, 255, 0.82);
  font-size: 1.05em;
  margin: 0 0 15px 0;
}

.store-meta {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.meta-item {
  color: rgba(255, 255, 255, 0.82);
  font-weight: 600;
  font-size: 0.95em;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.store-actions {
  margin-top: 15px;
}

.btn-message-trader-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: rgba(100, 150, 255, 0.18);
  color: white;
  border: 1px solid rgba(100, 150, 255, 0.45);
  border-radius: 12px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(74, 111, 196, 0.28);
}

.btn-message-trader-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 111, 196, 0.34);
  background: rgba(100, 150, 255, 0.24);
}

.btn-back-float {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.08);
  color: #dfe5ff;
  border: 1px solid rgba(100, 150, 255, 0.35);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.3s;
}

.btn-back-float:hover {
  background: rgba(100, 150, 255, 0.18);
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
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(22, 33, 62, 0.98) 100%);
  border: 1px solid rgba(100, 150, 255, 0.22);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.18);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgba(100, 150, 255, 0.2);
}

.stat-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(100, 150, 255, 0.16);
  color: rgba(175, 205, 255, 0.95);
  border-radius: 12px;
}

.stat-icon svg {
  width: 30px;
  height: 30px;
}

.stat-content h3 {
  margin: 0;
  color: #dce8ff;
  font-size: 2.2em;
  font-weight: 700;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: rgba(214, 224, 255, 0.82);
  font-size: 1em;
}

/* Products Section */
.products-section {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.96) 0%, rgba(22, 33, 62, 0.98) 100%);
  border: 1px solid rgba(100, 150, 255, 0.22);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 18px 40px rgba(5, 8, 20, 0.24);
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
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #dce8ff;
  font-size: 1.8em;
  font-weight: 700;
}

.search-input {
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  width: 300px;
  font-size: 1em;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.72);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
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
  background: linear-gradient(135deg, rgba(20, 25, 45, 0.95) 0%, rgba(18, 28, 50, 0.98) 100%);
  border: 1px solid rgba(100, 150, 255, 0.18);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 30px rgba(100, 150, 255, 0.22);
  border-color: rgba(100, 150, 255, 0.38);
}

.product-image {
  position: relative;
  width: 100%;
  height: 220px;
  background: rgba(20, 27, 46, 0.7);
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
  width: 64px;
  height: 64px;
  color: rgba(225, 236, 255, 0.5);
}

.no-image svg {
  width: 100%;
  height: 100%;
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
  color: #dce8ff;
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
  color: #81c784;
}

.cart-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 8px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  background: rgba(100, 150, 255, 0.18);
  color: white;
  border: 1px solid rgba(100, 150, 255, 0.35);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.3em;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: rgba(100, 150, 255, 0.3);
  transform: scale(1.05);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-input {
  width: 60px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  text-align: center;
  font-size: 1.1em;
  font-weight: 600;
}

.qty-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.72);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-input[type=number] {
  -moz-appearance: textfield;
}

.action-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn-add-cart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 14px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.05em;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add-cart:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049 0%, #388E3C 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  transform: translateY(-2px);
}

.btn-add-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #666;
}

.btn-buy-now {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #5b6fd6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.05em;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-buy-now:hover:not(:disabled) {
  background: linear-gradient(135deg, #5b6fd6 0%, #4f63c4 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.btn-buy-now:disabled {
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
  width: 44px;
  height: 44px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: rgba(175, 205, 255, 0.95);
  border-radius: 50%;
  margin: 0 auto;
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
  width: 72px;
  height: 72px;
  color: rgba(225, 236, 255, 0.52);
  margin: 0 auto;
  margin-bottom: 20px;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  color: #dce8ff;
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

.alert-error {
  background: #f44336;
  color: white;
  font-weight: 600;
}

.alert-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  flex-shrink: 0;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

.icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  flex-shrink: 0;
}

.icon.small {
  width: 16px;
  height: 16px;
}

.icon svg {
  width: 100%;
  height: 100%;
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
