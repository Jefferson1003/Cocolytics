<template>
  <div class="staff-layout">
    <StaffSidebar />
    <div class="tracking-main">
      <div class="tracking-container">
        <div class="header">
          <h1>📦 Order Tracking</h1>
          <p>Track your cocolumber shipments</p>
        </div>

        <!-- Tabs -->
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="['tab-btn', { active: activeTab === tab.value }]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- Active Orders -->
        <div v-if="activeTab === 'active'" class="tab-content">
          <div v-if="loadingOrders" class="loading">
            <div class="spinner"></div>
            <p>Loading your orders...</p>
          </div>

          <div v-else-if="activeOrders.length > 0" class="orders-grid">
            <div v-for="order in activeOrders" :key="order.id" class="order-card" @click="selectOrder(order)">
              <div class="order-header-card">
                <h3>Order #{{ order.id }}</h3>
                <span :class="['status-badge', order.status]">{{ formatStatus(order.status) }}</span>
              </div>
              <div class="order-details-card">
                <p><strong>Product:</strong> {{ order.size }} - {{ order.length }}cm</p>
                <p><strong>Quantity:</strong> {{ order.quantity }} units</p>
                <p><strong>Ordered:</strong> {{ formatDate(order.created_at) }}</p>
              </div>
              <div v-if="order.courier_name" class="tracking-quick-info">
                <span class="courier-badge">{{ order.courier_name }}</span>
                <span v-if="order.tracking_number" class="tracking-badge">{{ order.tracking_number }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <span class="empty-icon">📦</span>
            <p>No active orders found</p>
          </div>
        </div>

        <!-- Completed Orders -->
        <div v-if="activeTab === 'completed'" class="tab-content">
          <div v-if="loadingOrders" class="loading">
            <div class="spinner"></div>
            <p>Loading completed orders...</p>
          </div>

          <div v-else-if="completedOrders.length > 0" class="orders-list">
            <div v-for="order in completedOrders" :key="order.id" class="order-list-item">
              <div class="order-info">
                <h4>Order #{{ order.id }}</h4>
                <p>{{ order.size }} - {{ order.length }}cm × {{ order.quantity }} units</p>
                <p class="order-date">Completed: {{ formatDate(order.delivered_date || order.updated_at) }}</p>
              </div>
              <span class="status-badge completed">✓ Delivered</span>
            </div>
          </div>

          <div v-else class="empty-state">
            <span class="empty-icon">✓</span>
            <p>No completed orders</p>
          </div>
        </div>

        <!-- Order Detail Panel -->
        <div v-if="selectedOrder" class="order-detail-panel">
          <div class="detail-header">
            <h2>Order #{{ selectedOrder.id }} - Tracking Details</h2>
            <button @click="selectedOrder = null" class="close-btn">✕</button>
          </div>

          <div class="detail-content">
            <!-- Status Timeline -->
            <div class="timeline">
              <div class="timeline-item" :class="{ active: isStatusReached('pending') }">
                <div class="timeline-dot"></div>
                <div class="timeline-label">
                  <h4>Order Placed</h4>
                  <p>{{ formatDate(selectedOrder.created_at) }}</p>
                </div>
              </div>

              <div class="timeline-item" :class="{ active: isStatusReached('preparing_shipment') }">
                <div class="timeline-dot"></div>
                <div class="timeline-label">
                  <h4>Preparing Shipment</h4>
                  <p>Getting your order ready</p>
                </div>
              </div>

              <div class="timeline-item" :class="{ active: isStatusReached('shipped') }">
                <div class="timeline-dot"></div>
                <div class="timeline-label">
                  <h4>Shipped</h4>
                  <p v-if="selectedOrder.shipped_date">{{ formatDate(selectedOrder.shipped_date) }}</p>
                  <p v-else>In transit</p>
                </div>
              </div>

              <div class="timeline-item" :class="{ active: isStatusReached('delivered') }">
                <div class="timeline-dot"></div>
                <div class="timeline-label">
                  <h4>Delivered</h4>
                  <p v-if="selectedOrder.delivered_date">{{ formatDate(selectedOrder.delivered_date) }}</p>
                  <p v-else>Waiting for delivery</p>
                </div>
              </div>

              <div class="timeline-item" :class="{ active: isStatusReached('completed') }">
                <div class="timeline-dot"></div>
                <div class="timeline-label">
                  <h4>Completed</h4>
                  <p>Order confirmed received</p>
                </div>
              </div>
            </div>

            <!-- Shipping Information -->
            <div v-if="selectedOrder.status !== 'pending'" class="shipping-info">
              <h3>📮 Shipping Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Courier:</span>
                  <span class="value">{{ selectedOrder.courier_name || 'Not yet assigned' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Tracking Number:</span>
                  <span class="value tracking-number">{{ selectedOrder.tracking_number || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Status:</span>
                  <span :class="['value', selectedOrder.status]">{{ formatStatus(selectedOrder.status) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Shipped Date:</span>
                  <span class="value">{{ selectedOrder.shipped_date ? formatDate(selectedOrder.shipped_date) : 'Pending' }}</span>
                </div>
              </div>

              <!-- Tracking Updates -->
              <div v-if="trackingUpdates.length > 0" class="tracking-updates">
                <h4>📍 Recent Updates</h4>
                <div v-for="update in trackingUpdates" :key="update.id" class="update-item">
                  <span class="update-time">{{ formatTime(update.timestamp) }}</span>
                  <p class="update-message">{{ update.update_message }}</p>
                  <span v-if="update.location" class="update-location">📍 {{ update.location }}</span>
                </div>
              </div>

              <!-- Copy Tracking Number -->
              <div v-if="selectedOrder.tracking_number" class="action-buttons">
                <button @click="copyTrackingNumber" class="btn btn-copy">
                  📋 Copy Tracking Number
                </button>
              </div>
            </div>

            <!-- Delivery Confirmation Section -->
            <div v-if="selectedOrder.status === 'delivered' && selectedOrder.status !== 'completed'" class="delivery-confirmation">
              <h3>✓ Confirm Receipt</h3>
              <p>Has your order arrived in good condition?</p>
              <div class="confirmation-buttons">
                <button @click="confirmDelivery(selectedOrder.id, true)" class="btn btn-success">
                  ✓ Yes, Received Successfully
                </button>
                <button @click="confirmDelivery(selectedOrder.id, false)" class="btn btn-warning">
                  ⚠️ Issue with Delivery
                </button>
              </div>
            </div>

            <!-- Order Items -->
            <div class="order-items">
              <h3>📦 Order Items</h3>
              <div class="item-detail">
                <p><strong>Product:</strong> {{ selectedOrder.size }} - {{ selectedOrder.length }}cm</p>
                <p><strong>Quantity:</strong> {{ selectedOrder.quantity }} units</p>
                <p><strong>Status:</strong> <span :class="['status-badge', selectedOrder.status]">{{ formatStatus(selectedOrder.status) }}</span></p>
              </div>
            </div>
          </div>

          <div v-if="confirmationMessage" :class="['message', confirmationMessage.type]">{{ confirmationMessage.text }}</div>
        </div>
      </div>

      <!-- Mobile Order Detail Modal -->
      <div v-if="selectedOrder && isMobile" class="modal-overlay" @click="selectedOrder = null">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Order #{{ selectedOrder.id }}</h2>
            <button @click="selectedOrder = null" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Show same content as panel for mobile -->
            <div class="timeline">
              <div class="timeline-item" :class="{ active: isStatusReached('preparing_shipment') }">
                <div class="timeline-dot"></div>
                <p>Preparing</p>
              </div>
              <div class="timeline-item" :class="{ active: isStatusReached('shipped') }">
                <div class="timeline-dot"></div>
                <p>Shipped</p>
              </div>
              <div class="timeline-item" :class="{ active: isStatusReached('delivered') }">
                <div class="timeline-dot"></div>
                <p>Delivered</p>
              </div>
              <div class="timeline-item" :class="{ active: isStatusReached('completed') }">
                <div class="timeline-dot"></div>
                <p>Completed</p>
              </div>
            </div>
            <div class="shipping-info-mobile">
              <p><strong>Courier:</strong> {{ selectedOrder.courier_name || 'Not assigned' }}</p>
              <p><strong>Tracking:</strong> {{ selectedOrder.tracking_number || 'N/A' }}</p>
            </div>
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
      activeTab: 'active',
      tabs: [
        { label: 'Active Orders', value: 'active', icon: '📦' },
        { label: 'Completed', value: 'completed', icon: '✓' }
      ],
      allOrders: [],
      selectedOrder: null,
      trackingUpdates: [],
      loadingOrders: false,
      token: null,
      confirmationMessage: null,
      isMobile: false
    }
  },
  computed: {
    activeOrders() {
      return this.allOrders.filter(o => !['completed', 'cancelled'].includes(o.status))
    },
    completedOrders() {
      return this.allOrders.filter(o => o.status === 'completed')
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    if (!this.token) {
      this.$router.push('/login')
      return
    }
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    this.loadOrders()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768
    },
    async loadOrders() {
      this.loadingOrders = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/buyer/orders`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.allOrders = await response.json()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loadingOrders = false
      }
    },
    selectOrder(order) {
      this.selectedOrder = order
      this.loadTrackingUpdates(order.id)
    },
    async loadTrackingUpdates(orderId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/tracking`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.trackingUpdates = await response.json()
      } catch (error) {
        console.error('Error:', error)
      }
    },
    isStatusReached(status) {
      const statuses = ['pending', 'preparing_shipment', 'shipped', 'delivered', 'completed']
      const currentIndex = statuses.indexOf(this.selectedOrder?.status)
      const statusIndex = statuses.indexOf(status)
      return currentIndex >= statusIndex
    },
    formatStatus(status) {
      const statusMap = {
        'pending': 'Pending',
        'preparing_shipment': 'Preparing Shipment',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      }
      return statusMap[status] || status
    },
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatTime(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    copyTrackingNumber() {
      if (this.selectedOrder?.tracking_number) {
        navigator.clipboard.writeText(this.selectedOrder.tracking_number)
        this.showMessage('Tracking number copied!', 'success')
      }
    },
    async confirmDelivery(orderId, isSuccessful) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/confirm-delivery`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ confirmed: isSuccessful })
        })
        if (!response.ok) throw new Error('Failed')
        this.showMessage('Thank you for confirming delivery!', 'success')
        await this.loadOrders()
        this.selectedOrder = null
      } catch (error) {
        this.showMessage('Error confirming delivery', 'error')
      }
    },
    showMessage(text, type) {
      this.confirmationMessage = { text, type }
      setTimeout(() => {
        this.confirmationMessage = null
      }, 3000)
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

.tracking-main {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.tracking-container {
  max-width: 100%;
}

.header {
  margin-bottom: 24px;
  text-align: center;
}

.header h1 {
  font-size: 2.5em;
  color: white;
  margin-bottom: 8px;
  font-weight: 700;
}

.header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1em;
}

/* Tab Navigation */
.tabs-header {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.tab-btn.active {
  background: white;
  color: #667eea;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.order-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.order-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-header-card h3 {
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

.status-badge.preparing_shipment {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.status-badge.shipped {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.delivered {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
}

.status-badge.completed {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.order-details-card {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
  margin-bottom: 12px;
}

.order-details-card p {
  margin: 4px 0;
}

.tracking-quick-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.courier-badge,
.tracking-badge {
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 600;
}

/* Order Detail Panel */
.order-detail-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-header h2 {
  color: white;
  margin: 0;
  font-size: 1.5em;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Timeline Styles */
.timeline {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(102, 126, 234, 0.2);
  z-index: 1;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.timeline-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.2);
  border: 2px solid rgba(102, 126, 234, 0.5);
  margin-bottom: 12px;
  transition: all 0.3s;
}

.timeline-item.active .timeline-dot {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.timeline-label {
  text-align: center;
}

.timeline-label h4 {
  margin: 0;
  color: white;
  font-size: 0.9em;
}

.timeline-label p {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8em;
}

/* Shipping Info */
.shipping-info {
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #667eea;
  border-radius: 8px;
  padding: 16px;
}

.shipping-info h3,
.tracking-updates h4,
.order-items h3,
.delivery-confirmation h3 {
  color: white;
  font-size: 1.1em;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 12px;
}

.info-item .label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  margin-bottom: 4px;
}

.info-item .value {
  display: block;
  color: white;
  font-weight: 600;
  font-size: 0.95em;
}

.info-item .value.shipped,
.info-item .value.delivered,
.info-item .value.completed {
  color: #4caf50;
}

.tracking-number {
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 3px;
}

/* Tracking Updates */
.tracking-updates {
  margin-bottom: 16px;
}

.update-item {
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid #667eea;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.update-time {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8em;
  margin-bottom: 4px;
}

.update-message {
  color: white;
  margin: 4px 0;
  font-size: 0.9em;
}

.update-location {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
  margin-top: 4px;
}

/* Delivery Confirmation */
.delivery-confirmation {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 16px;
}

.delivery-confirmation p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.confirmation-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.3s;
}

.btn-copy {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-copy {
  margin-top: 12px;
  display: inline-block;
}

.action-buttons {
  margin-top: 12px;
}

/* Order Items */
.order-items {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
}

.item-detail {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 12px;
}

.item-detail p {
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-list-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info h4 {
  margin: 0;
  color: white;
  font-size: 1em;
}

.order-info p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
}

.order-date {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.5);
}

/* Loading & Empty States */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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
  display: block;
  margin-bottom: 12px;
}

/* Message */
.message {
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
  display: inline-block;
}

.message.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.message.error {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

/* Modal for Mobile */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  z-index: 2000;
}

.modal-content {
  background: #242442;
  border-radius: 12px 12px 0 0;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1em;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.shipping-info-mobile {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.shipping-info-mobile p {
  color: white;
  margin: 8px 0;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .timeline {
    flex-direction: column;
    gap: 16px;
  }

  .timeline::before {
    display: none;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 12px;
    font-size: 0.85em;
  }

  .order-detail-panel {
    display: none;
  }
}
</style>
