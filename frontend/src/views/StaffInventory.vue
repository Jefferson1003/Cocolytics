<template>
  <div class="staff-layout">
    <StaffSidebar />

    <!-- Main Content -->
    <div class="inventory-main">
      <div class="inventory-container">
        <div class="header">
          <h1>📦 Cocolumber Inventory</h1>
          <p>View and manage your cocolumber stock</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <p class="stat-label">Total Products</p>
              <p class="stat-value">{{ inventory.length }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <p class="stat-label">Total Stock</p>
              <p class="stat-value">{{ totalStock }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-info">
              <p class="stat-label">Low Stock (&lt; 10)</p>
              <p class="stat-value">{{ lowStockCount }}</p>
            </div>
          </div>
        </div>

        <!-- Inventory Table -->
        <div class="inventory-section">
          <div class="section-header">
            <h2>Stock Details</h2>
            <router-link to="/staff/add-cocolumber" class="btn-add-product">
              + Add New Product
            </router-link>
          </div>

          <div v-if="loading" class="loading">Loading inventory...</div>
          <div v-else-if="inventory.length > 0" class="table-responsive">
            <table class="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Size</th>
                  <th>Length (cm)</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Added Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in inventory" :key="item.id" :class="{ 'low-stock': item.stock < 10 }">
                  <td class="id-cell">{{ item.id }}</td>
                  <td class="size-cell">
                    <div class="product-image-small">
                      <img v-if="item.product_picture" :src="getImageUrl(item.product_picture)" :alt="item.size" />
                      <div v-else class="no-image">🥥</div>
                    </div>
                    <span>{{ item.size }}</span>
                  </td>
                  <td>{{ item.length }} cm</td>
                  <td class="stock-cell">
                    <span class="stock-badge" :class="{ critical: item.stock < 5, warning: item.stock >= 5 && item.stock < 10 }">
                      {{ item.stock }} units
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :class="{ available: item.stock > 0, unavailable: item.stock === 0 }">
                      {{ item.stock > 0 ? 'Available' : 'Out of Stock' }}
                    </span>
                  </td>
                  <td class="date-cell">{{ formatDate(item.created_at) }}</td>
                  <td class="actions-cell">
                    <button @click="stockIn(item)" class="btn-action btn-stock-in" title="Stock In">📥</button>
                    <button @click="dispatch(item)" class="btn-action btn-dispatch" title="Dispatch">📤</button>
                    <button @click="adjust(item)" class="btn-action btn-adjust" title="Adjust">⚙️</button>
                    <button @click="editItem(item)" class="btn-action btn-edit" title="Edit">✏️</button>
                    <button @click="deleteItem(item.id)" class="btn-action btn-delete" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <p class="empty-icon">📦</p>
            <p>No products in inventory yet.</p>
            <router-link to="/staff/add-cocolumber" class="btn-add-first">
              Add Your First Product
            </router-link>
          </div>
        </div>

        <!-- Low Stock Alert -->
        <div v-if="lowStockItems.length > 0" class="low-stock-alert">
          <h3>⚠️ Low Stock Alert</h3>
          <p>The following products have low stock:</p>
          <ul>
            <li v-for="item in lowStockItems" :key="item.id">
              <strong>{{ item.size }}</strong> - Only {{ item.stock }} units left
            </li>
          </ul>
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

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Edit Product Stock</h2>
            <button class="modal-close" @click="closeEditModal">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="editingItem" class="edit-form">
              <div class="form-group">
                <label>Size</label>
                <input type="text" v-model="editingItem.size" class="form-input" disabled />
              </div>
              <div class="form-group">
                <label>Length (cm)</label>
                <input type="number" v-model.number="editingItem.length" class="form-input" disabled />
              </div>
              <div class="form-group">
                <label>Stock Quantity</label>
                <input type="number" v-model.number="editingItem.stock" class="form-input" min="0" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditModal" class="btn-cancel">Cancel</button>
            <button @click="saveEdit" class="btn-save">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Stock In Modal -->
      <div v-if="showStockInModal" class="modal-overlay" @click="closeStockInModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>📥 Stock In - {{ selectedProduct?.size }}</h2>
            <button class="modal-close" @click="closeStockInModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Quantity to Add</label>
              <input type="number" v-model.number="stockInForm.quantity" class="form-input" min="1" placeholder="Enter quantity" />
            </div>
            <div class="form-group">
              <label>Reason (optional)</label>
              <textarea v-model="stockInForm.reason" class="form-input" placeholder="e.g., Supplier delivery, Return from order" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeStockInModal" class="btn-cancel">Cancel</button>
            <button @click="confirmStockIn" class="btn-save">Add Stock</button>
          </div>
        </div>
      </div>

      <!-- Dispatch Modal -->
      <div v-if="showDispatchModal" class="modal-overlay" @click="closeDispatchModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>📤 Dispatch - {{ selectedProduct?.size }}</h2>
            <button class="modal-close" @click="closeDispatchModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Current Stock: <strong>{{ selectedProduct?.stock }} units</strong></label>
            </div>
            <div class="form-group">
              <label>Quantity to Dispatch</label>
              <input type="number" v-model.number="dispatchForm.quantity" class="form-input" min="1" :max="selectedProduct?.stock" placeholder="Enter quantity" />
            </div>
            <div class="form-group">
              <label>Reason (optional)</label>
              <textarea v-model="dispatchForm.reason" class="form-input" placeholder="e.g., Order #123, Customer delivery" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDispatchModal" class="btn-cancel">Cancel</button>
            <button @click="confirmDispatch" class="btn-save">Dispatch</button>
          </div>
        </div>
      </div>

      <!-- Adjust Stock Modal -->
      <div v-if="showAdjustModal" class="modal-overlay" @click="closeAdjustModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>⚙️ Adjust Stock - {{ selectedProduct?.size }}</h2>
            <button class="modal-close" @click="closeAdjustModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Current Stock: <strong>{{ selectedProduct?.stock }} units</strong></label>
            </div>
            <div class="form-group">
              <label>Adjustment (+ or -)</label>
              <input type="number" v-model.number="adjustForm.quantity" class="form-input" placeholder="e.g., +5 or -3" />
            </div>
            <div class="form-group">
              <label>Reason <span class="required">*</span></label>
              <textarea v-model="adjustForm.reason" class="form-input" placeholder="e.g., Damage count, inventory mismatch, expired items removed" rows="3" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeAdjustModal" class="btn-cancel">Cancel</button>
            <button @click="confirmAdjust" class="btn-save">Adjust Stock</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'StaffInventory',
  components: {
    StaffSidebar
  },
  data() {
    return {
      inventory: [],
      loading: false,
      successMessage: '',
      errorMessage: '',
      token: null,
      showEditModal: false,
      editingItem: null,
      originalItem: null,
      showStockInModal: false,
      showDispatchModal: false,
      showAdjustModal: false,
      selectedProduct: null,
      stockInForm: {
        quantity: 0,
        reason: ''
      },
      dispatchForm: {
        quantity: 0,
        reason: ''
      },
      adjustForm: {
        quantity: 0,
        reason: ''
      }
    }
  },
  computed: {
    totalStock() {
      return this.inventory.reduce((sum, item) => sum + item.stock, 0)
    },
    lowStockCount() {
      return this.inventory.filter(item => item.stock < 10).length
    },
    lowStockItems() {
      return this.inventory.filter(item => item.stock < 10).sort((a, b) => a.stock - b.stock)
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    this.fetchInventory()
  },
  methods: {
    async fetchInventory() {
      this.loading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/inventory`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch inventory')
        const data = await response.json()
        this.inventory = data
      } catch (error) {
        console.error('Error fetching inventory:', error)
        this.errorMessage = 'Failed to load inventory'
      } finally {
        this.loading = false
      }
    },
    editItem(item) {
      this.editingItem = JSON.parse(JSON.stringify(item))
      this.originalItem = item
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.editingItem = null
      this.originalItem = null
    },
    async saveEdit() {
      if (!this.editingItem) return

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${this.editingItem.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              stock: this.editingItem.stock
            })
          }
        )

        if (!response.ok) throw new Error('Failed to update stock')

        this.successMessage = '✓ Stock updated successfully!'
        this.closeEditModal()
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        console.error('Error updating stock:', error)
        this.errorMessage = 'Failed to update stock: ' + error.message
        setTimeout(() => this.errorMessage = '', 4000)
      }
    },
    async deleteItem(itemId) {
      if (!confirm('Are you sure you want to delete this product?')) return

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${itemId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          }
        )

        if (!response.ok) throw new Error('Failed to delete product')

        this.successMessage = '✓ Product deleted successfully!'
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        console.error('Error deleting product:', error)
        this.errorMessage = 'Failed to delete product: ' + error.message
        setTimeout(() => this.errorMessage = '', 4000)
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      if (imagePath.startsWith('http')) return imagePath
      if (imagePath.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/${imagePath}`
    },
    stockIn(item) {
      this.selectedProduct = item
      this.stockInForm = { quantity: 0, reason: '' }
      this.showStockInModal = true
    },
    closeStockInModal() {
      this.showStockInModal = false
      this.selectedProduct = null
      this.stockInForm = { quantity: 0, reason: '' }
    },
    async confirmStockIn() {
      if (!this.stockInForm.quantity || this.stockInForm.quantity <= 0) {
        this.errorMessage = 'Quantity must be greater than 0'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${this.selectedProduct.id}/stock-in`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              quantity: this.stockInForm.quantity,
              reason: this.stockInForm.reason || null
            })
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to add stock')
        }

        this.successMessage = `✓ Added ${this.stockInForm.quantity} units to ${this.selectedProduct.size}!`
        this.closeStockInModal()
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        console.error('Error adding stock:', error)
        this.errorMessage = 'Failed to add stock: ' + error.message
        setTimeout(() => this.errorMessage = '', 4000)
      }
    },
    dispatch(item) {
      this.selectedProduct = item
      this.dispatchForm = { quantity: 0, reason: '' }
      this.showDispatchModal = true
    },
    closeDispatchModal() {
      this.showDispatchModal = false
      this.selectedProduct = null
      this.dispatchForm = { quantity: 0, reason: '' }
    },
    async confirmDispatch() {
      if (!this.dispatchForm.quantity || this.dispatchForm.quantity <= 0) {
        this.errorMessage = 'Quantity must be greater than 0'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${this.selectedProduct.id}/dispatch`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              quantity: this.dispatchForm.quantity,
              reason: this.dispatchForm.reason || null
            })
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to dispatch')
        }

        this.successMessage = `✓ Dispatched ${this.dispatchForm.quantity} units of ${this.selectedProduct.size}!`
        this.closeDispatchModal()
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        console.error('Error dispatching stock:', error)
        this.errorMessage = 'Failed to dispatch: ' + error.message
        setTimeout(() => this.errorMessage = '', 4000)
      }
    },
    adjust(item) {
      this.selectedProduct = item
      this.adjustForm = { quantity: 0, reason: '' }
      this.showAdjustModal = true
    },
    closeAdjustModal() {
      this.showAdjustModal = false
      this.selectedProduct = null
      this.adjustForm = { quantity: 0, reason: '' }
    },
    async confirmAdjust() {
      if (this.adjustForm.quantity === undefined || this.adjustForm.quantity === null) {
        this.errorMessage = 'Adjustment quantity is required'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      if (!this.adjustForm.reason || this.adjustForm.reason.trim() === '') {
        this.errorMessage = 'Reason for adjustment is required'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${this.selectedProduct.id}/adjust`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              quantity: this.adjustForm.quantity,
              reason: this.adjustForm.reason
            })
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to adjust stock')
        }

        const adjString = this.adjustForm.quantity > 0 ? `+${this.adjustForm.quantity}` : `${this.adjustForm.quantity}`
        this.successMessage = `✓ Stock adjusted by ${adjString} units!`
        this.closeAdjustModal()
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        console.error('Error adjusting stock:', error)
        this.errorMessage = 'Failed to adjust stock: ' + error.message
        setTimeout(() => this.errorMessage = '', 4000)
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

.inventory-main {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.inventory-container {
  max-width: 100%;
}

.header {
  margin-bottom: 24px;
  text-align: center;
}

.header h1 {
  font-size: 1.5em;
  color: white;
  margin-bottom: 8px;
}

.header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95em;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: #242442;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border-left: 4px solid #667eea;
}

.stat-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
}

.stat-value {
  margin: 4px 0 0 0;
  color: white;
  font-size: 1.6em;
  font-weight: bold;
}

/* Inventory Section */
.inventory-section {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  color: white;
  font-size: 1.2em;
}

.btn-add-product {
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9em;
  transition: transform 0.2s;
  white-space: nowrap;
}

.btn-add-product:active {
  transform: scale(0.95);
}

.loading {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1em;
}

/* Mobile Card Layout instead of table */
.table-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.inventory-table {
  display: none; /* Hide table on mobile */
}

/* Create mobile card view */
.inventory-table tbody tr {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 4px solid #667eea;
}

.inventory-table tbody tr.low-stock {
  background: rgba(255, 193, 7, 0.1);
  border-left-color: #ffc107;
}

.inventory-table td {
  padding: 0;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inventory-table td::before {
  content: attr(data-label);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
}

.id-cell {
  color: #667eea;
  font-weight: 600;
}

.size-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image-small {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: #242442;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 1.5em;
}

.stock-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85em;
  font-weight: 600;
}

.stock-badge.warning {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.stock-badge.critical {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85em;
  font-weight: 600;
}

.status-badge.available {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
}

.status-badge.unavailable {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
}

.date-cell {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.6);
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
}

.btn-action:active {
  transform: scale(0.95);
}

.btn-stock-in {
  background: rgba(76, 175, 80, 0.2);
}

.btn-dispatch {
  background: rgba(33, 150, 243, 0.2);
}

.btn-adjust {
  background: rgba(255, 193, 7, 0.2);
}

.btn-edit {
  background: rgba(102, 126, 234, 0.2);
}

.btn-delete {
  background: rgba(244, 67, 54, 0.2);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 16px;
}

.btn-add-first {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.low-stock-alert {
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.low-stock-alert h3 {
  color: #ffc107;
  margin: 0 0 12px 0;
  font-size: 1.1em;
}

.low-stock-alert p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
}

.low-stock-alert ul {
  margin: 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.low-stock-alert li {
  margin-bottom: 8px;
}

/* Alert Messages */
.alert {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  padding: 16px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideDown 0.3s;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.alert-success {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.alert-error {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.alert-icon {
  margin-right: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: #242442;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2em;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 2em;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.modal-close:active {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 24px 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.95em;
}

.required {
  color: #ff6b6b;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 1em;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.modal-footer {
  padding: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-save {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.2s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-cancel:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.98);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:active {
  transform: scale(0.98);
}
</style>
