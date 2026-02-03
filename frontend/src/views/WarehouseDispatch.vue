<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="dashboard-container">
      <div class="dispatch-container">
        <div class="header">
          <h1>📦 Warehouse Dispatch</h1>
          <p>Track products leaving the warehouse</p>
        </div>

        <!-- Dispatch Form -->
        <div class="dispatch-form-section">
          <h2>🚚 New Dispatch</h2>
          <form @submit.prevent="submitDispatch" class="dispatch-form">
            <div class="form-row">
              <div class="form-group">
                <label for="product">Product Type <span class="required">*</span></label>
                <select id="product" v-model="dispatchForm.product_id" class="form-input" required>
                  <option value="">Select Product</option>
                  <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                    {{ product.size }} - {{ product.length }}cm (Stock: {{ product.stock }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="quantity">Quantity <span class="required">*</span></label>
                <input
                  type="number"
                  id="quantity"
                  v-model.number="dispatchForm.quantity"
                  class="form-input"
                  min="1"
                  :max="selectedProductStock"
                  placeholder="Enter quantity"
                  required
                />
                <small v-if="selectedProductStock">Available: {{ selectedProductStock }} units</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="customer_name">Customer Name <span class="required">*</span></label>
                <input
                  type="text"
                  id="customer_name"
                  v-model="dispatchForm.customer_name"
                  class="form-input"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div class="form-group">
                <label for="date_released">Date Released <span class="required">*</span></label>
                <input
                  type="datetime-local"
                  id="date_released"
                  v-model="dispatchForm.date_released"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="notes">Notes (optional)</label>
              <textarea
                id="notes"
                v-model="dispatchForm.notes"
                class="form-input"
                placeholder="Delivery address, special instructions, etc."
                rows="3"
              ></textarea>
            </div>

            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <span v-if="!isSubmitting">✓ Dispatch & Deduct Inventory</span>
              <span v-else>Processing...</span>
            </button>
          </form>
        </div>

        <!-- Dispatch History -->
        <div class="dispatch-history-section">
          <div class="section-header">
            <h2>📋 Dispatch History</h2>
            <div class="filter-controls">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search customer or product..."
                class="search-input"
              />
            </div>
          </div>

          <div v-if="loading" class="loading">Loading dispatch records...</div>
          <div v-else-if="filteredDispatches.length > 0" class="table-responsive">
            <table class="dispatch-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Type</th>
                  <th>Quantity</th>
                  <th>Customer Name</th>
                  <th>Date Released</th>
                  <th>Dispatched By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dispatch in filteredDispatches" :key="dispatch.id">
                  <td class="id-cell">#{{ dispatch.id }}</td>
                  <td class="product-cell">
                    <strong>{{ dispatch.product_size }}</strong>
                    <small>{{ dispatch.product_length }}cm</small>
                  </td>
                  <td class="quantity-cell">
                    <span class="quantity-badge">{{ dispatch.quantity }} units</span>
                  </td>
                  <td>{{ dispatch.customer_name }}</td>
                  <td class="date-cell">{{ formatDate(dispatch.date_released) }}</td>
                  <td class="user-cell">{{ dispatch.user_name }}</td>
                  <td class="notes-cell">{{ dispatch.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <p class="empty-icon">📦</p>
            <p>No dispatch records yet.</p>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">✓</span>
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-error">
          <span class="alert-icon">✕</span>
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'WarehouseDispatch',
  components: {
    StaffSidebar
  },
  data() {
    return {
      availableProducts: [],
      dispatches: [],
      loading: false,
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',
      searchQuery: '',
      token: null,
      dispatchForm: {
        product_id: '',
        quantity: 0,
        customer_name: '',
        date_released: '',
        notes: ''
      }
    }
  },
  computed: {
    selectedProductStock() {
      if (!this.dispatchForm.product_id) return 0
      const product = this.availableProducts.find(p => p.id === this.dispatchForm.product_id)
      return product ? product.stock : 0
    },
    filteredDispatches() {
      if (!this.searchQuery) return this.dispatches
      const query = this.searchQuery.toLowerCase()
      return this.dispatches.filter(d =>
        d.customer_name.toLowerCase().includes(query) ||
        d.product_size.toLowerCase().includes(query)
      )
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    this.fetchProducts()
    this.fetchDispatches()
    this.setDefaultDateTime()
  },
  methods: {
    setDefaultDateTime() {
      const now = new Date()
      const offset = now.getTimezoneOffset() * 60000
      const localISOTime = new Date(now - offset).toISOString().slice(0, 16)
      this.dispatchForm.date_released = localISOTime
    },
    async fetchProducts() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/inventory`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        this.availableProducts = data.filter(p => p.stock > 0)
      } catch (error) {
        console.error('Error fetching products:', error)
        this.errorMessage = 'Failed to load products'
      }
    },
    async fetchDispatches() {
      this.loading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/warehouse/dispatches`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch dispatches')
        const data = await response.json()
        this.dispatches = data
      } catch (error) {
        console.error('Error fetching dispatches:', error)
        this.errorMessage = 'Failed to load dispatch history'
      } finally {
        this.loading = false
      }
    },
    async submitDispatch() {
      if (!this.dispatchForm.product_id || !this.dispatchForm.quantity || !this.dispatchForm.customer_name) {
        this.errorMessage = 'Please fill in all required fields'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      if (this.dispatchForm.quantity > this.selectedProductStock) {
        this.errorMessage = `Insufficient stock. Available: ${this.selectedProductStock} units`
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      this.isSubmitting = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/warehouse/dispatch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(this.dispatchForm)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to dispatch')
        }

        const result = await response.json()
        this.successMessage = `✓ Dispatched ${this.dispatchForm.quantity} units to ${this.dispatchForm.customer_name}. Inventory updated!`
        
        // Reset form
        this.dispatchForm = {
          product_id: '',
          quantity: 0,
          customer_name: '',
          date_released: '',
          notes: ''
        }
        this.setDefaultDateTime()
        
        // Refresh data
        this.fetchProducts()
        this.fetchDispatches()
        
        setTimeout(() => this.successMessage = '', 5000)
      } catch (error) {
        console.error('Error dispatching:', error)
        this.errorMessage = 'Failed to dispatch: ' + error.message
        setTimeout(() => this.errorMessage = '', 4000)
      } finally {
        this.isSubmitting = false
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
.staff-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-container {
  flex: 1;
  margin-left: 250px;
  padding: 40px;
  transition: margin-left 0.3s ease;
}

.dispatch-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5em;
  color: #242442;
  margin-bottom: 10px;
}

.header p {
  color: #666;
  font-size: 1.1em;
}

/* Dispatch Form Section */
.dispatch-form-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
}

.dispatch-form-section h2 {
  margin: 0 0 25px 0;
  color: #242442;
  font-size: 1.6em;
}

.dispatch-form {
  max-width: 900px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #242442;
  font-weight: 600;
}

.required {
  color: #e74c3c;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #888;
  font-size: 0.9em;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Dispatch History Section */
.dispatch-history-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  margin: 0;
  color: #242442;
  font-size: 1.6em;
}

.search-input {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 300px;
  font-size: 0.95em;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #667eea;
  font-size: 1.1em;
}

.table-responsive {
  overflow-x: auto;
}

.dispatch-table {
  width: 100%;
  border-collapse: collapse;
}

.dispatch-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #ddd;
}

.dispatch-table th {
  padding: 15px;
  text-align: left;
  color: #242442;
  font-weight: 600;
}

.dispatch-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.dispatch-table tbody tr:hover {
  background: #f8f9fa;
}

.id-cell {
  color: #667eea;
  font-weight: 600;
}

.product-cell {
  display: flex;
  flex-direction: column;
}

.product-cell strong {
  margin-bottom: 4px;
}

.product-cell small {
  color: #888;
}

.quantity-cell {
  font-weight: 600;
}

.quantity-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 600;
}

.date-cell {
  color: #888;
  font-size: 0.9em;
}

.user-cell {
  color: #667eea;
  font-weight: 500;
}

.notes-cell {
  color: #666;
  font-size: 0.9em;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  font-size: 1.1em;
}

/* Alerts */
.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
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

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-icon {
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .dashboard-container {
    margin-left: 0;
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .search-input {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .table-responsive {
    font-size: 0.9em;
  }

  .dispatch-table th,
  .dispatch-table td {
    padding: 10px;
  }
}
</style>
