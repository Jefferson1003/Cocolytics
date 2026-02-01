<template>
  <div class="staff-layout">
    <StaffSidebar />

    <!-- Main Content -->
    <div class="orders-container">
      <div class="orders-header">
        <h1>📋 Order Management</h1>
        <p>Manage all coconut orders</p>
      </div>

      <!-- All Orders -->
      <div class="all-orders">
        <h2>🥥 All Orders</h2>
        <div v-if="!loadingOrders">
          <div v-if="allOrders.length > 0" class="orders-list">
            <div v-for="order in allOrders" :key="order.id" class="order-card">
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
                  @click="updateOrderStatus(order.id, 'completed')"
                  class="btn-complete"
                >
                  Mark as Completed
                </button>
                <button
                  v-if="order.status === 'pending'"
                  @click="updateOrderStatus(order.id, 'cancelled')"
                  class="btn-cancel"
                >
                  Cancel Order
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
      loadingOrders: false
    }
  },
  mounted() {
    this.fetchAllOrders()
  },
  methods: {
    async fetchAllOrders() {
      this.loadingOrders = true
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
      } catch (error) {
        console.error('Error fetching orders:', error)
        alert('Failed to load orders')
      } finally {
        this.loadingOrders = false
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
    }
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.orders-container {
  flex: 1;
  padding: 2rem;
  margin-left: 250px;
}

.orders-header {
  text-align: center;
  margin-bottom: 2rem;
}

.orders-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.orders-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.all-orders {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.all-orders h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.orders-list {
  display: grid;
  gap: 1.5rem;
}

.order-card {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-header h3 {
  color: #2c3e50;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #f39c12;
  color: white;
}

.status-badge.completed {
  background: #27ae60;
  color: white;
}

.status-badge.cancelled {
  background: #e74c3c;
  color: white;
}

.order-details p {
  margin: 0.5rem 0;
  color: #555;
}

.order-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-complete,
.btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
}

.btn-complete {
  background: #27ae60;
  color: white;
}

.btn-complete:hover {
  background: #229954;
}

.btn-cancel {
  background: #e74c3c;
  color: white;
}

.btn-cancel:hover {
  background: #c0392b;
}

.status-text {
  font-weight: bold;
  color: #7f8c8d;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.product-image-small {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-small {
  width: 100%;
  height: 100%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.product-details p {
  margin: 0.25rem 0;
}

.no-orders {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 2rem;
}

.loading {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}
</style>