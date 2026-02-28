<template>
  <div class="staff-layout">
    <StaffSidebar />
    <div class="marketplace-main">
      <div class="marketplace-container">
        <div class="header">
          <h1>🏪 Marketplace Hub</h1>
          <p>Manage inventory, browse traders, shop, and track orders</p>
        </div>

        <!-- Tab Navigation -->
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

        <!-- Tab 0: Add Product -->
        <div v-if="activeTab === 'add-product'" class="tab-content">
          <div class="add-product-section">
            <h2>🌴 Add New Product</h2>
            <form @submit.prevent="submitAddProduct" class="add-product-form">
              <div class="form-group">
                <label>Size *</label>
                <input v-model="newProductForm.size" type="text" placeholder="e.g., Small, Medium, Large" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Length (cm) *</label>
                <input v-model.number="newProductForm.length" type="number" placeholder="e.g., 15.5" step="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Stock Quantity *</label>
                <input v-model.number="newProductForm.stock" type="number" placeholder="e.g., 100" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Product Image (optional)</label>
                <div class="drag-drop-zone" :class="{ 'drag-over': isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleProductImageDrop">
                  <input type="file" @change="handleProductImageUpload" accept="image/*" class="file-input" ref="productImageInput" />
                  <div v-if="!productImagePreview" class="drop-zone-content" @click="$refs.productImageInput.click()">
                    <span class="file-icon">📷</span>
                    <p>Drag & Drop image or click to upload</p>
                  </div>
                  <img v-if="productImagePreview" :src="productImagePreview" alt="Preview" class="image-preview-small" />
                  <button v-if="productImagePreview" type="button" @click.prevent="removeProductImage" class="btn-remove-image">✕ Remove</button>
                </div>
              </div>
              <button type="submit" class="btn-submit" :disabled="isAddingProduct">
                <span v-if="!isAddingProduct">✓ Add Product</span>
                <span v-else>Adding...</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Tab 1: My Inventory -->
        <div v-if="activeTab === 'inventory'" class="tab-content">
          <!-- Critical Stock Notification -->
          <div v-if="lowStockCount > 0" class="critical-stock-notification">
            <div class="notification-icon">⚠️</div>
            <div class="notification-content">
              <h3>Low Stock Warning!</h3>
              <p><strong>{{ lowStockCount }}</strong> product{{ lowStockCount > 1 ? 's' : '' }} {{ lowStockCount > 1 ? 'have' : 'has' }} less than 30 units in stock.</p>
            </div>
            <button @click="scrollToAlert" class="notification-btn">View Items</button>
          </div>

          <div v-if="invLoading" class="loading">
            <div class="loading-spinner">⏳</div>
            <p>Loading inventory...</p>
          </div>
          
          <div v-else-if="inventory.length > 0" class="products-grid">
            <div v-for="item in inventory" :key="item.id" class="product-card" :class="{ 'low-stock': item.stock < 30 }">
              <div class="stock-indicator" v-if="item.stock < 30">
                <span v-if="item.stock === 0">⛔ Out of Stock</span>
                <span v-else-if="item.stock < 10">🔴 Critical</span>
                <span v-else>⚠️ Low Stock</span>
              </div>
              <div class="product-image">
                <img v-if="item.product_picture" :src="getImageUrl(item.product_picture)" :alt="item.size" />
                <div v-else class="no-image">🥥</div>
              </div>
              <div class="product-info">
                <h3>{{ item.size }}</h3>
                <div class="info-row">
                  <span class="info-label">Length:</span>
                  <span class="info-value">{{ item.length }} cm</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Stock:</span>
                  <span class="stock-badge" :class="{ critical: item.stock < 10, warning: item.stock >= 10 && item.stock < 30, available: item.stock >= 30 }">
                    {{ item.stock }} units
                  </span>
                </div>
              </div>
              <div class="product-actions">
                <button @click="stockIn(item)" class="btn-action btn-stock-in">📥 Add</button>
                <button @click="dispatch(item)" class="btn-action btn-dispatch" :disabled="item.stock === 0">📤 Dispatch</button>
                <button @click="editItem(item)" class="btn-action btn-edit">✏️ Edit</button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Products</h3>
            <p>Add your first product to get started</p>
          </div>
        </div>

        <!-- Tab 2: Marketplace (Browse Traders) -->
        <div v-if="activeTab === 'marketplace'" class="tab-content">
          <div v-if="markLoading" class="loading">
            <div class="loading-spinner">⏳</div>
            <p>Loading sellers...</p>
          </div>

          <div v-else-if="sellers.length > 0" class="sellers-grid">
            <div v-for="seller in sellers" :key="getSellerId(seller)" class="seller-card">
              <div class="seller-logo" @click="viewSellerProducts(getSellerId(seller))">
                <img v-if="seller.store_logo" :src="getImageUrl(seller.store_logo)" :alt="seller.store_name" />
                <div v-else class="default-logo">🥥</div>
              </div>
              <div class="seller-info">
                <h3>{{ seller.store_name }}</h3>
                <p class="seller-description">{{ seller.store_description || 'Quality products' }}</p>
                <div class="seller-stats">
                  <span>📦 {{ seller.product_count }} Products</span>
                  <span>📊 {{ seller.total_stock }} In Stock</span>
                </div>
              </div>
              <div class="seller-actions">
                <button @click="viewSellerProducts(getSellerId(seller))" class="btn-view-store">
                  🛍️ View Products
                </button>
                <button @click="openDirectChat(seller)" class="btn-message">
                  💬 Message
                  <span v-if="getSellerMessageCount(seller) > 0" class="message-count-badge">
                    {{ getSellerMessageCount(seller) }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🏪</div>
            <h3>No Traders Available</h3>
          </div>
        </div>

        <!-- Tab 3: My Cart -->
        <div v-if="activeTab === 'cart'" class="tab-content">
          <div v-if="cartItems.length > 0" class="cart-list">
            <div v-for="(item, idx) in cartItems" :key="idx" class="cart-item">
              <div class="item-info">
                <h3>{{ item.size }}</h3>
                <p>Length: {{ item.length }} cm</p>
                <p class="store-name" v-if="item.store_name">👤 {{ item.store_name }}</p>
              </div>
              <div class="quantity-control">
                <button @click="decrease(idx)" class="qty">−</button>
                <input type="number" v-model.number="item.quantity" min="1" class="qty-input" />
                <button @click="increase(idx)" class="qty">+</button>
              </div>
              <button @click="removeFromCart(idx)" class="btn-remove">Remove</button>
            </div>
            <div class="cart-summary">
              <p><strong>Total Items:</strong> {{ totalItems }}</p>
              <button @click="placeOrder" class="btn-place-order" :disabled="isPlacing">
                <span v-if="!isPlacing">Place Order</span>
                <span v-else>Placing...</span>
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse traders to add products</p>
          </div>
        </div>

        <!-- Tab 4: My Orders (Received) -->
        <div v-if="activeTab === 'orders'" class="tab-content">
          <div v-if="ordersLoading" class="loading">
            <div class="loading-spinner">⏳</div>
            <p>Loading orders...</p>
          </div>

          <div v-else-if="allOrders.length > 0" class="orders-list">
            <div v-for="order in allOrders" :key="order.id" class="order-card" :class="{ pending: order.status === 'pending' }">
              <div class="order-header">
                <h3>Order #{{ order.id }}</h3>
                <span :class="['status-badge', order.status]">{{ order.status }}</span>
              </div>
              <div class="order-details">
                <p><strong>Product:</strong> {{ order.size }} - {{ order.length }} cm</p>
                <p><strong>Qty:</strong> {{ order.quantity }} | <strong>Customer:</strong> {{ order.user_name }}</p>
                <p><strong>Ordered:</strong> {{ formatDate(order.created_at) }}</p>
              </div>
              <div class="order-actions">
                <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'processing')" class="btn-accept">Accept</button>
                <button v-if="order.status === 'processing'" @click="updateOrderStatus(order.id, 'completed')" class="btn-complete">Complete</button>
                <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'cancelled')" class="btn-cancel">Cancel</button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No Orders</h3>
            <p>Orders will appear here</p>
          </div>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

      <!-- Modals -->
      <div v-if="showStockInModal" class="modal-overlay" @click="closeStockInModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>📥 Stock In - {{ selectedProduct?.size }}</h2>
            <button class="modal-close" @click="closeStockInModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Current Stock: <strong>{{ selectedProduct?.stock }} units</strong></label>
            </div>
            <div class="form-group">
              <label>Quantity to Add *</label>
              <input type="number" v-model.number="stockInForm.quantity" class="form-input" min="1" />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeStockInModal" class="btn-cancel">Cancel</button>
            <button @click="confirmStockIn" class="btn-save">✓ Add Stock</button>
          </div>
        </div>
      </div>

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
              <label>Quantity to Dispatch *</label>
              <input type="number" v-model.number="dispatchForm.quantity" class="form-input" min="1" :max="selectedProduct?.stock" />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDispatchModal" class="btn-cancel">Cancel</button>
            <button @click="confirmDispatch" class="btn-save">✓ Dispatch</button>
          </div>
        </div>
      </div>

      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>✏️ Edit Product</h2>
            <button class="modal-close" @click="closeEditModal">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="editingItem" class="edit-form">
              <div class="form-group">
                <label>Size</label>
                <input type="text" v-model="editingItem.size" class="form-input" disabled />
              </div>
              <div class="form-group">
                <label>Stock Quantity *</label>
                <input type="number" v-model.number="editingItem.stock" class="form-input" min="0" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditModal" class="btn-cancel">Cancel</button>
            <button @click="saveEdit" class="btn-save">✓ Save</button>
          </div>
        </div>
      </div>

      <!-- Direct Chat Modal -->
      <div v-if="showDirectChatModal" class="modal-overlay" @click="closeDirectChat">
        <div class="modal-content direct-chat-modal" @click.stop>
          <div class="modal-header">
            <div class="header-info">
              <h2>💬 Message {{ selectedSeller?.store_name }}</h2>
            </div>
            <button class="modal-close" @click="closeDirectChat">&times;</button>
          </div>
          
          <div class="direct-chat-messages" v-if="!loadingChatMessages">
            <div v-if="chatMessages.length === 0" class="no-messages-yet">
              <span>👋</span>
              <p>Start a conversation</p>
            </div>
            <div v-else v-for="msg in chatMessages" :key="msg.id" :class="['chat-message', msg.is_sent ? 'sent' : 'received']">
              <div class="message-bubble">{{ msg.message }}</div>
              <div class="message-time">{{ formatDate(msg.created_at) }}</div>
            </div>
          </div>
          <div v-else class="loading-chat">
            <div class="spinner"></div>
          </div>

          <div class="modal-footer direct-chat-footer">
            <input 
              v-model="chatMessageInput"
              @keyup.enter="sendDirectMessage"
              type="text" 
              placeholder="Type your message..."
              class="chat-input"
              :disabled="sendingMessage"
            />
            <button 
              @click="sendDirectMessage"
              class="btn-send"
              :disabled="!chatMessageInput.trim() || sendingMessage"
            >
              {{ sendingMessage ? '...' : '📤' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'Marketplace',
  components: {
    StaffSidebar
  },
  data() {
    return {
      activeTab: 'inventory',
      tabs: [
        { label: 'Add Product', value: 'add-product', icon: '➕' },
        { label: 'My Inventory', value: 'inventory', icon: '📦' },
        { label: 'Marketplace', value: 'marketplace', icon: '🏪' },
        { label: 'My Cart', value: 'cart', icon: '🛒' },
        { label: 'Orders', value: 'orders', icon: '📋' }
      ],
      // Add Product
      newProductForm: {
        size: '',
        length: 0,
        stock: 0,
        imageFile: null
      },
      productImagePreview: '',
      isAddingProduct: false,
      isDragging: false,
      // Inventory
      inventory: [],
      invLoading: false,
      // Marketplace
      sellers: [],
      markLoading: false,
      // Cart
      cartItems: [],
      isPlacing: false,
      // Orders
      allOrders: [],
      ordersLoading: false,
      // Modals
      showStockInModal: false,
      showDispatchModal: false,
      showEditModal: false,
      selectedProduct: null,
      editingItem: null,
      stockInForm: { quantity: 0, reason: '' },
      dispatchForm: { quantity: 0, reason: '' },
      // Direct Chat
      showDirectChatModal: false,
      selectedSeller: null,
      currentConversationId: null,
      currentUserId: null,
      chatMessages: [],
      chatMessageInput: '',
      loadingChatMessages: false,
      sendingMessage: false,
      chatPollIntervalId: null,
      sellerMessageCounts: {},
      // Messages
      successMessage: '',
      errorMessage: '',
      token: null,
      pollIntervalId: null
    }
  },
  computed: {
    totalStock() {
      return this.inventory.reduce((sum, item) => sum + item.stock, 0)
    },
    lowStockCount() {
      return this.inventory.filter(item => item.stock < 30).length
    },
    totalItems() {
      return this.cartItems.reduce((s, it) => s + it.quantity, 0)
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      this.currentUserId = user?.id || null
    } catch (error) {
      this.currentUserId = null
    }
    this.fetchInventory()
    this.fetchSellers()
    this.fetchSellerMessageCounts()
    this.loadCart()
    this.fetchOrders()
    this.startPollingOrders()
  },
  beforeUnmount() {
    if (this.pollIntervalId) clearInterval(this.pollIntervalId)
    if (this.chatPollIntervalId) clearInterval(this.chatPollIntervalId)
  },
  methods: {
    // Add Product Methods
    handleProductImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.processProductImage(file)
      }
    },
    handleProductImageDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.processProductImage(file)
      }
    },
    processProductImage(file) {
      if (!file) return
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Only JPEG, PNG, and GIF images are allowed'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB'
        setTimeout(() => this.errorMessage = '', 3000)
        return
      }
      this.newProductForm.imageFile = file
      const reader = new FileReader()
      reader.onload = (e) => {
        this.productImagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    removeProductImage() {
      this.newProductForm.imageFile = null
      this.productImagePreview = ''
      if (this.$refs.productImageInput) {
        this.$refs.productImageInput.value = ''
      }
    },
    async submitAddProduct() {
      if (!this.newProductForm.size || !this.newProductForm.length || !this.newProductForm.stock) {
        this.errorMessage = 'Please fill in all required fields'
        return
      }
      this.isAddingProduct = true
      this.errorMessage = ''
      this.successMessage = ''
      try {
        const formData = new FormData()
        formData.append('size', this.newProductForm.size)
        formData.append('length', this.newProductForm.length)
        formData.append('stock', this.newProductForm.stock)
        if (this.newProductForm.imageFile) {
          formData.append('product_picture', this.newProductForm.imageFile)
        }
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/cocolumber`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` },
          body: formData
        })
        if (!response.ok) throw new Error('Failed to add product')
        this.successMessage = '✓ Product added successfully!'
        this.newProductForm = { size: '', length: 0, stock: 0, imageFile: null }
        this.productImagePreview = ''
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = 'Failed to add product'
        console.error('Error:', error)
      } finally {
        this.isAddingProduct = false
      }
    },
    // Inventory methods
    async fetchInventory() {
      this.invLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/inventory`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.inventory = await response.json()
      } catch (error) {
        console.error('Error:', error)
        this.errorMessage = 'Failed to load inventory'
      } finally {
        this.invLoading = false
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
    },
    async confirmStockIn() {
      if (!this.stockInForm.quantity || this.stockInForm.quantity <= 0) {
        this.errorMessage = 'Quantity must be greater than 0'
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
            body: JSON.stringify({ quantity: this.stockInForm.quantity })
          }
        )
        if (!response.ok) throw new Error('Failed')
        this.successMessage = `✓ Added ${this.stockInForm.quantity} units!`
        this.closeStockInModal()
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = 'Failed to add stock'
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
    },
    async confirmDispatch() {
      if (!this.dispatchForm.quantity || this.dispatchForm.quantity <= 0) {
        this.errorMessage = 'Quantity must be greater than 0'
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
            body: JSON.stringify({ quantity: this.dispatchForm.quantity })
          }
        )
        if (!response.ok) throw new Error('Failed')
        this.successMessage = `✓ Dispatched ${this.dispatchForm.quantity} units!`
        this.closeDispatchModal()
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = 'Failed to dispatch'
      }
    },
    editItem(item) {
      this.editingItem = JSON.parse(JSON.stringify(item))
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.editingItem = null
    },
    async saveEdit() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${this.editingItem.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ stock: this.editingItem.stock })
          }
        )
        if (!response.ok) throw new Error('Failed')
        this.successMessage = '✓ Stock updated!'
        this.closeEditModal()
        this.fetchInventory()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = 'Failed to update'
      }
    },
    // Marketplace methods
    async fetchSellers() {
      this.markLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sellers`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        const allSellers = await response.json()
        this.sellers = (Array.isArray(allSellers) ? allSellers : []).filter((seller) => {
          const sellerId = this.getSellerId(seller)
          return !this.currentUserId || !sellerId || sellerId !== this.currentUserId
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.markLoading = false
      }
    },
    async fetchSellerMessageCounts() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')

        const result = await response.json()
        const conversations = Array.isArray(result.conversations) ? result.conversations : []
        const counts = {}

        conversations.forEach((conversation) => {
          const countValue = Number(conversation.message_count || 0)
          const participants = Array.isArray(conversation.participants) ? conversation.participants : []
          participants.forEach((participant) => {
            if (participant?.id) {
              counts[participant.id] = countValue
            }
          })
        })

        this.sellerMessageCounts = counts
      } catch (error) {
        console.error('Error loading message counts:', error)
      }
    },
    getSellerMessageCount(seller) {
      const sellerId = this.getSellerId(seller)
      if (!sellerId) return 0
      return Number(this.sellerMessageCounts[sellerId] || 0)
    },
    getSellerId(seller) {
      return seller?.staff_id || seller?.id || seller?.user_id || null
    },
    viewSellerProducts(sellerId) {
      if (!sellerId) {
        this.errorMessage = 'Seller not found'
        return
      }
      this.$router.push(`/sellers/${sellerId}`)
    },
    openDirectChat(seller) {
      const sellerId = this.getSellerId(seller)
      if (!sellerId) {
        this.errorMessage = 'Unable to open chat for this seller'
        return
      }
      this.selectedSeller = seller
      this.showDirectChatModal = true
      this.currentConversationId = null
      this.chatMessages = []
      this.chatMessageInput = ''
      this.loadChatMessages()
      this.startChatPolling()
    },
    closeDirectChat() {
      this.showDirectChatModal = false
      this.selectedSeller = null
      this.currentConversationId = null
      this.chatMessages = []
      this.chatMessageInput = ''
      if (this.chatPollIntervalId) clearInterval(this.chatPollIntervalId)
    },
    async ensureConversation() {
      if (!this.selectedSeller) return null
      if (this.currentConversationId) return this.currentConversationId

      const recipientId = this.getSellerId(this.selectedSeller)
      if (!recipientId) {
        throw new Error('Invalid recipient')
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ recipient_id: recipientId })
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const result = await response.json()
      this.currentConversationId = result.conversation_id
      return this.currentConversationId
    },
    async loadChatMessages() {
      if (!this.selectedSeller) return
      this.loadingChatMessages = true
      try {
        const conversationId = await this.ensureConversation()
        if (!conversationId) return

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')

        const result = await response.json()
        const messages = Array.isArray(result.messages) ? result.messages : []
        this.chatMessages = messages.map(msg => ({
          id: msg.id,
          message: msg.message_text,
          created_at: msg.created_at,
          is_sent: this.currentUserId ? msg.sender_id === this.currentUserId : false
        }))

        const sellerId = this.getSellerId(this.selectedSeller)
        if (sellerId) {
          this.sellerMessageCounts = {
            ...this.sellerMessageCounts,
            [sellerId]: this.chatMessages.length
          }
        }

        this.$nextTick(() => {
          const container = document.querySelector('.direct-chat-messages')
          if (container) container.scrollTop = container.scrollHeight
        })
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        this.loadingChatMessages = false
      }
    },
    async sendDirectMessage() {
      if (!this.chatMessageInput.trim() || !this.selectedSeller) return
      this.sendingMessage = true
      const messageText = this.chatMessageInput
      this.chatMessageInput = ''
      try {
        const conversationId = await this.ensureConversation()
        if (!conversationId) throw new Error('Missing conversation')

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            message_text: messageText
          })
        })
        if (!response.ok) throw new Error('Failed')
        await this.loadChatMessages()
        await this.fetchSellerMessageCounts()
      } catch (error) {
        this.errorMessage = 'Failed to send message'
        this.chatMessageInput = messageText
        console.error('Error:', error)
      } finally {
        this.sendingMessage = false
      }
    },
    startChatPolling() {
      this.chatPollIntervalId = setInterval(() => {
        if (this.showDirectChatModal) {
          this.loadChatMessages()
        }
      }, 5000)
    },
    // Cart methods
    loadCart() {
      try {
        const stored = localStorage.getItem('cartItems')
        this.cartItems = stored ? JSON.parse(stored) : []
      } catch (e) {
        this.cartItems = []
      }
    },
    saveCart() {
      try {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems))
      } catch (e) {}
    },
    increase(idx) {
      this.cartItems[idx].quantity++
      this.saveCart()
    },
    decrease(idx) {
      if (this.cartItems[idx].quantity > 1) {
        this.cartItems[idx].quantity--
        this.saveCart()
      }
    },
    removeFromCart(idx) {
      this.cartItems.splice(idx, 1)
      this.saveCart()
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
        if (!res.ok) throw new Error('Failed')
        this.successMessage = '✓ Order placed successfully!'
        this.cartItems = []
        this.saveCart()
        setTimeout(() => this.activeTab = 'orders', 2000)
      } catch (error) {
        this.errorMessage = 'Failed to place order'
      } finally {
        this.isPlacing = false
      }
    },
    // Orders methods
    async fetchOrders() {
      this.ordersLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/all`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.allOrders = await response.json()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.ordersLoading = false
      }
    },
    async updateOrderStatus(orderId, newStatus) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ status: newStatus })
        })
        if (!response.ok) throw new Error('Failed')
        const order = this.allOrders.find(o => o.id === orderId)
        if (order) order.status = newStatus
        this.successMessage = `✓ Order #${orderId} updated!`
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = 'Failed to update order'
      }
    },
    startPollingOrders() {
      this.pollIntervalId = setInterval(() => this.fetchOrders(), 15000)
    },
    // Utilities
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
      if (!imagePath) return ''
      if (imagePath.startsWith('http')) return imagePath
      if (imagePath.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/${imagePath}`
    },
    scrollToAlert() {
      const element = document.querySelector('.critical-stock-notification')
      if (element) element.scrollIntoView({ behavior: 'smooth' })
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

.marketplace-main {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width:1200px;
  margin: 0 auto;
  width: 100%;
}

.marketplace-container {
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

/* Add Product Styles */
.add-product-section {
  max-width: 600px;
  margin: 0 auto;
}

.add-product-section h2 {
  color: white;
  font-size: 1.5em;
  margin-bottom: 24px;
  text-align: center;
}

.add-product-form {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.add-product-form .form-group {
  margin-bottom: 20px;
}

.add-product-form label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95em;
}

.add-product-form .form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
  font-size: 1em;
}

.add-product-form .form-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.drag-drop-zone {
  border: 2px dashed rgba(102, 126, 234, 0.5);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  background: rgba(102, 126, 234, 0.05);
  transition: all 0.3s;
  position: relative;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.drag-drop-zone.drag-over {
  background: rgba(102, 126, 234, 0.15);
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.drag-drop-zone:hover {
  background: rgba(102, 126, 234, 0.1);
}

.file-input {
  display: none;
}

.drop-zone-content {
  pointer-events: none;
}

.file-icon {
  font-size: 2.5em;
  display: block;
  margin-bottom: 8px;
}

.drop-zone-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95em;
  line-height: 1.5;
}

.image-preview-small {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 12px;
  background: rgba(244, 67, 54, 0.7);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8em;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-remove-image:hover {
  background: rgba(244, 67, 54, 0.9);
}

/* Tab Content Add Product */
.tab-content .add-product-form .btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: all 0.3s;
  margin-top: 10px;
}

.tab-content .add-product-form .btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.tab-content .add-product-form .btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tab Content */
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

/* Critical Stock Notification */
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
}

.notification-icon {
  font-size: 2.5em;
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
  font-size: 1.2em;
  font-weight: 700;
}

.notification-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95em;
}

.notification-btn {
  background: white;
  color: #ff6b00;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.stock-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 193, 7, 0.95);
  color: #1a1a2e;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.7em;
  font-weight: 700;
  z-index: 10;
}

.product-image {
  width: 100%;
  height: 160px;
  background: #2c3e50;
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
  font-size: 3em;
  opacity: 0.3;
}

.product-info {
  padding: 16px;
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 1.1em;
  font-weight: 600;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9em;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
}

.stock-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8em;
  font-weight: 600;
}

.stock-badge.critical {
  background: rgba(244, 67, 54, 0.25);
  color: #ff6b6b;
}

.stock-badge.warning {
  background: rgba(255, 193, 7, 0.25);
  color: #ffc107;
}

.stock-badge.available {
  background: rgba(76, 175, 80, 0.25);
  color: #81C784;
}

.product-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.btn-action {
  padding: 8px 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8em;
  font-weight: 600;
  color: white;
  transition: all 0.2s;
}

.btn-stock-in {
  background: rgba(76, 175, 80, 0.3);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.btn-stock-in:hover {
  background: rgba(76, 175, 80, 0.5);
  transform: translateY(-1px);
}

.btn-dispatch {
  background: rgba(33, 150, 243, 0.3);
  border: 1px solid rgba(33, 150, 243, 0.5);
}

.btn-dispatch:hover {
  background: rgba(33, 150, 243, 0.5);
  transform: translateY(-1px);
}

.btn-dispatch:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-edit {
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.btn-edit:hover {
  background: rgba(102, 126, 234, 0.5);
  transform: translateY(-1px);
}

/* Sellers Grid */
.sellers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.seller-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}

.seller-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.seller-logo {
  width: 100%;
  height: 150px;
  background: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.seller-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-logo {
  font-size: 3em;
  opacity: 0.5;
}

.seller-info {
  padding: 16px;
  flex-grow: 1;
}

.seller-info h3 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 1.1em;
}

.seller-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
  margin: 0 0 8px 0;
}

.seller-stats {
  display: flex;
  gap: 12px;
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.seller-actions {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  gap: 8px;
  flex-direction: row;
}

.btn-view-store {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s;
}

.btn-view-store:hover {
  transform: translateY(-2px);
}

.btn-message {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s;
  position: relative;
}

.btn-message:hover {
  transform: translateY(-2px);
}

.message-count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ff3b30;
  color: white;
  font-size: 0.72em;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  border: 2px solid #1a1a2e;
}

/* Cart */
.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
}

.item-info h3 {
  margin: 0;
  color: white;
  font-size: 1.1em;
}

.item-info p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

.store-name {
  color: rgba(255, 255, 255, 0.6);
}

.quantity-control {
  display: flex;
  gap: 8px;
  align-items: center;
}

.qty {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.qty:hover {
  background: rgba(255, 255, 255, 0.2);
}

.qty-input {
  width: 60px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  text-align: center;
}

.btn-remove {
  padding: 8px 16px;
  background: rgba(244, 67, 54, 0.3);
  color: #ff6b6b;
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: rgba(244, 67, 54, 0.5);
}

.cart-summary {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
}

.cart-summary p {
  color: white;
  font-size: 1.05em;
  margin-bottom: 16px;
}

.btn-place-order {
  padding: 14px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: all 0.3s;
}

.btn-place-order:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-place-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Orders */
.orders-list {
  display: grid;
  gap: 12px;
}

.order-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #4CAF50;
}

.order-card.pending {
  border-left: 4px solid #ff9800;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.2);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-header h3 {
  margin: 0;
  color: white;
  font-size: 1.05em;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 16px;
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

.order-details {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
  margin-bottom: 12px;
}

.order-details p {
  margin: 6px 0;
}

.order-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-accept,
.btn-complete,
.btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-accept {
  background: rgba(3, 169, 244, 0.7);
  color: white;
}

.btn-accept:hover {
  background: rgba(3, 169, 244, 0.9);
  transform: translateY(-1px);
}

.btn-complete {
  background: rgba(76, 175, 80, 0.7);
  color: white;
}

.btn-complete:hover {
  background: rgba(76, 175, 80, 0.9);
  transform: translateY(-1px);
}

.btn-cancel {
  background: rgba(244, 67, 54, 0.7);
  color: white;
}

.btn-cancel:hover {
  background: rgba(244, 67, 54, 0.9);
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 30px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.4;
}

.empty-state h3 {
  color: white;
  margin: 0 0 10px 0;
  font-size: 1.5em;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 1em;
}

/* Modals */
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
  border-radius: 12px;
  max-width: 450px;
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
  padding: 16px 20px;
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
  font-size: 1.8em;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.9em;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.95em;
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85em;
  transition: all 0.2s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:hover {
  transform: translateY(-1px);
}

/* Direct Chat Modal */
.direct-chat-modal {
  max-width: 500px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.direct-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
}

.no-messages-yet {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}

.no-messages-yet span {
  font-size: 2em;
  margin-bottom: 8px;
}

.chat-message {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 80%;
}

.chat-message.sent {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-message.received {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 0.95em;
}

.chat-message.received .message-bubble {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.message-time {
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.4);
  padding: 0 4px;
}

.direct-chat-footer {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9em;
  font-family: inherit;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.btn-send {
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: all 0.2s;
  min-width: 50px;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Alerts */
.alert {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  animation: slideDown 0.3s;
  max-width: 400px;
}

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.alert-success {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.alert-error {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

@media (max-width: 768px) {
  .products-grid,
  .sellers-grid {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 1fr;
  }

  .tabs-header {
    gap: 5px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 0.9em;
  }
}
</style>
