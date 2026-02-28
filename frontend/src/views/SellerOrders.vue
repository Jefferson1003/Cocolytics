<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="orders-main">
      <div class="orders-header">
        <h1>📋 Seller Order Management</h1>
        <p>Manage orders with shipping workflow</p>
      </div>

      <!-- Tabs -->
      <div class="tabs-header">
        <button 
          v-for="tab in orderTabs" 
          :key="tab.value"
          @click="activeOrderTab = tab.value"
          :class="['tab-btn', { active: activeOrderTab === tab.value }]"
        >
          {{ tab.icon }} {{ tab.label }} <span v-if="tab.count" class="count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Pending Orders -->
      <div v-if="activeOrderTab === 'pending'" class="tab-content">
        <div v-if="pendingOrders.length > 0" class="notification-banner">
          <span class="icon">🔔</span>
          <span><strong>{{ pendingOrders.length }}</strong> order{{ pendingOrders.length > 1 ? 's' : '' }} awaiting your action</span>
        </div>

        <div v-if="loadingOrders" class="loading">Loading orders...</div>
        
        <div v-else class="orders-list">
          <div v-for="order in pendingOrders" :key="order.id" class="order-card pending-card">
            <div class="order-header">
              <h3>📦 Order #{{ order.id }}</h3>
              <span class="status-badge pending">{{ formatStatus(order.status) }}</span>
            </div>
            <div class="order-body">
              <div class="order-info">
                <p><strong>Product:</strong> {{ order.size }} - {{ order.length }}cm</p>
                <p><strong>Quantity:</strong> {{ order.quantity }} units</p>
                <p><strong>Customer:</strong> {{ order.user_name }}</p>
                <p><strong>Ordered:</strong> {{ formatDate(order.created_at) }}</p>
              </div>
            </div>
            <div class="order-actions">
              <button @click="acceptOrder(order.id)" class="btn btn-accept">✓ Accept Order</button>
              <button @click="rejectOrder(order.id)" class="btn btn-reject">✕ Reject Order</button>
            </div>
          </div>
        </div>

        <div v-if="!loadingOrders && pendingOrders.length === 0" class="empty-state">
          <span class="empty-icon">✓</span>
          <p>No pending orders</p>
        </div>
      </div>

      <!-- Processing Orders (Ready to Ship with Shipping Form) -->
      <div v-if="activeOrderTab === 'processing'" class="tab-content">
        <div v-if="loadingOrders" class="loading">Loading orders...</div>
        
        <div v-else class="processing-orders">
          <div v-for="order in processingOrders" :key="order.id" class="order-card processing-card">
            <div class="order-header">
              <h3>📦 Order #{{ order.id }}</h3>
              <span class="status-badge preparing">{{ formatStatus(order.status) }}</span>
            </div>

            <div class="order-body">
              <div class="order-info">
                <p><strong>Product:</strong> {{ order.size }} - {{ order.length }}cm × {{ order.quantity }} units</p>
                <p><strong>Customer:</strong> {{ order.user_name }} ({{ order.email }})</p>
              </div>

              <!-- Shipping Form -->
              <div class="shipping-form">
                <h4>📮 Add Shipping Information</h4>
                <div class="form-group">
                  <label>Courier Name *</label>
                  <select v-model="getShippingForm(order.id).courier_name" 
                    class="form-input">
                    <option value="">Select Courier</option>
                    <option value="JNT">J&T Express</option>
                    <option value="LBC">LBC Express</option>
                    <option value="2GO">2GO Express</option>
                    <option value="LALAMOVE">Lalamove</option>
                    <option value="GRABEXPRESS">GrabExpress</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Courier Name (if Other) *</label>
                  <input 
                    type="text" 
                    v-model="getShippingForm(order.id).courier_custom"
                    placeholder="e.g., Local Courier"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Tracking Number *</label>
                  <input 
                    type="text" 
                    v-model="getShippingForm(order.id).tracking_number"
                    placeholder="e.g., JNT123456789"
                    class="form-input"
                  />
                </div>

                <button 
                  @click="shipOrder(order.id)" 
                  class="btn btn-ship"
                  :disabled="!canShip(order.id)"
                >
                  🚚 Mark as Shipped
                </button>
              </div>
            </div>
          </div>

          <div v-if="processingOrders.length === 0" class="empty-state">
            <span class="empty-icon">📦</span>
            <p>No orders ready to ship</p>
          </div>
        </div>
      </div>

      <!-- In Transit Orders -->
      <div v-if="activeOrderTab === 'intransit'" class="tab-content">
        <div v-if="loadingOrders" class="loading">Loading orders...</div>
        
        <div v-else class="orders-list">
          <div v-for="order in inTransitOrders" :key="order.id" class="order-card transit-card">
            <div class="order-header">
              <h3>📦 Order #{{ order.id }}</h3>
              <span class="status-badge shipped">{{ formatStatus(order.status) }}</span>
            </div>
            <div class="order-body">
              <div class="order-info">
                <p><strong>Product:</strong> {{ order.size }} - {{ order.length }}cm × {{ order.quantity }} units</p>
                <p><strong>Customer:</strong> {{ order.user_name }}</p>
                <p><strong>Courier:</strong> {{ order.courier_name }}</p>
                <p><strong>Tracking:</strong> <code>{{ order.tracking_number }}</code></p>
                <p><strong>Shipped:</strong> {{ formatDate(order.shipped_date) }}</p>
              </div>
            </div>
            <div class="order-actions">
              <button @click="markDelivered(order.id)" class="btn btn-delivered">✓ Mark as Delivered</button>
            </div>
          </div>
        </div>

        <div v-if="inTransitOrders.length === 0" class="empty-state">
          <span class="empty-icon">📦</span>
          <p>No orders in transit</p>
        </div>
      </div>

      <!-- Completed Orders -->
      <div v-if="activeOrderTab === 'completed'" class="tab-content">
        <div v-if="loadingOrders" class="loading">Loading orders...</div>
        
        <div v-else class="orders-list">
          <div v-for="order in completedOrders" :key="order.id" class="order-card completed-card">
            <div class="order-header">
              <h3>✓ Order #{{ order.id }}</h3>
              <span class="status-badge completed">{{ formatStatus(order.status) }}</span>
            </div>
            <div class="order-body">
              <div class="order-info">
                <p><strong>Product:</strong> {{ order.size }} - {{ order.length }}cm × {{ order.quantity }} units</p>
                <p><strong>Customer:</strong> {{ order.user_name }}</p>
                <p><strong>Completed:</strong> {{ formatDate(order.delivered_date || order.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="completedOrders.length === 0" class="empty-state">
          <span class="empty-icon">✓</span>
          <p>No completed orders yet</p>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'StaffOrdersEnhanced',
  components: {
    StaffSidebar
  },
  data() {
    return {
      activeOrderTab: 'pending',
      allOrders: [],
      loadingOrders: false,
      shippingForms: {},
      token: null,
      successMessage: '',
      errorMessage: '',
      pollIntervalId: null
    }
  },
  computed: {
    orderTabs() {
      return [
        { label: 'To Ship', value: 'pending', icon: '📦', count: this.pendingOrders.length },
        { label: 'To Deliver', value: 'processing', icon: '🚚', count: this.processingOrders.length },
        { label: 'In Transit', value: 'intransit', icon: '🚛', count: this.inTransitOrders.length },
        { label: 'Delivered', value: 'completed', icon: '✓', count: this.completedOrders.length }
      ]
    },
    pendingOrders() {
      return this.allOrders.filter(o => o.status === 'to_ship' || o.status === 'pending')
    },
    processingOrders() {
      return this.allOrders.filter(o => o.status === 'processing' || o.status === 'preparing_shipment')
    },
    inTransitOrders() {
      return this.allOrders.filter(o => o.status === 'to_deliver' || o.status === 'shipped')
    },
    completedOrders() {
      return this.allOrders.filter(o => o.status === 'completed' || o.status === 'delivered')
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    if (!this.token) {
      this.$router.push('/login')
      return
    }
    this.loadOrders()
    this.startPolling()
  },
  beforeUnmount() {
    this.stopPolling()
  },
  methods: {
    startPolling() {
      this.pollIntervalId = setInterval(() => {
        this.loadOrders(true)
      }, 15000)
    },
    stopPolling() {
      if (this.pollIntervalId) clearInterval(this.pollIntervalId)
    },
    async loadOrders(silent = false) {
      if (!silent) this.loadingOrders = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/all`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.allOrders = await response.json()
      } catch (error) {
        console.error('Error:', error)
        if (!silent) this.errorMessage = 'Failed to load orders'
      } finally {
        if (!silent) this.loadingOrders = false
      }
    },
    async acceptOrder(orderId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ status: 'to_deliver' })
        })
        if (!response.ok) throw new Error('Failed')
        this.successMessage = `✓ Order #${orderId} accepted!`
        await this.loadOrders()
        setTimeout(() => { this.successMessage = '' }, 3000)
      } catch (error) {
        this.errorMessage = 'Failed to accept order'
      }
    },
    async rejectOrder(orderId) {
      if (!confirm('Are you sure you want to reject this order?')) return
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ status: 'cancelled' })
        })
        if (!response.ok) throw new Error('Failed')
        this.successMessage = `Order #${orderId} rejected`
        await this.loadOrders()
        setTimeout(() => { this.successMessage = '' }, 3000)
      } catch (error) {
        this.errorMessage = 'Failed to reject order'
      }
    },
    getShippingForm(orderId) {
      if (!this.shippingForms[orderId]) {
        this.$set(this.shippingForms, orderId, { courier_name: '', courier_custom: '', tracking_number: '' })
      }
      return this.shippingForms[orderId]
    },
    canShip(orderId) {
      const form = this.shippingForms[orderId]
      if (!form) return false
      const courierName = form.courier_name === 'OTHER' ? form.courier_custom : form.courier_name
      return courierName && form.tracking_number
    },
    async shipOrder(orderId) {
      const form = this.shippingForms[orderId]
      if (!this.canShip(orderId)) {
        this.errorMessage = 'Please fill in all shipping details'
        return
      }

      try {
        const courierName = form.courier_name === 'OTHER' ? form.courier_custom : form.courier_name
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/ship`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            status: 'shipped',
            courier_name: courierName,
            tracking_number: form.tracking_number
          })
        })
        if (!response.ok) throw new Error('Failed')
        this.successMessage = `✓ Order #${orderId} shipped with tracking ${form.tracking_number}`
        delete this.shippingForms[orderId]
        await this.loadOrders()
        setTimeout(() => { this.successMessage = '' }, 3000)
      } catch (error) {
        this.errorMessage = 'Failed to ship order'
      }
    },
    async markDelivered(orderId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ status: 'delivered' })
        })
        if (!response.ok) throw new Error('Failed')
        this.successMessage = `✓ Order #${orderId} marked as delivered`
        await this.loadOrders()
        setTimeout(() => { this.successMessage = '' }, 3000)
      } catch (error) {
        this.errorMessage = 'Failed to update order'
      }
    },
    formatStatus(status) {
      const map = {
        'to_ship': 'To Ship',
        'to_deliver': 'To Deliver',
        'pending': 'Pending',
        'processing': 'Processing',
        'preparing_shipment': 'Preparing Shipment',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      }
      return map[status] || status
    },
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
  font-size: 2.2em;
  margin-bottom: 8px;
  font-weight: 700;
}

.orders-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1em;
}

/* Tabs */
.tabs-header {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.tab-btn.active {
  background: white;
  color: #667eea;
}

.count {
  background: rgba(255, 193, 7, 0.9);
  color: #333;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8em;
  font-weight: 700;
}

.tab-btn.active .count {
  background: #667eea;
  color: white;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Notification Banner */
.notification-banner {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%);
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-banner .icon {
  font-size: 1.5em;
}

/* Orders List */
.orders-list,
.processing-orders {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.order-card.pending-card {
  border-left: 4px solid #ff9800;
}

.order-card.processing-card {
  border-left: 4px solid #2196f3;
}

.order-card.transit-card {
  border-left: 4px solid #4caf50;
}

.order-card.completed-card {
  border-left: 4px solid #9c27b0;
  opacity: 0.8;
}

.order-header {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.order-header h3 {
  margin: 0;
  color: white;
  font-size: 1.1em;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75em;
  font-weight: 600;
  display: inline-block;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.preparing {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.status-badge.shipped {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.completed {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
}

.order-body {
  padding: 16px;
}

.order-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
  margin-bottom: 12px;
}

.order-info p {
  margin: 6px 0;
}

.order-info code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

/* Shipping Form */
.shipping-form {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.shipping-form h4 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 1em;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
  margin-bottom: 6px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.9em;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.form-input option {
  background: #242442;
  color: white;
}

.order-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 16px 16px 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  margin-top: 12px;
  padding-top: 12px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85em;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-accept {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.btn-reject {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: white;
}

.btn-ship {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  width: 100%;
}

.btn-ship:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delivered {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: white;
}

/* Messages */
.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.alert-success {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.alert-error {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 12px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .order-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 8px;
    font-size: 0.85em;
  }

  .count {
    font-size: 0.7em;
  }
}
</style>
