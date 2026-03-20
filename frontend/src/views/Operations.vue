<template>
  <div class="staff-layout">
    <StaffSidebar />
    <div class="operations-main">
      <div class="operations-container">
        <div class="header">
          <div class="header-title-row">
            <span class="header-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0-.1 1 7.8 7.8 0 0 0 .1 1l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
              </svg>
            </span>
            <h1>Operations Hub</h1>
          </div>
          <p>Manage inventory, scan cocolumber, and dispatch orders</p>
        </div>

        <!-- Tab Navigation -->
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="['tab-btn', { active: activeTab === tab.value }]"
          >
            <span class="inline-icon" aria-hidden="true">
              <svg v-if="tab.value === 'inventory'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8.5 12 4l8 4.5M4 8.5V17l8 4.5 8-4.5V8.5M12 12l8-3.5M12 12 4 8.5M12 12v9.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="tab.value === 'scanner'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8h4l1.5-2h5L16 8h4v10H4V8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="1.8"/>
              </svg>
              <svg v-else-if="tab.value === 'dispatch'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7h11v9H3V7Zm11 2h3l3 3v4h-6V9Zm2.5 8a1.5 1.5 0 1 0 0 .01M7 17a1.5 1.5 0 1 0 0 .01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19h16M7 15V9m5 6V6m5 9v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab 1: Inventory -->
        <div v-if="activeTab === 'inventory'" class="tab-content">
          <div class="inventory-section">
            <!-- Low Stock Warning -->
            <div v-if="lowStockCount > 0" class="critical-stock-notification">
              <div class="notification-icon">⚠️</div>
              <div class="notification-content">
                <h3>Low Stock Warning!</h3>
                <p><strong>{{ lowStockCount }}</strong> product{{ lowStockCount > 1 ? 's' : '' }} {{ lowStockCount > 1 ? 'have' : 'has' }} less than 30 units in stock.</p>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="inventoryLoading" class="loading">
              <div class="spinner"></div>
              <p>Loading inventory...</p>
            </div>

            <!-- Inventory Grid -->
            <div v-else class="inventory-grid">
              <div v-for="item in inventory" :key="item.id" class="inventory-card" :class="{ 'low-stock': item.stock < 30 }">
                <div class="card-header">
                  <div v-if="item.stock < 30" class="stock-badge">
                    <span v-if="item.stock === 0">⛔ Out of Stock</span>
                    <span v-else-if="item.stock < 10">🔴 Critical</span>
                    <span v-else>⚠️ Low Stock</span>
                  </div>
                </div>
                <div class="product-image">
                  <img v-if="item.product_picture" :src="getImageUrl(item.product_picture)" :alt="item.size" />
                  <div v-else class="no-image">🥥</div>
                </div>
                <div class="product-info">
                  <h3>{{ item.size }}</h3>
                  <p class="length">{{ item.length }}cm</p>
                  <div class="stock-display">
                    <span class="label">Stock:</span>
                    <span class="value">{{ item.stock }} units</span>
                  </div>
                  <div v-if="item.price" class="price-display">
                    <span class="label">Price:</span>
                    <span class="value">₱{{ formatPrice(item.price) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!inventoryLoading && inventory.length === 0" class="empty-state">
              <span class="empty-icon">📦</span>
              <p>No inventory items found</p>
            </div>
          </div>
        </div>

        <!-- Tab 2: Scanner -->
        <div v-if="activeTab === 'scanner'" class="tab-content">
          <CameraScanner :embedded="true" />
        </div>

        <!-- Tab 3: Dispatch -->
        <div v-if="activeTab === 'dispatch'" class="tab-content">
          <div class="dispatch-section">
            <!-- New Dispatch Form -->
            <div class="dispatch-form-container">
              <h2>🚚 Create New Dispatch</h2>
              <form @submit.prevent="submitDispatch" class="dispatch-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Product Type <span class="required">*</span></label>
                    <select v-model="dispatchForm.product_id" class="form-input" required>
                      <option value="">Select Product</option>
                      <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                        {{ product.size }} - {{ product.length }}cm (Stock: {{ product.stock }})
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Quantity <span class="required">*</span></label>
                    <input
                      type="number"
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
                    <label>Customer Name <span class="required">*</span></label>
                    <input
                      type="text"
                      v-model="dispatchForm.customer_name"
                      class="form-input"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>Contact Number <span class="required">*</span></label>
                    <input
                      type="tel"
                      v-model="dispatchForm.contact_number"
                      class="form-input"
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Address <span class="required">*</span></label>
                    <input
                      type="text"
                      v-model="dispatchForm.address"
                      class="form-input"
                      placeholder="Enter delivery address"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>Dispatch Date <span class="required">*</span></label>
                    <input
                      type="date"
                      v-model="dispatchForm.dispatch_date"
                      class="form-input"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Notes</label>
                  <textarea
                    v-model="dispatchForm.notes"
                    class="form-input form-textarea"
                    placeholder="Additional delivery notes..."
                    rows="3"
                  ></textarea>
                </div>

                <button type="submit" class="btn btn-primary btn-submit" :disabled="dispatchLoading">
                  {{ dispatchLoading ? '⏳ Processing...' : '✓ Create Dispatch' }}
                </button>
              </form>

              <div v-if="dispatchSuccess" class="success-message">{{ dispatchSuccess }}</div>
              <div v-if="dispatchError" class="error-message">{{ dispatchError }}</div>
            </div>

            <!-- Dispatch History -->
            <div class="dispatch-history">
              <h2>📋 Recent Dispatches</h2>
              
              <div v-if="dispatchesLoading" class="loading">
                <div class="spinner-small"></div>
                <p>Loading dispatches...</p>
              </div>

              <div v-else-if="dispatches.length > 0" class="dispatches-list">
                <div v-for="dispatch in dispatches" :key="dispatch.id" class="dispatch-item">
                  <div class="dispatch-row">
                    <div class="dispatch-info">
                      <h4>{{ dispatch.customer_name }}</h4>
                      <p class="dispatch-meta">{{ dispatch.address }}</p>
                    </div>
                    <div class="dispatch-details">
                      <span class="dispatch-qty">{{ dispatch.quantity }} units</span>
                      <span :class="['dispatch-status', dispatch.status.toLowerCase()]">{{ dispatch.status }}</span>
                    </div>
                  </div>
                  <div class="dispatch-date">{{ formatDate(dispatch.dispatch_date) }}</div>
                </div>
              </div>

              <div v-else class="empty-state">
                <span class="empty-icon">🚚</span>
                <p>No dispatches yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 4: Reports -->
        <div v-if="activeTab === 'reports'" class="tab-content">
          <div class="dispatch-form-container">
            <h2>📊 Reports</h2>
            <p style="color: rgba(255, 255, 255, 0.75); margin-bottom: 16px;">Open your reports dashboard for sales and inventory insights.</p>
            <button @click="goToReports" class="btn btn-primary">📈 Open Reports</button>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="alert.message" :class="['alert', `alert-${alert.type}`]">{{ alert.message }}</div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'
import CameraScanner from './CameraScanner.vue'

export default {
  name: 'Operations',
  components: {
    StaffSidebar,
    CameraScanner
  },
  data() {
    return {
      activeTab: 'inventory',
      tabs: [
        { label: 'Inventory', value: 'inventory' },
        { label: 'Scanner', value: 'scanner' },
        { label: 'Dispatch', value: 'dispatch' },
        { label: 'Reports', value: 'reports' }
      ],
      // Inventory Data
      inventory: [],
      inventoryLoading: false,
      lowStockCount: 0,
      // Scanner Data
      scannerMode: 'camera',
      showCamera: false,
      capturedImage: null,
      cameraError: '',
      stream: null,
      uploadedImage: null,
      uploadError: '',
      isDragging: false,
      selectedCamera: 'environment',
      detectionStarted: false,
      detectionError: '',
      scanResults: {
        treeDetected: false,
        diameter: '0',
        height: '0',
        quality: 'N/A',
        confidence: '0',
        estimatedLumber: '0'
      },
      // Dispatch Data
      dispatchForm: {
        product_id: '',
        quantity: '',
        customer_name: '',
        contact_number: '',
        address: '',
        dispatch_date: '',
        notes: ''
      },
      availableProducts: [],
      dispatches: [],
      dispatchLoading: false,
      dispatchesLoading: false,
      dispatchSuccess: '',
      dispatchError: '',
      // General
      token: null,
      alert: { message: '', type: 'info' }
    }
  },
  computed: {
    selectedProductStock() {
      if (!this.dispatchForm.product_id) return 0
      const product = this.availableProducts.find(p => p.id == this.dispatchForm.product_id)
      return product ? product.stock : 0
    }
  },
  mounted() {
    this.token = localStorage.getItem('token')
    this.loadInventory()
    this.loadProducts()
    this.loadDispatches()
  },
  beforeUnmount() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
  },
  methods: {
    // Inventory Methods
    async loadInventory() {
      this.inventoryLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/inventory`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.inventory = await response.json()
        this.lowStockCount = this.inventory.filter(i => i.stock < 30).length
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.inventoryLoading = false
      }
    },
    getImageUrl(picture) {
      return `${import.meta.env.VITE_API_BASE_URL}/${picture}`
    },
    formatPrice(price) {
      return parseFloat(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })
    },
    // Scanner Methods
    openCamera() {
      this.cameraError = ''
      this.uploadError = ''
      this.showCamera = true
      this.capturedImage = null

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.cameraError = '📱 Camera not supported. Using upload instead.'
        this.scannerMode = 'upload'
        return
      }

      if (!window.isSecureContext) {
        this.cameraError = '🔒 Requires HTTPS on mobile. Switched to upload mode.'
        this.scannerMode = 'upload'
        this.showCamera = false
        return
      }

      try {
        const constraints = [
          { video: { facingMode: { ideal: this.selectedCamera }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
          { video: { facingMode: this.selectedCamera }, audio: false },
          { video: true, audio: false }
        ]

        let attemptCamera = async () => {
          for (const constraint of constraints) {
            try {
              let stream = await navigator.mediaDevices.getUserMedia(constraint)
              this.stream = stream
              await this.$nextTick()
              if (this.$refs.video) {
                this.$refs.video.srcObject = this.stream
                if (typeof this.$refs.video.play === 'function') {
                  try { await this.$refs.video.play() } catch (e) {}
                }
              }
              return true
            } catch (error) {
              continue
            }
          }
          return false
        }

        attemptCamera().then(success => {
          if (!success) {
            this.cameraError = '❌ Could not access camera. Please allow camera permission and try again.'
            this.scannerMode = 'upload'
            this.showCamera = false
          }
        })
      } catch (err) {
        this.cameraError = '⚠️ Camera access error: ' + (err?.name || err.message)
        this.scannerMode = 'upload'
        this.showCamera = false
      }
    },
    captureImage() {
      const video = this.$refs.video
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      this.capturedImage = canvas.toDataURL('image/png')
    },
    retakeImage() {
      this.capturedImage = null
      this.openCamera()
    },
    saveImage() {
      const link = document.createElement('a')
      link.download = `scan-${Date.now()}.png`
      link.href = this.capturedImage
      link.click()
    },
    closeCamera() {
      this.showCamera = false
      this.capturedImage = null
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
      }
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) this.processUploadedFile(file)
    },
    handleFileDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file) this.processUploadedFile(file)
    },
    processUploadedFile(file) {
      this.uploadError = ''
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Invalid file type. Please upload JPG, PNG, or GIF.'
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'File size exceeds 5MB limit.'
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        this.uploadedImage = e.target.result
      }
      reader.readAsDataURL(file)
    },
    removeUploadedImage() {
      this.uploadedImage = null
      this.uploadError = ''
    },
    downloadUploadedImage() {
      const link = document.createElement('a')
      link.download = `scan-${Date.now()}.png`
      link.href = this.uploadedImage
      link.click()
    },
    async startDetection() {
      this.detectionStarted = true
      this.detectionError = ''
      try {
        const imageData = this.capturedImage || this.uploadedImage
        if (!imageData) {
          this.detectionError = 'No image to analyze.'
          return
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/detect-cocolumber`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: imageData })
        })

        const result = await response.json()
        if (!response.ok) {
          this.detectionError = `Detection failed: ${result.message || 'Unknown error'}`
          return
        }

        if (result.height && result.diameter) {
          this.scanResults = {
            treeDetected: true,
            diameter: result.diameter || '0',
            height: result.height || '0',
            estimatedLumber: result.estimatedLumber || '0',
            quality: result.quality || 'N/A',
            confidence: result.confidence || '0'
          }
        } else {
          this.detectionError = '⚠️ No cocolumber object detected in image! Try better lighting or a clearer image.'
        }
      } catch (error) {
        this.detectionError = `Detection failed: ${error.message}`
      }
    },
    // Dispatch Methods
    async loadProducts() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        const data = await response.json()
        this.availableProducts = data.filter(p => p.stock > 0)
      } catch (error) {
        console.error('Error:', error)
      }
    },
    async loadDispatches() {
      this.dispatchesLoading = true
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/dispatches`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.dispatches = await response.json()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.dispatchesLoading = false
      }
    },
    async submitDispatch() {
      this.dispatchLoading = true
      this.dispatchError = ''
      this.dispatchSuccess = ''
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/dispatch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(this.dispatchForm)
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.message || 'Dispatch failed')
        }

        this.dispatchSuccess = '✓ Dispatch created successfully!'
        this.dispatchForm = {
          product_id: '',
          quantity: '',
          customer_name: '',
          contact_number: '',
          address: '',
          dispatch_date: '',
          notes: ''
        }
        await this.loadDispatches()
        setTimeout(() => { this.dispatchSuccess = '' }, 3000)
      } catch (error) {
        this.dispatchError = error.message || 'Failed to create dispatch'
      } finally {
        this.dispatchLoading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    goToReports() {
      this.$router.push('/staff/reports')
    }
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.2), transparent 30%),
    radial-gradient(circle at right center, rgba(118, 75, 162, 0.16), transparent 28%),
    linear-gradient(135deg, #121428 0%, #1a1a2e 44%, #242442 100%);
}

.operations-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 76px 28px 32px;
  overflow-y: auto;
  width: 100%;
}

.operations-container {
  width: 100%;
  max-width: 1060px;
}

.header {
  margin-bottom: 24px;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header h1 {
  font-size: 2.2em;
  color: white;
  margin: 0;
  font-weight: 700;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: rgba(175, 205, 255, 0.95);
  display: inline-flex;
  flex-shrink: 0;
}

.header-icon svg {
  width: 100%;
  height: 100%;
}

.header p {
  margin: 8px 0 0 40px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.02em;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.inline-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  flex-shrink: 0;
}

.inline-icon svg {
  width: 100%;
  height: 100%;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.tab-btn.active {
  background: rgba(100, 150, 255, 0.2);
  border-color: rgba(100, 150, 255, 0.45);
  color: white;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Inventory Styles */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.inventory-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.inventory-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.inventory-card.low-stock {
  border-color: #ff6b6b;
}

.card-header {
  margin-bottom: 12px;
}

.stock-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
}

.product-image {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 2em;
}

.product-info h3 {
  margin: 0;
  color: white;
  font-size: 1em;
  font-weight: 600;
}

.product-info .length {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  margin: 4px 0 8px 0;
}

.stock-display,
.price-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  margin-bottom: 4px;
}

.stock-display .label,
.price-display .label {
  color: rgba(255, 255, 255, 0.6);
}

.stock-display .value,
.price-display .value {
  color: white;
  font-weight: 600;
}

/* Scanner Styles */
.scanner-section {
  background: transparent;
}

.scanner-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.scan-tab {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.scan-tab:hover {
  background: rgba(255, 255, 255, 0.15);
}

.scan-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.camera-display {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-feed,
.captured-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.placeholder-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 8px;
}

.camera-controls {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.camera-select {
  margin-bottom: 12px;
}

.camera-select select {
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #333;
}

.btn-warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.btn-detect {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.upload-area {
  margin-bottom: 16px;
}

.drop-zone {
  border: 2px dashed rgba(102, 126, 234, 0.5);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(102, 126, 234, 0.05);
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.upload-icon {
  font-size: 2.5em;
  display: block;
  margin-bottom: 8px;
}

.upload-hint {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85em;
  margin-top: 8px;
}

.uploaded-preview {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.2);
}

.upload-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.detection-results {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.detection-results h3 {
  color: white;
  margin-bottom: 12px;
  font-size: 1.05em;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.result-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid rgba(255, 255, 255, 0.2);
}

.result-item.highlight {
  border-left-color: #667eea;
}

.result-item .label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  margin-bottom: 4px;
}

.result-item .value {
  display: block;
  color: white;
  font-size: 1.1em;
  font-weight: 600;
}

/* Dispatch Styles */
.dispatch-form-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.dispatch-form-container h2 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2em;
}

.dispatch-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.required {
  color: #ff6b6b;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.95em;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.form-input small {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8em;
  margin-top: 2px;
}

.form-textarea {
  resize: vertical;
}

.btn-submit {
  align-self: flex-start;
  margin-top: 8px;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dispatch-history {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.dispatch-history h2 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2em;
}

.dispatches-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dispatch-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.dispatch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dispatch-info h4 {
  margin: 0;
  color: white;
  font-size: 0.95em;
}

.dispatch-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  margin: 4px 0 0 0;
}

.dispatch-details {
  display: flex;
  gap: 12px;
  align-items: center;
}

.dispatch-qty {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
}

.dispatch-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dispatch-status.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.dispatch-status.completed {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.dispatch-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8em;
}

/* Alerts */
.alert {
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  max-width: 400px;
}

.alert-success {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.alert-error {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.success-message,
.error-message,
.critical-stock-notification {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
}

.success-message {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.error-message {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.critical-stock-notification {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.notification-icon {
  font-size: 1.2em;
}

.notification-content h3 {
  margin: 0;
  color: #ffc107;
  font-size: 1em;
}

.notification-content p {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
  margin-bottom: 12px;
}

.spinner-small {
  width: 25px;
  height: 25px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
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
  padding: 60px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .operations-main {
    padding: 72px 14px 20px;
  }

  .header h1 {
    font-size: 1.7em;
  }

  .header p {
    margin-left: 34px;
    font-size: 0.95em;
  }

  .inventory-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 0.85em;
  }
}
</style>
