<template>
  <div class="cart-page">
    <h2>🛒 Your Cart</h2>
    <div v-if="loading" class="loading">Loading cart...</div>
    <div v-else>
      <div v-if="cartItems.length > 0" class="cart-list">
        <div v-for="(item, idx) in cartItems" :key="idx" class="cart-item">
          <div class="item-info">
            <h3>{{ item.size }}</h3>
            <p>Length: {{ item.length }} cm</p>
            <p>Quantity: {{ item.quantity }} units</p>
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
        <p>Add some coconuts to your cart from the orders page!</p>
        <router-link to="/user/orders" class="btn-shop">Browse Products</router-link>
      </div>

      <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Cart',
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
    if (!this.token) {
      console.warn('No token found, redirecting to login')
      this.$router.push('/login')
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
          this.$router.push('/user/orders')
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
.cart-page { max-width: 900px; margin: 40px auto; padding: 20px; }
.cart-item { display:flex; justify-content:space-between; background:#242442; color:#fff; padding:12px; border-radius:8px; margin-bottom:12px }
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
