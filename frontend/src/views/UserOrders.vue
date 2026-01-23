<template>
  <div class="user-layout">
    <UserNavbar />
    
    <div class="orders-container">
      <div class="orders-header">
        <h1>🛒 Order Cocolumbers</h1>
        <p>Browse and order fresh cocolumber products</p>
      </div>

      <!-- Available Products -->
      <div class="available-products">
        <h2>📦 Available Products</h2>
        <div v-if="!loadingProducts">
          <div v-if="availableProducts.length > 0" class="products-grid">
            <div v-for="product in availableProducts" :key="product.id" class="product-card">
              <div class="product-image">
                <img v-if="product.product_picture" :src="getImageUrl(product.product_picture)" :alt="product.size" />
                <div v-else class="no-image">📷</div>
              </div>
              <div class="product-info">
                <h3>{{ product.size }}</h3>
                <p><strong>Length:</strong> {{ product.length }} cm</p>
                <p><strong>Available:</strong> {{ product.stock }} units</p>
                <p class="date">Added: {{ formatDate(product.created_at) }}</p>
              </div>
              <div class="product-footer">
                <div class="quantity-selector">
                  <button @click="decreaseQuantity(product.id)" class="qty-btn">−</button>
                  <input 
                    type="number" 
                    :value="orderQuantities[product.id] || 0" 
                    @input="updateQuantity(product.id, $event)"
                    min="0"
                    :max="product.stock"
                    class="qty-input"
                  />
                  <button @click="increaseQuantity(product.id, product.stock)" class="qty-btn">+</button>
                </div>
                <button 
                  @click="addToOrder(product)" 
                  class="btn-order"
                  :disabled="!orderQuantities[product.id] || orderQuantities[product.id] <= 0 || product.stock <= 0"
                >
                  Order
                </button>
              </div>
            </div>
          </div>
          <p v-else class="no-products">No products available yet.</p>
        </div>
        <div v-else class="loading">Loading products...</div>
      </div>

      <!-- Shopping Cart -->
      <div class="shopping-cart">
        <h2>🛒 Shopping Cart</h2>
        <div v-if="cartItems.length > 0" class="cart-items">
          <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
            <div class="item-info">
              <h4>{{ item.size }}</h4>
              <p>Length: {{ item.length }} cm | Quantity: {{ item.quantity }} units</p>
            </div>
            <button @click="removeFromCart(index)" class="btn-remove">Remove</button>
          </div>
          <div class="cart-summary">
            <p>Total Items: {{ totalItems }}</p>
          </div>
          <button @click="submitOrder" class="btn-checkout" :disabled="isSubmitting">
            <span v-if="!isSubmitting">✓ Place Order</span>
            <span v-else>Processing...</span>
          </button>
        </div>
        <p v-else class="empty-cart">Your cart is empty. Select products above to order.</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success">
        <span class="alert-icon">✓</span>
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-error">
        <span class="alert-icon">✕</span>
        {{ errorMessage }}
      </div>

      <!-- My Orders -->
      <div class="my-orders">
        <h2>📋 My Orders</h2>
        <div v-if="!loadingOrders">
          <div v-if="userOrders.length > 0" class="orders-list">
            <div v-for="order in userOrders" :key="order.id" class="order-card">
              <div class="order-header">
                <span class="order-id">Order #{{ order.id }}</span>
                <span :class="['order-status', 'status-' + order.status]">{{ order.status }}</span>
              </div>
              <div class="order-details">
                <p><strong>Product:</strong> {{ order.size }}</p>
                <p><strong>Length:</strong> {{ order.length }} cm</p>
                <p><strong>Quantity:</strong> {{ order.quantity }} units</p>
                <p class="order-date">{{ formatDate(order.created_at) }}</p>
              </div>
            </div>
          </div>
          <p v-else class="no-orders">You haven't placed any orders yet.</p>
        </div>
        <div v-else class="loading">Loading orders...</div>
      </div>
    </div>
  </div>
</template>

<script>
import UserNavbar from '../components/UserNavbar.vue'

export default {
  name: 'UserOrders',
  components: {
    UserNavbar
  },
  data() {
    return {
      availableProducts: [],
      userOrders: [],
      cartItems: [],
      orderQuantities: {},
      loadingProducts: false,
      loadingOrders: false,
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',
      token: null
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    this.fetchAvailableProducts()
    this.fetchUserOrders()
  },
  methods: {
    async fetchAvailableProducts() {
      this.loadingProducts = true
      try {
        const response = await fetch('http://localhost:3000/api/cocolumber/all', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        this.availableProducts = data
      } catch (error) {
        console.error('Error fetching products:', error)
        this.errorMessage = 'Failed to load products'
      } finally {
        this.loadingProducts = false
      }
    },
    async fetchUserOrders() {
      this.loadingOrders = true
      try {
        const response = await fetch('http://localhost:3000/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        this.userOrders = data
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        this.loadingOrders = false
      }
    },
    updateQuantity(productId, event) {
      const value = parseInt(event.target.value) || 0
      if (value >= 0) {
        this.orderQuantities[productId] = value
      }
    },
    increaseQuantity(productId, maxStock) {
      const current = this.orderQuantities[productId] || 0
      if (current < maxStock) {
        this.orderQuantities[productId] = current + 1
      }
    },
    decreaseQuantity(productId) {
      const current = this.orderQuantities[productId] || 0
      if (current > 0) {
        this.orderQuantities[productId] = current - 1
      }
    },
    addToOrder(product) {
      const quantity = this.orderQuantities[product.id]
      if (quantity && quantity > 0) {
        // Check if product already in cart
        const existingItem = this.cartItems.find(item => item.id === product.id)
        if (existingItem) {
          existingItem.quantity += quantity
        } else {
          this.cartItems.push({
            id: product.id,
            size: product.size,
            length: product.length,
            quantity: quantity
          })
        }
        this.orderQuantities[product.id] = 0
        this.successMessage = `${product.size} added to cart!`
        setTimeout(() => this.successMessage = '', 3000)
      }
    },
    removeFromCart(index) {
      this.cartItems.splice(index, 1)
    },
    async submitOrder() {
      if (this.cartItems.length === 0) {
        this.errorMessage = 'Cart is empty'
        return
      }

      this.isSubmitting = true
      try {
        const response = await fetch('http://localhost:3000/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            items: this.cartItems
          })
        })

        if (!response.ok) {
          throw new Error('Failed to place order')
        }

        this.successMessage = '✓ Order placed successfully!'
        this.cartItems = []
        this.orderQuantities = {}
        this.fetchUserOrders()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        console.error('Error placing order:', error)
        this.errorMessage = 'Error: ' + error.message
      } finally {
        this.isSubmitting = false
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      // If it's already a full URL, return it
      if (imagePath.startsWith('http')) {
        return imagePath
      }
      // If it starts with /, it's already a root path
      if (imagePath.startsWith('/')) {
        return `http://localhost:3000${imagePath}`
      }
      // Otherwise, assume it's in the uploads folder
      return `http://localhost:3000/uploads/${imagePath}`
    }
  }
}
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.orders-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 40px;
  text-align: center;
}

.orders-header h1 {
  margin: 0;
  font-size: 2.5em;
}

.orders-header p {
  margin: 10px 0 0 0;
  font-size: 1.1em;
  opacity: 0.95;
}

/* Available Products Section */
.available-products {
  background: #242442;
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
}

.available-products h2 {
  color: #667eea;
  margin-bottom: 30px;
  font-size: 1.8em;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
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
  font-size: 3em;
}

.product-info {
  padding: 20px;
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1.3em;
}

.product-info p {
  margin: 8px 0;
  color: #aaa;
  font-size: 0.95em;
}

.product-info .date {
  color: #888;
  font-size: 0.85em;
  margin-top: 10px;
}

.product-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background: #242442;
  border-top: 1px solid #333;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.qty-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.qty-btn:hover {
  background: #764ba2;
}

.qty-input {
  width: 50px;
  padding: 5px;
  background: #1a1a2e;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  text-align: center;
}

.btn-order {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-order:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-order:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-products {
  text-align: center;
  color: #888;
  padding: 40px 20px;
  font-size: 1.1em;
}

.loading {
  text-align: center;
  color: #667eea;
  padding: 40px 20px;
  font-size: 1.1em;
}

/* Shopping Cart Section */
.shopping-cart {
  background: #242442;
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
}

.shopping-cart h2 {
  color: #667eea;
  margin-bottom: 30px;
  font-size: 1.8em;
}

.cart-items {
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info h4 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1.1em;
}

.item-info p {
  margin: 0;
  color: #aaa;
  font-size: 0.9em;
}

.btn-remove {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #c0392b;
}

.cart-summary {
  padding: 15px 20px;
  background: #242442;
  color: #aaa;
  text-align: right;
  border-top: 1px solid #333;
}

.cart-summary p {
  margin: 0;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-checkout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-cart {
  text-align: center;
  color: #888;
  padding: 30px;
  background: #1a1a2e;
  border-radius: 12px;
}

/* My Orders Section */
.my-orders {
  background: #242442;
  border-radius: 15px;
  padding: 40px;
}

.my-orders h2 {
  color: #667eea;
  margin-bottom: 30px;
  font-size: 1.8em;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-id {
  color: #667eea;
  font-weight: 600;
}

.order-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
}

.status-pending {
  background: #f39c12;
  color: white;
}

.status-completed {
  background: #27ae60;
  color: white;
}

.status-cancelled {
  background: #e74c3c;
  color: white;
}

.order-details p {
  margin: 8px 0;
  color: #aaa;
}

.order-details strong {
  color: #fff;
}

.order-date {
  color: #888 !important;
  font-size: 0.85em !important;
  margin-top: 10px !important;
}

.no-orders {
  text-align: center;
  color: #888;
  padding: 40px;
  background: #1a1a2e;
  border-radius: 12px;
}

/* Alerts */
.alert {
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  margin-bottom: 20px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-icon {
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .orders-container {
    padding: 20px 15px;
  }

  .orders-header h1 {
    font-size: 2em;
  }

  .available-products,
  .shopping-cart,
  .my-orders {
    padding: 25px 20px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .orders-list {
    grid-template-columns: 1fr;
  }

  .product-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-order {
    width: 100%;
  }
}
</style>
