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

        <!-- Critical Stock Notification -->
        <div v-if="lowStockCount > 0" class="critical-stock-notification">
          <div class="notification-icon">⚠️</div>
          <div class="notification-content">
            <h3>Low Stock Warning!</h3>
            <p><strong>{{ lowStockCount }}</strong> product{{ lowStockCount > 1 ? 's' : '' }} {{ lowStockCount > 1 ? 'have' : 'has' }} less than 30 units in stock. Please restock soon to avoid running out.</p>
          </div>
          <button @click="scrollToAlert" class="notification-btn">View Items</button>
        </div>

        <!-- Inventory Cards -->
        <div class="inventory-section">
          <div class="section-header">
            <h2>Stock Details</h2>
          </div>

          <div v-if="loading" class="loading">
            <div class="loading-spinner">⏳</div>
            <p>Loading inventory...</p>
          </div>
          
          <div v-else-if="inventory.length > 0" class="products-grid">
            <div v-for="item in inventory" :key="item.id" class="product-card" :class="{ 'low-stock': item.stock < 30 }">
              <!-- Stock Indicator Badge -->
              <div class="stock-indicator" v-if="item.stock < 30">
                <span v-if="item.stock === 0">⛔ Out of Stock</span>
                <span v-else-if="item.stock < 10">🔴 Critical Stock</span>
                <span v-else>⚠️ Low Stock Warning</span>
              </div>
              
              <!-- Product Image -->
              <div class="product-image">
                <img v-if="item.product_picture" :src="getImageUrl(item.product_picture)" :alt="item.size" />
                <div v-else class="no-image">🥥</div>
              </div>
              
              <!-- Product Info -->
              <div class="product-info">
                <h3>{{ item.size }}</h3>
                <div class="info-row">
                  <span class="info-label">📏 Length:</span>
                  <span class="info-value">{{ item.length }} cm</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📦 Stock:</span>
                  <span class="stock-badge" :class="{ critical: item.stock < 10, warning: item.stock >= 10 && item.stock < 30, available: item.stock >= 30 }">
                    {{ item.stock }} units
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">📅 Added:</span>
                  <span class="info-value date-text">{{ formatDate(item.created_at) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🏷️ ID:</span>
                  <span class="info-value">#{{ item.id }}</span>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="product-actions">
                <button @click="stockIn(item)" class="btn-action btn-stock-in" title="Stock In - Add inventory">
                  <span class="btn-icon">📥</span>
                  <span class="btn-label">Add</span>
                </button>
                <button @click="dispatch(item)" class="btn-action btn-dispatch" title="Dispatch - Ship products" :disabled="item.stock === 0">
                  <span class="btn-icon">📤</span>
                  <span class="btn-label">Dispatch</span>
                </button>
                <button @click="editItem(item)" class="btn-action btn-edit" title="Edit - Update product">
                  <span class="btn-icon">✏️</span>
                  <span class="btn-label">Edit</span>
                </button>
                <button @click="deleteItem(item.id)" class="btn-action btn-delete" title="Delete - Remove product">
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Products in Inventory</h3>
            <p>Start by adding your first coconut product</p>
          </div>
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
          <div class="stat-card warning-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-info">
              <p class="stat-label">⚠️ Low Stock (&lt; 30)</p>
              <p class="stat-value">{{ lowStockCount }}</p>
            </div>
          </div>
        </div>

        <!-- Low Stock Alert -->
        <div v-if="lowStockItems.length > 0" class="low-stock-alert">
          <h3>⚠️ Low Stock Warning - Action Required!</h3>
          <p>The following products have less than 30 units in stock:</p>
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
            <h2>✏️ Edit Product Stock</h2>
            <button class="modal-close" @click="closeEditModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="modal-description">
              <p><strong>Edit stock</strong> to set a specific quantity. Use this for quick updates.</p>
            </div>
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
                <label>Stock Quantity <span class="required">*</span></label>
                <input type="number" v-model.number="editingItem.stock" class="form-input" min="0" placeholder="Enter new stock quantity" />
                <small>Current stock: <strong>{{ originalItem?.stock }} units</strong></small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditModal" class="btn-cancel">Cancel</button>
            <button @click="saveEdit" class="btn-save">✓ Save Changes</button>
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
            <div class="modal-description">
              <p><strong>Add inventory</strong> when receiving new stock from suppliers or production.</p>
            </div>
            <div class="form-group">
              <label>Current Stock: <strong>{{ selectedProduct?.stock }} units</strong></label>
            </div>
            <div class="form-group">
              <label>Quantity to Add <span class="required">*</span></label>
              <input type="number" v-model.number="stockInForm.quantity" class="form-input" min="1" placeholder="Enter quantity to add" />
            </div>
            <div class="form-group">
              <label>Reason (optional)</label>
              <textarea v-model="stockInForm.reason" class="form-input" placeholder="e.g., Supplier delivery, Return from order" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeStockInModal" class="btn-cancel">Cancel</button>
            <button @click="confirmStockIn" class="btn-save">✓ Add Stock</button>
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
            <div class="modal-description">
              <p><strong>Dispatch products</strong> when shipping to customers or releasing from warehouse.</p>
            </div>
            <div class="form-group">
              <label>Current Stock: <strong>{{ selectedProduct?.stock }} units</strong></label>
            </div>
            <div class="form-group">
              <label>Quantity to Dispatch <span class="required">*</span></label>
              <input type="number" v-model.number="dispatchForm.quantity" class="form-input" min="1" :max="selectedProduct?.stock" placeholder="Enter quantity to dispatch" />
            </div>
            <div class="form-group">
              <label>Reason (optional)</label>
              <textarea v-model="dispatchForm.reason" class="form-input" placeholder="e.g., Order #123, Customer delivery" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDispatchModal" class="btn-cancel">Cancel</button>
            <button @click="confirmDispatch" class="btn-save">✓ Dispatch</button>
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
      return this.inventory.filter(item => item.stock < 30).length
    },
    lowStockItems() {
      return this.inventory.filter(item => item.stock < 30).sort((a, b) => a.stock - b.stock)
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
    scrollToAlert() {
      const alertElement = document.querySelector('.low-stock-alert')
      if (alertElement) {
        alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
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
  font-size: 2.5em;
  color: white;
  margin-bottom: 8px;
  font-weight: 700;
}

.header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1em;
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

.stat-card.warning-card {
  background: linear-gradient(135deg, #ff9800 0%, #ff6b00 100%);
  border-left: 4px solid #ff5722;
  animation: pulse-warning 2s infinite;
}

@keyframes pulse-warning {
  0%, 100% { box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4); }
  50% { box-shadow: 0 4px 25px rgba(255, 152, 0, 0.8); }
}

/* Critical Stock Notification Banner */
.critical-stock-notification {
  background: linear-gradient(135deg, #ff6b00 0%, #ff9800 100%);
  border-left: 6px solid #ff3d00;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
  animation: notification-pulse 2s infinite;
}

@keyframes notification-pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
  }
  50% { 
    transform: scale(1.01);
    box-shadow: 0 8px 30px rgba(255, 152, 0, 0.6);
  }
}

.notification-icon {
  font-size: 3em;
  flex-shrink: 0;
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.notification-content {
  flex: 1;
}

.notification-content h3 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 1.4em;
  font-weight: 700;
}

.notification-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1em;
  line-height: 1.5;
}

.notification-btn {
  background: white;
  color: #ff6b00;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  padding: 60px 20px;
  color: #667eea;
}

.loading-spinner {
  font-size: 3em;
  margin-bottom: 15px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  font-size: 1.1em;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

/* Products Grid Layout */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Product Card */
.product-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card.low-stock {
  border-color: rgba(255, 193, 7, 0.6);
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, #1a1a2e 100%);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

/* Stock Indicator Badge */
.stock-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 193, 7, 0.95);
  color: #1a1a2e;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75em;
  font-weight: 700;
  z-index: 10;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
}

/* Product Image */
.product-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 4em;
  opacity: 0.5;
}

/* Product Info */
.product-info {
  padding: 20px;
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 15px 0;
  color: white;
  font-size: 1.4em;
  font-weight: 700;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
  font-weight: 500;
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 0.95em;
}

.date-text {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.7);
}

/* Stock Badges */
.stock-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 700;
}

.stock-badge.critical {
  background: rgba(244, 67, 54, 0.25);
  color: #ff6b6b;
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
}

.stock-badge.warning {
  background: rgba(255, 193, 7, 0.25);
  color: #ffc107;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
}

.stock-badge.available {
  background: rgba(76, 175, 80, 0.25);
  color: #81C784;
}

/* Product Actions */
.product-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.btn-action {
  padding: 10px 8px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 600;
  min-height: 60px;
}

.btn-icon {
  font-size: 1.5em;
}

.btn-label {
  font-size: 0.85em;
}

.btn-stock-in {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.btn-stock-in:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.5) 0%, rgba(76, 175, 80, 0.3) 100%);
  transform: translateY(-2px);
}

.btn-dispatch {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.2) 100%);
  border: 1px solid rgba(33, 150, 243, 0.5);
}

.btn-dispatch:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.5) 0%, rgba(33, 150, 243, 0.3) 100%);
  transform: translateY(-2px);
}

.btn-dispatch:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-dispatch:disabled:hover {
  transform: none;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.2) 100%);
}

.btn-edit {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(102, 126, 234, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.btn-edit:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(102, 126, 234, 0.3) 100%);
  transform: translateY(-2px);
}

.btn-delete {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.2) 100%);
  border: 1px solid rgba(244, 67, 54, 0.5);
  font-size: 1.3em;
}

.btn-delete:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.5) 0%, rgba(244, 67, 54, 0.3) 100%);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-label {
    display: none;
  }
  
  .btn-action {
    min-height: 50px;
  }
  
  .product-actions {
    grid-template-columns: repeat(4, 1fr);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 5em;
  margin-bottom: 20px;
  opacity: 0.4;
}

.empty-state h3 {
  color: #667eea;
  margin: 0 0 10px 0;
  font-size: 1.5em;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1em;
  margin: 0 0 25px 0;
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
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 107, 0, 0.15) 100%);
  border: 2px solid #ff9800;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.low-stock-alert h3 {
  color: #ff9800;
  margin: 0 0 16px 0;
  font-size: 1.3em;
  font-weight: 700;
}

.low-stock-alert p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  font-size: 1.05em;
}

.low-stock-alert ul {
  margin: 0;
  padding-left: 24px;
}

.low-stock-alert li {
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12px;
  font-size: 1em;
  line-height: 1.6;
}

.low-stock-alert li strong {
  color: #ff9800;
  font-weight: 700;
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

.modal-description {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.modal-description p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95em;
  line-height: 1.5;
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

.form-group small {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
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
