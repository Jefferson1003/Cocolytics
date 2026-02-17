<template>
  <div class="user-layout">
    <div class="orders-container">
      <!-- My Orders -->
      <div class="my-orders">
        <h2>📦 My Orders</h2>
        
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
                <!-- Display trader information -->
                <div v-if="order.store_name || order.staff_name" class="store-info">
                  <span class="store-badge">👤 From Trader: {{ order.store_name || order.staff_name }}</span>
                  <p v-if="order.contact_number" class="store-contact">📞 {{ order.contact_number }}</p>
                </div>
                <p class="order-date">{{ formatDate(order.created_at) }}</p>
              </div>
            </div>
          </div>
          <p v-else class="no-orders">You haven't placed any orders yet. Browse products from traders and add items to your cart!</p>
        </div>
        <div v-else class="loading">Loading orders...</div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-error">
        <span class="alert-icon">✕</span>
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserOrders',
  data() {
    return {
      userOrders: [],
      loadingOrders: false,
      errorMessage: '',
      token: null
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    if (!this.token) {
      console.warn('No token found, redirecting to login')
      this.$router.push('/login')
      return
    }
    
    this.fetchUserOrders()
  },
  methods: {
    async fetchUserOrders() {
      this.loadingOrders = true
      this.errorMessage = ''
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch orders')
        }
        
        const data = await response.json()
        this.userOrders = data
      } catch (error) {
        console.error('Error fetching orders:', error)
        this.errorMessage = 'Failed to load orders: ' + error.message
      } finally {
        this.loadingOrders = false
      }
    },
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }
      return new Date(dateString).toLocaleDateString('en-US', options)
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

.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* My Orders Section */
.my-orders {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.my-orders h2 {
  color: #4CAF50;
  margin-bottom: 30px;
  font-size: 2em;
  font-weight: 700;
  text-align: center;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.order-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%);
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-4px);
  border-color: #4CAF50;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.2);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
}

.order-id {
  color: #4CAF50;
  font-weight: 700;
  font-size: 1.1em;
}

.order-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.5);
}

.status-completed {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.status-delivered {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
  border: 1px solid rgba(33, 150, 243, 0.5);
}

.status-cancelled {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.order-details p {
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95em;
}

.order-details strong {
  color: #4CAF50;
  font-weight: 600;
}

.order-date {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 0.85em !important;
  margin-top: 14px !important;
  padding-top: 12px;
  border-top: 1px solid rgba(76, 175, 80, 0.1);
}

.store-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding: 14px;
  background: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4CAF50;
  border-radius: 6px;
}

.store-badge {
  color: #81C784;
  font-weight: 600;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.store-contact {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 0.85em !important;
  margin: 0 !important;
}

.no-orders {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 60px 20px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 12px;
  border: 2px dashed rgba(76, 175, 80, 0.2);
  font-size: 1.1em;
}

.loading {
  text-align: center;
  color: #4CAF50;
  padding: 60px 20px;
  font-size: 1.2em;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Alerts */
.alert {
  position: fixed;
  top: 100px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
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

.alert-error {
  background: #f44336;
  color: white;
}

.alert-icon {
  font-size: 1.3em;
}

@media (max-width: 768px) {
  .orders-container {
    padding: 20px 15px;
  }

  .my-orders {
    padding: 25px 20px;
  }

  .my-orders h2 {
    font-size: 1.5em;
  }

  .orders-list {
    grid-template-columns: 1fr;
  }

  .alert {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>
