<template>
  <div class="cart-page">
    <h2>🛒 Your Cart</h2>
    <div v-if="loading" class="loading">Loading cart...</div>
    <div v-else>
      <div v-if="cartItems.length > 0" class="cart-list">
        <div v-for="(item, idx) in cartItems" :key="item.id" class="cart-item">
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
          <button @click="placeOrder" class="btn-place" :disabled="isPlacing">Place Order</button>
        </div>
      </div>
      <p v-else>Your cart is empty.</p>

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
    try {
      const stored = localStorage.getItem('cartItems')
      this.cartItems = stored ? JSON.parse(stored) : []
    } catch (e) {
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
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ items: this.cartItems })
        })
        if (!res.ok) throw new Error('Failed to place order')
        this.successMessage = '✓ Order placed successfully!'
        this.cartItems = []
        try { localStorage.removeItem('cartItems') } catch (e) {}
        setTimeout(() => this.successMessage = '', 3000)
      } catch (err) {
        console.error('Cart place error', err)
        this.errorMessage = 'Error placing order'
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
.btn-remove { background:#e74c3c; color:white; border:none; padding:6px 10px; border-radius:6px }
.cart-summary { margin-top:16px; display:flex; justify-content:space-between; align-items:center }
.btn-place { background:#4CAF50; color:white; border:none; padding:10px 16px; border-radius:8px }
.alert { margin-top:12px; padding:10px; border-radius:6px }
.alert.success { background:#e8f5e9; color:#2e7d32 }
.alert.error { background:#ffebee; color:#c62828 }
</style>
