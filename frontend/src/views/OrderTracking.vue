<template>
  <div class="staff-layout">
    <StaffSidebar />
    
    <div class="checkout-page">
      <div class="checkout-container">
        <!-- Header -->
        <div class="checkout-header">
          <h1>🛒 Checkout & Order Placement</h1>
          <p>Review your cart, add delivery address, and place your order</p>
        </div>

        <section class="tracking-section">
          <div class="tracking-header">
            <h2>🚚 Order Tracking</h2>
            <button class="refresh-btn" @click="fetchMyOrders" :disabled="loadingOrders">
              {{ loadingOrders ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>

          <div class="tracking-tabs">
            <button
              class="tracking-tab"
              :class="{ active: activeTrackingTab === 'to_ship' }"
              @click="activeTrackingTab = 'to_ship'"
            >
              To Ship ({{ toShipOrders.length }})
            </button>
            <button
              class="tracking-tab"
              :class="{ active: activeTrackingTab === 'to_deliver' }"
              @click="activeTrackingTab = 'to_deliver'"
            >
              To Delivered ({{ toDeliverOrders.length }})
            </button>
            <button
              class="tracking-tab"
              :class="{ active: activeTrackingTab === 'complete' }"
              @click="activeTrackingTab = 'complete'"
            >
              Complete ({{ completeOrders.length }})
            </button>
          </div>

          <div v-if="loadingOrders" class="tracking-loading">Loading your orders...</div>
          <div v-else-if="activeTrackingOrders.length === 0" class="tracking-empty">No orders in this status.</div>
          <div v-else class="tracking-list">
            <div v-for="order in activeTrackingOrders" :key="order.id" class="tracking-item">
              <div>
                <p class="tracking-order-id">Order #{{ order.id }}</p>
                <p class="tracking-order-meta">
                  {{ order.size }} - {{ order.length }} cm × {{ order.quantity }}
                </p>
                <p class="tracking-order-meta">Placed: {{ formatDate(order.created_at) }}</p>
              </div>
              <span class="tracking-status" :class="normalizeOrderStatus(order.status)">
                {{ formatOrderStatus(order.status) }}
              </span>
            </div>
          </div>
        </section>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add products to your cart from the traders list.</p>
          <router-link to="/sellers" class="btn btn-primary">Browse Traders</router-link>
        </div>

        <div v-else class="checkout-grid">
          <!-- Left Column: Cart Items & Delivery Address -->
          <div class="checkout-left">
            <!-- Cart Items Section -->
            <section class="checkout-section">
              <h2>📦 Cart Items</h2>
              <div class="cart-items-list">
                <div v-for="(item, idx) in cartItems" :key="idx" class="cart-item">
                  <div class="item-image">
                    <img v-if="item.product_picture" :src="getImageUrl(item.product_picture)" :alt="item.size" />
                    <div v-else class="no-image">🥥</div>
                  </div>
                  <div class="item-details">
                    <h3>{{ item.size }}</h3>
                    <p class="item-meta">📏 {{ item.length }} cm</p>
                    <p v-if="item.store_name" class="item-store">👤 {{ item.store_name }}</p>
                    <div class="item-pricing">
                      <span class="unit-price">₱{{ getUnitPrice(item).toFixed(2) }} / unit</span>
                      <span class="item-total">₱{{ getItemTotal(item).toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="item-quantity">
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
                  <button @click="remove(idx)" class="btn-remove">🗑️</button>
                </div>
              </div>
            </section>

            <!-- Delivery Address Section -->
            <section class="checkout-section">
              <h2>📍 Delivery Address</h2>
              <div class="address-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Full Name *</label>
                    <input 
                      v-model="deliveryAddress.fullName" 
                      type="text" 
                      placeholder="Juan Dela Cruz"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>Phone Number *</label>
                    <input 
                      v-model="deliveryAddress.phone" 
                      type="tel" 
                      placeholder="+63 912 345 6789"
                      class="form-input"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Street Address *</label>
                  <input 
                    v-model="deliveryAddress.street" 
                    type="text" 
                    placeholder="House/Unit/Floor No., Building Name, Street Name"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Barangay *</label>
                    <input 
                      v-model="deliveryAddress.barangay" 
                      type="text" 
                      placeholder="Barangay"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>City/Municipality *</label>
                    <input 
                      v-model="deliveryAddress.city" 
                      type="text" 
                      placeholder="City/Municipality"
                      class="form-input"
                      required
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Province *</label>
                    <input 
                      v-model="deliveryAddress.province" 
                      type="text" 
                      placeholder="Province"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>Postal Code *</label>
                    <input 
                      v-model="deliveryAddress.postalCode" 
                      type="text" 
                      placeholder="1234"
                      class="form-input"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Additional Instructions (Optional)</label>
                  <textarea 
                    v-model="deliveryAddress.notes" 
                    placeholder="Landmarks, gate codes, delivery instructions..."
                    class="form-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-check">
                  <input 
                    v-model="deliveryAddress.isDefault" 
                    type="checkbox" 
                    id="saveAddress"
                    class="form-checkbox"
                  />
                  <label for="saveAddress">Save as default delivery address</label>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column: Order Summary & Payment -->
          <div class="checkout-right">
            <section class="order-summary sticky">
              <h2>📊 Order Summary</h2>
              
              <div class="summary-details">
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
                <div class="summary-row">
                  <span>Shipping Fee:</span>
                  <strong>{{ shippingFee > 0 ? '₱' + shippingFee.toFixed(2) : 'FREE' }}</strong>
                </div>
                <div class="summary-row total">
                  <span>Total Amount:</span>
                  <strong class="total-price">₱{{ orderTotal.toFixed(2) }}</strong>
                </div>
              </div>

              <div class="payment-method-section">
                <h3>💳 Payment Method</h3>
                <div class="payment-options">
                  <label v-for="method in paymentMethods" :key="method.value" class="payment-radio-label">
                    <input 
                      type="radio"
                      v-model="selectedPaymentMethod"
                      :value="method.value"
                      class="payment-radio"
                    />
                    <div class="payment-option-card">
                      <span class="payment-icon">{{ method.icon }}</span>
                      <span class="payment-text">{{ method.label }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
              <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

              <button 
                @click="placeOrder" 
                class="btn-place-order" 
                :disabled="!canPlaceOrder || isPlacing"
              >
                <span v-if="!isPlacing">✓ Place Order (₱{{ orderTotal.toFixed(2) }})</span>
                <span v-else>
                  <span class="spinner-small"></span> Processing...
                </span>
              </button>

              <div class="order-notes">
                <p><strong>📝 Note:</strong></p>
                <ul>
                  <li>Please ensure your delivery address is correct</li>
                  <li>Orders are typically processed within 1-2 business days</li>
                  <li>You'll receive order confirmation via email</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'OrderTracking',
  components: {
    StaffSidebar
  },
  data() {
    return {
      cartItems: [],
      deliveryAddress: {
        fullName: '',
        phone: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        postalCode: '',
        notes: '',
        isDefault: false
      },
      selectedPaymentMethod: '',
      paymentMethods: [
        { value: 'gcash', label: 'GCash', icon: '📱' },
        { value: 'grab_pay', label: 'GrabPay', icon: '🚗' },
        { value: 'paymaya', label: 'PayMaya', icon: '💳' },
        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
        { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' }
      ],
      shippingFee: 150, // Fixed shipping fee in PHP
      isPlacing: false,
      errorMessage: '',
      successMessage: '',
      token: null,
      myOrders: [],
      loadingOrders: false,
      activeTrackingTab: 'to_ship'
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
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
      return this.subtotal - this.discountAmount + this.shippingFee
    },
    canPlaceOrder() {
      const hasItems = this.cartItems.length > 0
      const hasAddress = this.deliveryAddress.fullName && 
                        this.deliveryAddress.phone && 
                        this.deliveryAddress.street && 
                        this.deliveryAddress.city && 
                        this.deliveryAddress.province
      const hasPayment = this.selectedPaymentMethod !== ''
      return hasItems && hasAddress && hasPayment
    },
    toShipOrders() {
      return this.myOrders.filter(order => {
        const status = this.normalizeOrderStatus(order.status)
        return status === 'to_ship'
      })
    },
    toDeliverOrders() {
      return this.myOrders.filter(order => {
        const status = this.normalizeOrderStatus(order.status)
        return status === 'to_deliver'
      })
    },
    completeOrders() {
      return this.myOrders.filter(order => {
        const status = this.normalizeOrderStatus(order.status)
        return status === 'complete'
      })
    },
    activeTrackingOrders() {
      if (this.activeTrackingTab === 'to_ship') return this.toShipOrders
      if (this.activeTrackingTab === 'to_deliver') return this.toDeliverOrders
      return this.completeOrders
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null

    if (!this.token) {
      this.$router.push('/login')
      return
    }

    if (user?.role !== 'staff') {
      this.$router.push('/staff')
      return
    }

    // Load cart items from localStorage
    try {
      const stored = localStorage.getItem('cartItems')
      this.cartItems = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Error loading cart:', e)
      this.cartItems = []
    }

    // Load saved address if exists
    try {
      const savedAddress = localStorage.getItem('deliveryAddress')
      if (savedAddress) {
        this.deliveryAddress = JSON.parse(savedAddress)
      }
    } catch (e) {
      console.error('Error loading address:', e)
    }

    this.fetchMyOrders()
  },
  methods: {
    normalizeOrderStatus(status) {
      if (['to_ship', 'pending'].includes(status)) return 'to_ship'
      if (['to_deliver', 'processing', 'preparing_shipment', 'shipped'].includes(status)) return 'to_deliver'
      if (['delivered', 'completed'].includes(status)) return 'complete'
      return 'to_ship'
    },
    formatOrderStatus(status) {
      const normalized = this.normalizeOrderStatus(status)
      if (normalized === 'to_ship') return 'To Ship'
      if (normalized === 'to_deliver') return 'To Delivered'
      return 'Complete'
    },
    async fetchMyOrders() {
      this.loadingOrders = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        this.myOrders = await response.json()
      } catch (error) {
        console.error('Error fetching my orders:', error)
      } finally {
        this.loadingOrders = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getImageUrl(path) {
      if (!path) return ''
      return path.startsWith('http') ? path : `${import.meta.env.VITE_API_BASE_URL}${path}`
    },
    getUnitPrice(item) {
      const basePrices = {
        'Small': 15 + (item.length * 1.2),
        'Medium': 20 + (item.length * 1.5),
        'Large': 35 + (item.length * 1.8),
        'Extra Large': 50 + (item.length * 2.0),
        'Premium Large': 40 + (item.length * 1.9),
        'Organic Large': 45 + (item.length * 1.95),
      }
      const price = basePrices[item.size] || (20 + (item.length * 1.5))
      return Math.round(price / 5) * 5
    },
    getItemTotal(item) {
      return this.getUnitPrice(item) * item.quantity
    },
    saveCart() {
      try {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems))
      } catch (e) {
        console.error('Error saving cart:', e)
      }
    },
    remove(index) {
      this.cartItems.splice(index, 1)
      this.saveCart()
    },
    increase(index) {
      this.cartItems[index].quantity++
      this.saveCart()
    },
    decrease(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--
        this.saveCart()
      }
    },
    updateQuantity(index, event) {
      let value = parseInt(event.target.value)
      if (isNaN(value) || value < 1) {
        value = 1
      }
      this.cartItems[index].quantity = value
      this.saveCart()
    },
    validateQuantity(index) {
      if (!this.cartItems[index].quantity || this.cartItems[index].quantity < 1) {
        this.cartItems[index].quantity = 1
        this.saveCart()
      }
    },
    async placeOrder() {
      if (!this.canPlaceOrder) {
        this.errorMessage = '❌ Please fill in all required fields'
        return
      }

      this.isPlacing = true
      this.errorMessage = ''
      this.successMessage = ''

      // Save address if marked as default
      if (this.deliveryAddress.isDefault) {
        try {
          localStorage.setItem('deliveryAddress', JSON.stringify(this.deliveryAddress))
        } catch (e) {
          console.error('Error saving address:', e)
        }
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            items: this.cartItems,
            paymentMethod: this.selectedPaymentMethod,
            deliveryAddress: this.deliveryAddress,
            shippingFee: this.shippingFee
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to place order')
        }

        // Clear cart
        this.cartItems = []
        try {
          localStorage.removeItem('cartItems')
        } catch (e) {
          console.error('Error clearing cart:', e)
        }

        await this.fetchMyOrders()

        // Handle different payment methods
        if (this.selectedPaymentMethod === 'cash_on_delivery') {
          this.successMessage = `✓ Order placed successfully! Total: ₱${data.totalAmount.toFixed(2)} | Pay upon delivery to: ${this.deliveryAddress.street}, ${this.deliveryAddress.city}`
          setTimeout(() => {
            this.$router.push('/sellers')
          }, 4000)
        } else if (['gcash', 'grab_pay', 'paymaya'].includes(this.selectedPaymentMethod)) {
          if (data.paymentUrl) {
            this.successMessage = `✓ Redirecting to ${this.selectedPaymentMethod.toUpperCase()} payment...`
            setTimeout(() => {
              window.location.href = data.paymentUrl
            }, 1500)
          } else {
            throw new Error('Payment link not generated')
          }
        } else if (this.selectedPaymentMethod === 'bank_transfer') {
          this.successMessage = `✓ Order placed! Total: ₱${data.totalAmount.toFixed(2)} | Bank transfer instructions sent to your email`
          setTimeout(() => {
            this.$router.push('/sellers')
          }, 4000)
        }
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

.checkout-page {
  flex: 1;
  padding: 40px 20px;
  overflow-y: auto;
}

.checkout-container {
  max-width: 1400px;
  margin: 0 auto;
}

.checkout-header {
  text-align: center;
  margin-bottom: 40px;
}

.checkout-header h1 {
  color: #fff;
  font-size: 2.5em;
  margin-bottom: 8px;
}

.checkout-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1em;
}

.tracking-section {
  background: rgba(36, 36, 66, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.tracking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tracking-header h2 {
  color: #4CAF50;
  font-size: 1.3em;
  margin: 0;
}

.refresh-btn {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tracking-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.tracking-tab {
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.tracking-tab.active {
  background: rgba(76, 175, 80, 0.2);
  color: #fff;
  border-color: #4CAF50;
}

.tracking-loading,
.tracking-empty {
  color: rgba(255, 255, 255, 0.75);
  padding: 10px 4px;
}

.tracking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tracking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(102, 126, 234, 0.16);
  border-radius: 10px;
  padding: 12px;
}

.tracking-order-id {
  color: #fff;
  font-weight: 700;
  margin: 0 0 4px;
}

.tracking-order-meta {
  color: rgba(255, 255, 255, 0.75);
  margin: 2px 0;
  font-size: 0.9em;
}

.tracking-status {
  font-size: 0.85em;
  font-weight: 700;
  border-radius: 20px;
  padding: 6px 10px;
  white-space: nowrap;
}

.tracking-status.to_ship {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
  border: 1px solid rgba(241, 196, 15, 0.35);
}

.tracking-status.to_deliver {
  background: rgba(52, 152, 219, 0.2);
  color: #5dade2;
  border: 1px solid rgba(52, 152, 219, 0.35);
}

.tracking-status.complete {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.35);
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: rgba(36, 36, 66, 0.6);
  border-radius: 16px;
}

.empty-cart .empty-icon {
  font-size: 5em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-cart h2 {
  color: #fff;
  margin-bottom: 16px;
}

.empty-cart p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 30px;
}

.checkout-section {
  background: rgba(36, 36, 66, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.checkout-section h2 {
  color: #4CAF50;
  font-size: 1.5em;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
  padding-bottom: 12px;
}

/* Cart Items */
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 16px;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
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
  font-size: 2.5em;
  opacity: 0.5;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  color: #4CAF50;
  margin: 0 0 8px 0;
  font-size: 1.1em;
}

.item-meta {
  color: #999;
  font-size: 0.9em;
  margin: 4px 0;
}

.item-store {
  color: #667eea;
  font-size: 0.85em;
  font-weight: 600;
  margin: 6px 0;
}

.item-pricing {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.9em;
}

.unit-price {
  color: #999;
}

.item-total {
  color: #4CAF50;
  font-weight: 600;
  font-size: 1.1em;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  background: #667eea;
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1em;
  transition: background 0.2s;
}

.qty-btn:hover {
  background: #5568d3;
}

.qty-input {
  width: 60px;
  padding: 6px;
  background: transparent;
  color: #fff;
  border: none;
  text-align: center;
  font-weight: 600;
  font-size: 1em;
}

.qty-input:focus {
  outline: none;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2em;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #c0392b;
}

/* Delivery Address Form */
.address-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #fff;
  font-weight: 600;
  font-size: 0.9em;
}

.form-input,
.form-textarea {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.form-check label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
  cursor: pointer;
}

/* Order Summary */
.order-summary {
  background: rgba(36, 36, 66, 0.9);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 24px;
}

.order-summary.sticky {
  position: sticky;
  top: 80px;
}

.order-summary h2 {
  color: #4CAF50;
  font-size: 1.3em;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
  padding-bottom: 12px;
}

.summary-details {
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  font-size: 0.95em;
  color: #fff;
}

.summary-row.discount {
  color: #4CAF50;
}

.summary-row.total {
  background: rgba(76, 175, 80, 0.1);
  padding: 16px 12px;
  border-radius: 8px;
  border: none;
  margin-top: 12px;
  font-size: 1.1em;
  font-weight: 600;
}

.total-price {
  color: #4CAF50;
  font-size: 1.4em;
}

/* Payment Method */
.payment-method-section {
  margin-bottom: 24px;
}

.payment-method-section h3 {
  color: #fff;
  font-size: 1em;
  margin-bottom: 12px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-radio-label {
  cursor: pointer;
}

.payment-radio {
  display: none;
}

.payment-option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  transition: all 0.3s;
}

.payment-radio:checked + .payment-option-card {
  background: rgba(76, 175, 80, 0.15);
  border-color: #4CAF50;
}

.payment-option-card:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.4);
}

.payment-icon {
  font-size: 1.5em;
}

.payment-text {
  color: #fff;
  font-weight: 600;
  font-size: 0.95em;
}

/* Alerts */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  text-align: center;
}

.alert-error {
  background: rgba(231, 76, 60, 0.2);
  color: #ff6b6b;
  border: 1px solid #e74c3c;
}

.alert-success {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid #2ecc71;
}

/* Place Order Button */
.btn-place-order {
  width: 100%;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1em;
  transition: all 0.3s;
  margin-bottom: 16px;
}

.btn-place-order:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
}

.btn-place-order:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Order Notes */
.order-notes {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85em;
}

.order-notes strong {
  color: #ffc107;
}

.order-notes ul {
  margin: 8px 0 0 20px;
  padding: 0;
}

.order-notes li {
  margin: 4px 0;
}

/* Primary Button for empty state */
.btn-primary {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1em;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .order-summary.sticky {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .checkout-header h1 {
    font-size: 2em;
  }

  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 12px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-quantity {
    grid-column: 1 / -1;
    justify-content: center;
  }

  .btn-remove {
    grid-column: 1 / -1;
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
