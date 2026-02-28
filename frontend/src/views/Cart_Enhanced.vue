<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="cart-page">
      <h2>🛒 Your Cart</h2>
      <div v-if="loading" class="loading">Loading cart...</div>
      <div v-else>
        <div v-if="cartItems.length > 0" class="cart-container">
          <!-- Cart Items List -->
          <div class="cart-list">
            <div v-for="(item, idx) in cartItems" :key="idx" class="cart-item">
              <div class="item-left">
                <div class="item-image">
                  <img v-if="item.product_picture" :src="getImageUrl(item.product_picture)" :alt="item.size" />
                  <div v-else class="no-image">🥥</div>
                </div>
              </div>
              <div class="item-info">
                <h3>{{ item.size }}</h3>
                <p class="length">📏 {{ item.length }} cm</p>
                <p v-if="item.store_name" class="store-name">👤 {{ item.store_name }}</p>
              </div>
              <div class="item-price">
                <div class="price-unit">
                  <span class="label">Unit Price:</span>
                  <span class="price">₱{{ getUnitPrice(item).toFixed(2) }}</span>
                </div>
                <div class="qty-control">
                  <button @click="decrease(idx)" class="qty-btn">−</button>
                  <input 
                    type="number" 
                    v-model.number="item.quantity"
                    @input="updateQuantity(idx, $event)"
                    @blur="validateQuantity(idx)"
                    min="1"
                    class="qty-input"
                  />
                  <button @click="increase(idx)" class="qty-btn">+</button>
                </div>
                <div class="price-total">
                  <span class="label">Total:</span>
                  <span class="price">₱{{ getItemTotal(item).toFixed(2) }}</span>
                </div>
              </div>
              <button @click="remove(idx)" class="btn-remove">✕ Remove</button>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <h3>📊 Order Summary</h3>
            <div class="summary-row">
              <span>Total Items:</span>
              <strong>{{ totalItems }} units</strong>
            </div>
            <div class="summary-row">
              <span>Subtotal:</span>
              <strong>₱{{ subtotal.toFixed(2) }}</strong>
            </div>
            <div v-if="bulkDiscount > 0" class="summary-row discount">
              <span>Bulk Discount ({{ (bulkDiscount * 100).toFixed(0) }}%):</span>
              <strong>-₱{{ discountAmount.toFixed(2) }}</strong>
            </div>
            <div class="summary-row total">
              <span>Final Total:</span>
              <strong class="final-price">₱{{ orderTotal.toFixed(2) }}</strong>
            </div>

            <!-- Payment Method Selection -->
            <div class="payment-section">
              <h4>💳 Payment Method</h4>
              <div class="payment-options">
                <div v-for="method in paymentMethods" :key="method.value" class="payment-option">
                  <input 
                    type="radio"
                    :id="`payment-${method.value}`"
                    v-model="selectedPaymentMethod"
                    :value="method.value"
                    class="payment-radio"
                  />
                  <label :for="`payment-${method.value}`" class="payment-label">
                    <span class="payment-icon">{{ method.icon }}</span>
                    <span class="payment-text">{{ method.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Place Order Button -->
            <button @click="placeOrder" class="btn-place" :disabled="isPlacing || !selectedPaymentMethod">
              <span v-if="!isPlacing">✓ Place Order (₱{{ orderTotal.toFixed(2) }})</span>
              <span v-else>Processing...</span>
            </button>
          </div>
        </div>
        <div v-else class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add products to your cart from the traders list.</p>
          <router-link to="/sellers" class="btn-shop">Browse Traders</router-link>
        </div>

        <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'Cart',
  components: {
    StaffSidebar
  },
  data() {
    return {
      cartItems: [],
      loading: true,
      isPlacing: false,
      successMessage: '',
      errorMessage: '',
      token: null,
      selectedPaymentMethod: '',
      paymentMethods: [
        { value: 'gcash', label: 'GCash', icon: '📱' },
        { value: 'grab_pay', label: 'GrabPay', icon: '🚗' },
        { value: 'paymaya', label: 'PayMaya', icon: '💳' },
        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
        { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' }
      ]
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((s, it) => s + it.quantity, 0)
    },
    subtotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (this.getUnitPrice(item) * item.quantity)
      }, 0)
    },
    bulkDiscount() {
      const qty = this.totalItems
      if (qty >= 100) return 0.20
      if (qty >= 50) return 0.15
      if (qty >= 20) return 0.10
      if (qty >= 10) return 0.05
      return 0
    },
    discountAmount() {
      return this.subtotal * this.bulkDiscount
    },
    orderTotal() {
      return this.subtotal - this.discountAmount
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null

    if (!this.token) {
      console.warn('No token found, redirecting to login')
      this.$router.push('/login')
      return
    }

    if (user?.role !== 'staff') {
      this.$router.push('/staff')
      return
    }
    
    try {
      const stored = localStorage.getItem('cartItems')
      this.cartItems = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Error loading cart from localStorage:', e)
      this.cartItems = []
    }
    this.loading = false
  },
  methods: {
    getImageUrl(path) {
      if (!path) return ''
      return path.startsWith('http') ? path : `${import.meta.env.VITE_API_BASE_URL}${path}`
    },
    getUnitPrice(item) {
      // Base price calculation based on size and length
      const basePrices = {
        'Small': 15 + (item.length * 1.2),
        'Medium': 20 + (item.length * 1.5),
        'Large': 35 + (item.length * 1.8),
        'Extra Large': 50 + (item.length * 2.0),
        'Premium Large': 40 + (item.length * 1.9),
        'Organic Large': 45 + (item.length * 1.95),
      }
      const price = basePrices[item.size] || (20 + (item.length * 1.5))
      return Math.round(price / 5) * 5 // Round to nearest 5
    },
    getItemTotal(item) {
      return this.getUnitPrice(item) * item.quantity
    },
    save() {
      try { localStorage.setItem('cartItems', JSON.stringify(this.cartItems)) } catch (e) {}
    },
    remove(index) {
      this.cartItems.splice(index, 1)
      this.save()
    },
    increase(index) {
      this.cartItems[index].quantity++
      this.save()
    },
    decrease(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--
        this.save()
      }
    },
    updateQuantity(index, event) {
      let value = parseInt(event.target.value)
      if (isNaN(value) || value < 1) {
        value = 1
      }
      this.cartItems[index].quantity = value
      this.save()
    },
    validateQuantity(index) {
      if (!this.cartItems[index].quantity || this.cartItems[index].quantity < 1) {
        this.cartItems[index].quantity = 1
        this.save()
      }
    },
    async placeOrder() {
      if (this.cartItems.length === 0) return
      if (!this.selectedPaymentMethod) {
        this.errorMessage = '❌ Please select a payment method'
        return
      }
      
      this.isPlacing = true
      this.errorMessage = ''
      this.successMessage = ''
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ 
            items: this.cartItems,
            paymentMethod: this.selectedPaymentMethod
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to place order')
        }
        
        this.successMessage = `✓ Order placed! Total: ₱${data.totalAmount.toFixed(2)} | Payment via ${this.selectedPaymentMethod}`
        this.cartItems = []
        try { localStorage.removeItem('cartItems') } catch (e) {}
        
        setTimeout(() => {
          this.successMessage = ''
          this.$router.push('/sellers')
        }, 3000)
      } catch (err) {
        console.error('Order error:', err)
        this.errorMessage = err.message || 'Error placing order. Please try again.'
      } finally {
        this.isPlacing = false
      }
    }
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 60px;
}

.cart-page {
  flex: 1;
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  width: 100%;
}

.cart-page h2 {
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2em;
}

.cart-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  gap: 16px;
  background: rgba(36, 36, 66, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 16px;
  border-radius: 12px;
  color: #fff;
  align-items: center;
}

.item-left {
  flex-shrink: 0;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  opacity: 0.5;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h3 {
  margin: 0 0 8px;
  font-size: 1.1em;
  color: #4CAF50;
}

.length {
  margin: 4px 0;
  color: #999;
  font-size: 0.9em;
}

.store-name {
  margin: 8px 0 0;
  color: #667eea;
  font-weight: 600;
  font-size: 0.85em;
}

.item-price {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: right;
  min-width: 140px;
}

.price-unit, .price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.price-unit .label, .price-total .label {
  font-size: 0.85em;
  color: #999;
}

.price {
  font-weight: 600;
  color: #4CAF50;
  font-size: 1.1em;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 4px;
}

.qty-btn {
  background: #667eea;
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.qty-btn:hover {
  background: #5568d3;
}

.qty-input {
  width: 50px;
  padding: 4px;
  background: transparent;
  color: #fff;
  border: none;
  text-align: center;
  font-weight: 600;
  font-size: 0.95em;
}

.qty-input:focus {
  outline: none;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-remove:hover {
  background: #c0392b;
}

/* Order Summary Sidebar */
.order-summary {
  background: rgba(36, 36, 66, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 24px;
  border-radius: 12px;
  color: #fff;
  height: fit-content;
  position: sticky;
  top: 80px;
}

.order-summary h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2em;
  color: #4CAF50;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
  padding-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  font-size: 0.95em;
}

.summary-row.total {
  background: rgba(76, 175, 80, 0.1);
  padding: 16px 12px;
  border-radius: 6px;
  border: none;
  margin-top: 12px;
  font-size: 1.1em;
  font-weight: 600;
}

.summary-row.discount {
  color: #4CAF50;
}

.final-price {
  color: #4CAF50;
  font-size: 1.3em;
}

/* Payment Section */
.payment-section {
  margin: 24px 0;
  padding: 16px 0;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.payment-section h4 {
  margin: 0 0 12px;
  font-size: 0.95em;
  color: #fff;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-option {
  display: flex;
  align-items: center;
}

.payment-radio {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.payment-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.payment-label:hover {
  background: rgba(76, 175, 80, 0.1);
}

.payment-icon {
  font-size: 1.2em;
  margin-right: 8px;
}

.payment-text {
  font-size: 0.9em;
}

.btn-place {
  width: 100%;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: all 0.3s;
  margin-top: 16px;
}

.btn-place:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3);
}

.btn-place:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.alert {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

.alert.success {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid #2ecc71;
}

.alert.error {
  background: rgba(231, 76, 60, 0.2);
  color: #ff6b6b;
  border: 1px solid #e74c3c;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: rgba(36, 36, 66, 0.5);
  border-radius: 12px;
  color: #fff;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-cart h3 {
  margin: 20px 0 10px;
  color: #fff;
  font-size: 1.5em;
}

.empty-cart p {
  color: #999;
  margin-bottom: 30px;
}

.btn-shop {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-shop:hover {
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #667eea;
  font-size: 1.1em;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .cart-container {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    position: relative;
    top: 0;
  }
  
  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .item-price {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
  }
}
</style>
