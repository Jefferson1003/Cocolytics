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
            <div v-for="order in allOrders" :key="order.id" class="order-card" :class="{ pending: order.status === 'pending' || order.status === 'to_ship', processing: order.status === 'processing' }">
              <div class="order-header">
                <h3>📦 Order #{{ order.id }}</h3>
                <span :class="['status-badge', getStatusClass(order.status)]">{{ formatStatus(order.status) }}</span>
              </div>
              <div class="order-details">
                <div class="order-info-grid">
                  <div class="info-item">
                    <span class="info-label">Product:</span>
                    <span class="info-value">{{ order.size }} - {{ order.length }}cm</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Quantity:</span>
                    <span class="info-value">{{ order.quantity }} units</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Customer:</span>
                    <span class="info-value">{{ order.user_name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Ordered:</span>
                    <span class="info-value">{{ formatDate(order.created_at) }}</span>
                  </div>
                </div>
              </div>
              <div class="order-actions" v-if="order.status === 'pending' || order.status === 'to_ship' || order.status === 'processing'">
                <button
                  v-if="order.status === 'pending' || order.status === 'to_ship'"
                  @click="updateOrderStatus(order.id, 'processing')"
                  class="btn-accept"
                >
                  ✓ Accept Order
                </button>
                <button
                  v-if="order.status === 'pending' || order.status === 'to_ship'"
                  @click="updateOrderStatus(order.id, 'cancelled')"
                  class="btn-cancel"
                >
                  ✕ Cancel
                </button>
                <button
                  v-if="order.status === 'processing'"
                  @click="updateOrderStatus(order.id, 'completed')"
                  class="btn-complete"
                >
                  ✓ Mark as Completed
                </button>
              </div>
              <div class="order-status-display" v-else>
                <span class="completed-text">{{ formatStatus(order.status) }}</span>
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

        const pendingCount = data.filter(order => 
          order.status === 'pending' || order.status === 'to_ship'
        ).length
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
      // Confirmation dialogs based on action
      let confirmMessage = ''
      if (newStatus === 'processing') {
        confirmMessage = `Accept Order #${orderId} and start processing?\n\nThis will confirm the order to the customer.`
      } else if (newStatus === 'cancelled') {
        confirmMessage = `Cancel Order #${orderId}?\n\nThis action cannot be undone. The customer will be notified.`
      } else if (newStatus === 'completed') {
        confirmMessage = `Mark Order #${orderId} as completed?\n\nThis will complete the order and notify the customer.`
      }
      
      // Show confirmation dialog
      if (confirmMessage && !confirm(confirmMessage)) {
        return // User cancelled the action
      }
      
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
        
        // Success messages
        let successMsg = ''
        if (newStatus === 'processing') {
          successMsg = `✓ Order #${orderId} accepted successfully!`
        } else if (newStatus === 'cancelled') {
          successMsg = `Order #${orderId} has been cancelled`
        } else if (newStatus === 'completed') {
          successMsg = `✓ Order #${orderId} marked as completed!`
        } else {
          successMsg = `Order #${orderId} updated to ${newStatus}`
        }
        
        alert(successMsg)
        await this.fetchAllOrders(true) // Refresh the list
      } catch (error) {
        console.error('Error updating order status:', error)
        alert('Failed to update order status. Please try again.')
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
    },
    formatStatus(status) {
      const statusMap = {
        'pending': 'PENDING',
        'to_ship': 'TO SHIP',
        'processing': 'PROCESSING',
        'completed': 'COMPLETED',
        'cancelled': 'CANCELLED',
        'shipped': 'SHIPPED',
        'delivered': 'DELIVERED'
      }
      return statusMap[status] || status.toUpperCase()
    },
    getStatusClass(status) {
      if (status === 'to_ship') return 'pending'
      return status
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
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(36, 36, 66, 0.95) 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.order-card.pending {
  border-left: 5px solid #ff9800;
  box-shadow: 0 8px 32px rgba(255, 152, 0, 0.3);
}

.order-card.processing {
  border-left: 5px solid #03a9f4;
}

.order-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.order-header h3 {
  color: white;
  margin: 0;
  font-size: 1.3em;
  font-weight: 700;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.8em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-badge.processing {
  background: rgba(3, 169, 244, 0.2);
  color: #4fc3f7;
  border: 1px solid #4fc3f7;
}

.status-badge.completed {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
  border: 1px solid #81C784;
}

.status-badge.cancelled {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.order-details {
  padding: 20px;
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-value {
  color: white;
  font-size: 1.05em;
  font-weight: 600;
}

.order-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 2px solid rgba(102, 126, 234, 0.2);
}

.btn-accept,
.btn-complete,
.btn-cancel {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95em;
  transition: all 0.3s;
  min-width: 140px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-accept {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.btn-accept:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
}

.btn-accept:active {
  transform: scale(0.98);
}

.btn-complete {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);
}

.btn-complete:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.5);
}

.btn-complete:active {
  transform: scale(0.98);
}

.btn-cancel {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
}

.btn-cancel:active {
  transform: scale(0.98);
}

.order-status-display {
  padding: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-top: 2px solid rgba(102, 126, 234, 0.2);
}

.completed-text {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
  font-size: 1em;
  text-transform: uppercase;
  letter-spacing: 1px;
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