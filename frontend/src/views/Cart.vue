<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="cart-page">
      <h2>🛒 Your Cart</h2>
      <div v-if="loading" class="loading">Loading cart...</div>
      <div v-else>
        <div v-if="cartItems.length > 0" class="cart-list">
          <div v-for="(item, idx) in cartItems" :key="idx" class="cart-item">
            <div class="item-info">
              <h3>{{ item.size }}</h3>
              <p>Length: {{ item.length }} cm</p>
              <div class="quantity-control">
                <label>Quantity:</label>
                <input 
                  type="number" 
                  v-model.number="item.quantity"
                  @input="updateQuantity(idx, $event)"
                  @blur="validateQuantity(idx)"
                  min="1"
                  class="qty-input"
                />
                <span class="unit-label">units</span>
              </div>
              <p v-if="item.store_name" class="store-name">👤 {{ item.store_name }}</p>
            </div>
            <div class="item-actions">
              <button @click="decrease(idx)" class="qty">−</button>
              <button @click="increase(idx)" class="qty">+</button>
              <button @click="remove(idx)" class="btn-remove">Remove</button>
            </div>
          </div>
          <div class="cart-summary">
            <p><strong>Total Items:</strong> {{ totalItems }}</p>
            <button @click="placeOrder" class="btn-place" :disabled="isPlacing">
              <span v-if="!isPlacing">Place Order</span>
              <span v-else>Placing Order...</span>
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
      token: null
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((s, it) => s + it.quantity, 0)
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
      console.log('Cart localStorage data:', stored)
      this.cartItems = stored ? JSON.parse(stored) : []
      console.log('Cart items loaded:', this.cartItems)
    } catch (e) {
      console.error('Error loading cart from localStorage:', e)
      this.cartItems = []
    }
    this.loading = false
  },
  methods: {
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
      
      this.isPlacing = true
      this.errorMessage = ''
      this.successMessage = ''
      
      console.log('Placing order with items:', this.cartItems)
      
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ items: this.cartItems })
        })
        
        const data = await res.json()
        console.log('Order response:', data)
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to place order')
        }
        
        this.successMessage = '✓ Order placed successfully!'
        this.cartItems = []
        try { localStorage.removeItem('cartItems') } catch (e) {
          console.error('Error clearing cart from localStorage:', e)
        }
        
        setTimeout(() => {
          this.successMessage = ''
          this.$router.push('/sellers')
        }, 2000)
      } catch (err) {
        console.error('Cart place error:', err)
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
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 70px;
}

.cart-page { max-width: 900px; margin: 40px auto; padding: 20px; }
.cart-item { display:flex; justify-content:space-between; background:#242442; color:#fff; padding:12px; border-radius:8px; margin-bottom:12px }
.item-info { flex: 1; }
.quantity-control { display:flex; align-items:center; gap:8px; margin:8px 0; }
.quantity-control label { font-weight:500; }
.qty-input { width:70px; padding:6px 8px; background:#1a1a2e; color:#fff; border:1px solid #667eea; border-radius:6px; font-size:1em; text-align:center; }
.qty-input:focus { outline:none; border-color:#4CAF50; box-shadow:0 0 0 2px rgba(76,175,80,0.2); }
.qty-input::-webkit-outer-spin-button, .qty-input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
.qty-input[type=number] { -moz-appearance:textfield; }
.unit-label { color:#999; font-size:0.9em; }
.store-name { color:#4CAF50; font-size:0.9em; margin-top:8px; font-weight:600; }
.item-actions { display:flex; gap:8px; align-items:center }
.qty { background:#667eea; border:none; color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer }
.btn-remove { background:#e74c3c; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer }
.cart-summary { margin-top:16px; display:flex; justify-content:space-between; align-items:center }
.btn-place { background:#4CAF50; color:white; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:600; }
.btn-place:disabled { opacity:0.6; cursor:not-allowed; }
.alert { margin-top:12px; padding:10px; border-radius:6px }
.alert.success { background:#e8f5e9; color:#2e7d32 }
.alert.error { background:#ffebee; color:#c62828 }
.empty-cart { text-align:center; padding:60px 20px; background:#f8f9fa; border-radius:12px; }
.empty-icon { font-size:4em; margin-bottom:20px; opacity:0.5; }
.empty-cart h3 { margin:20px 0 10px; color:#333; }
.empty-cart p { color:#666; margin-bottom:30px; }
.btn-shop { display:inline-block; padding:12px 24px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; text-decoration:none; border-radius:8px; font-weight:600; transition:transform 0.2s; }
.btn-shop:hover { transform:translateY(-2px); }
.loading { text-align:center; padding:40px; color:#667eea; }
</style>
