<template>
  <div class="staff-layout">
    <StaffSidebar />

    <!-- Main Content -->
    <div class="orders-main">
      <div class="orders-header">
        <h1>📋 Order Management</h1>
        <p>Manage all coconut orders</p>
      </div>

      <div v-if="pendingOrdersCount > 0" class="pending-notification">
        <div class="pending-icon">🔔</div>
        <div class="pending-content">
          <h3>New Orders Waiting</h3>
          <p><strong>{{ pendingOrdersCount }}</strong> order{{ pendingOrdersCount > 1 ? 's' : '' }} pending acceptance.</p>
        </div>
        <button class="pending-btn" @click="scrollToOrders">Review Now</button>
      </div>

      <div v-if="newOrderMessage" class="toast-notification">
        {{ newOrderMessage }}
      </div>

      <!-- All Orders -->
      <div class="all-orders" ref="ordersSection">
        <h2>🥥 All Orders</h2>
        <div v-if="!loadingOrders">
          <div v-if="allOrders.length > 0" class="orders-list">
            <div v-for="order in allOrders" :key="order.id" class="order-card" :class="{ pending: order.status === 'pending', processing: order.status === 'processing' }">
              <div class="order-header">
                <h3>Order #{{ order.id }}</h3>
                <span :class="['status-badge', order.status]">{{ order.status }}</span>
              </div>
              <div class="order-details">
                <div class="product-info">
                  <div class="product-image-small">
                    <img v-if="order.product_picture" :src="getImageUrl(order.product_picture)" :alt="order.size" />
                    <div v-else class="no-image-small">🥥</div>
                  </div>
                  <div class="product-details">
                    <p><strong>Product:</strong> {{ order.size }} - {{ order.length }} cm</p>
                    <p><strong>Quantity:</strong> {{ order.quantity }}</p>
                  </div>
                </div>
                <p><strong>Customer:</strong> {{ order.user_name }} ({{ order.email }})</p>
                <p><strong>Ordered:</strong> {{ formatDate(order.created_at) }}</p>
              </div>
              <div class="order-actions">
                <button
                  v-if="order.status === 'pending'"
                  @click="updateOrderStatus(order.id, 'processing')"
                  class="btn-accept"
                >
                  Accept Order
                </button>
                <button
                  v-if="order.status === 'pending'"
                  @click="updateOrderStatus(order.id, 'cancelled')"
                  class="btn-cancel"
                >
                  Cancel Order
                </button>
                <button
                  v-if="order.status === 'processing'"
                  @click="updateOrderStatus(order.id, 'completed')"
                  class="btn-complete"
                >
                  Mark as Completed
                </button>
                <span v-if="order.status !== 'pending'" class="status-text">
                  Status: {{ order.status }}
                </span>
              </div>
            </div>
          </div>
          <p v-else class="no-orders">No orders found.</p>
        </div>
        <div v-else class="loading">Loading orders...</div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'StaffOrders',
  components: {
    StaffSidebar
  },
  data() {
    return {
      allOrders: [],
      loadingOrders: false,
      pendingOrdersCount: 0,
      lastPendingCount: 0,
      newOrderMessage: '',
      pollIntervalId: null
    }
  },
  mounted() {
    this.fetchAllOrders()
    this.startPolling()
  },
  beforeUnmount() {
    this.stopPolling()
  },
  methods: {
    startPolling() {
      this.pollIntervalId = setInterval(() => {
        this.fetchAllOrders(true)
      }, 15000)
    },
    stopPolling() {
      if (this.pollIntervalId) {
        clearInterval(this.pollIntervalId)
        this.pollIntervalId = null
      }
    },
    async fetchAllOrders(silent = false) {
      if (!silent) {
        this.loadingOrders = true
      }
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        this.allOrders = data

        const pendingCount = data.filter(order => order.status === 'pending').length
        this.pendingOrdersCount = pendingCount

        if (pendingCount > this.lastPendingCount) {
          this.newOrderMessage = '✅ New order received! Please review and accept.'
          setTimeout(() => {
            this.newOrderMessage = ''
          }, 4000)
        }

        this.lastPendingCount = pendingCount
      } catch (error) {
        console.error('Error fetching orders:', error)
        if (!silent) {
          alert('Failed to load orders')
        }
      } finally {
        if (!silent) {
          this.loadingOrders = false
        }
      }
    },
    async updateOrderStatus(orderId, newStatus) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        })
        if (!response.ok) throw new Error('Failed to update order status')
        // Update local data
        const order = this.allOrders.find(o => o.id === orderId)
        if (order) {
          order.status = newStatus
        }
        alert(`Order #${orderId} marked as ${newStatus}`)
      } catch (error) {
        console.error('Error updating order status:', error)
        alert('Failed to update order status')
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getImageUrl(imagePath) {
      if (!imagePath) return '';
      // If it's already a full URL, return it
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // If it starts with /, it's already a root path
      if (imagePath.startsWith('/')) {
        return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`;
      }
      // Otherwise, assume it's in the uploads folder
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/${imagePath}`;
    },
    scrollToOrders() {
      if (this.$refs.ordersSection) {
        this.$refs.ordersSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

.orders-main {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.orders-header {
  text-align: center;
  margin-bottom: 24px;
}

.orders-header h1 {
  color: white;
  font-size: 1.5em;
  margin-bottom: 8px;
}

.orders-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95em;
}

.all-orders {
  background: #242442;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.pending-notification {
  background: linear-gradient(135deg, #ff9800 0%, #ff6b00 100%);
  border-left: 6px solid #ff3d00;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.pending-icon {
  font-size: 2em;
}

.pending-content {
  flex: 1;
}

.pending-content h3 {
  margin: 0 0 6px 0;
  color: white;
  font-size: 1.1em;
}

.pending-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.pending-btn {
  background: white;
  color: #ff6b00;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.toast-notification {
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 600;
}

.all-orders h2 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2em;
}

.orders-list {
  display: grid;
  gap: 12px;
}

.order-card {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-left: 4px solid #4CAF50;
}

.order-card.pending {
  border-left: 4px solid #ff9800;
  box-shadow: 0 8px 24px rgba(255, 152, 0, 0.3);
}

.order-card.processing {
  border-left: 4px solid #03a9f4;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-header h3 {
  color: white;
  margin: 0;
  font-size: 1.1em;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.processing {
  background: rgba(3, 169, 244, 0.2);
  color: #4fc3f7;
}

.status-badge.completed {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
}

.status-badge.cancelled {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
}

.order-details {
  margin-bottom: 12px;
}

.order-details p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9em;
}

.order-details strong {
  color: rgba(255, 255, 255, 0.7);
}

.order-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.btn-accept,
.btn-complete,
.btn-cancel {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s;
  flex: 1;
  min-width: 100px;
}

.btn-accept {
  background: rgba(3, 169, 244, 0.9);
  color: white;
}

.btn-accept:active {
  background: rgba(3, 169, 244, 1);
  transform: scale(0.98);
}

.btn-complete {
  background: rgba(76, 175, 80, 0.8);
  color: white;
}

.btn-complete:active {
  background: rgba(76, 175, 80, 1);
  transform: scale(0.98);
}

.btn-cancel {
  background: rgba(244, 67, 54, 0.8);
  color: white;
}

.btn-cancel:active {
  background: rgba(244, 67, 54, 1);
  transform: scale(0.98);
}

.status-text {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.product-image-small {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #242442;
}

.product-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-small {
  width: 100%;
  height: 100%;
  background: #242442;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-details p {
  margin: 4px 0;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.9);
}

.no-orders {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  padding: 40px 20px;
  font-size: 0.95em;
}

.loading {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 40px 20px;
  font-size: 0.95em;
}
</style>