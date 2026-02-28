<template>
  <div class="staff-layout">
    <StaffSidebar />
    <div class="operations-main">
      <div class="operations-container">
        <div class="header">
          <h1>⚙️ Operations Hub</h1>
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
            {{ tab.icon }} {{ tab.label }}
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
          <div class="scanner-section">
            <!-- Tab Sub-navigation -->
            <div class="scanner-tabs">
              <button 
                @click="scannerMode = 'camera'"
                :class="['scan-tab', { active: scannerMode === 'camera' }]"
              >
                📹 Real-time Camera
              </button>
              <button 
                @click="scannerMode = 'upload'"
                :class="['scan-tab', { active: scannerMode === 'upload' }]"
              >
                📁 Upload Image
              </button>
            </div>

            <!-- Camera Mode -->
            <div v-if="scannerMode === 'camera'" class="scanner-camera">
              <div class="camera-display">
                <video v-if="showCamera && !capturedImage" ref="video" autoplay playsinline class="camera-feed"></video>
                <img v-if="capturedImage" :src="capturedImage" alt="Captured" class="captured-image" />
                <div v-if="!showCamera && !capturedImage" class="placeholder">
                  <span class="placeholder-icon">📹</span>
                  <p>Point camera at brown objects</p>
                </div>
              </div>

              <div class="camera-controls">
                <select v-model="selectedCamera" class="camera-select">
                  <option value="environment">Back Camera</option>
                  <option value="user">Front Camera</option>
                </select>

                <div class="action-buttons">
                  <button v-if="!showCamera" @click="openCamera" class="btn btn-primary">📹 Open Camera</button>
                  <button v-else-if="!capturedImage" @click="captureImage" class="btn btn-success">📸 Capture</button>
                  <button v-if="capturedImage" @click="retakeImage" class="btn btn-warning">🔄 Retake</button>
                  <button v-if="capturedImage" @click="saveImage" class="btn btn-info">💾 Save</button>
                  <button v-if="capturedImage" @click="startDetection" class="btn btn-detect">🟢 Detect</button>
                  <button v-if="showCamera" @click="closeCamera" class="btn btn-secondary">✕ Close</button>
                </div>
              </div>

              <div v-if="cameraError" class="error-message">{{ cameraError }}</div>
            </div>

            <!-- Upload Mode -->
            <div v-if="scannerMode === 'upload'" class="scanner-upload">
              <div class="upload-area" v-if="!uploadedImage">
                <input 
                  ref="fileInput"
                  type="file"
                  @change="handleFileSelect"
                  accept="image/*"
                  capture="environment"
                  style="display: none"
                />
                <div 
                  @click="$refs.fileInput.click()"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleFileDrop"
                  :class="['drop-zone', { dragging: isDragging }]"
                >
                  <span class="upload-icon">📁</span>
                  <p>Click to browse or drag & drop</p>
                  <span class="upload-hint">Supported: JPG, PNG, GIF (Max 5MB)</span>
                </div>
              </div>

              <div v-else class="uploaded-preview">
                <img :src="uploadedImage" alt="Uploaded" class="preview-image" />
              </div>

              <div class="upload-actions">
                <button v-if="uploadedImage" @click="startDetection" class="btn btn-detect">🟢 Start Detection</button>
                <button v-if="uploadedImage" @click="removeUploadedImage" class="btn btn-secondary">🗑️ Remove</button>
                <button v-if="uploadedImage" @click="downloadUploadedImage" class="btn btn-info">💾 Download</button>
              </div>

              <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
            </div>

            <!-- Detection Results -->
            <div v-if="detectionStarted && scanResults.treeDetected" class="detection-results">
              <h3>🔍 Detection Results</h3>
              <div class="results-grid">
                <div class="result-item">
                  <span class="label">Brown Detected:</span>
                  <span class="value">Yes ✓</span>
                </div>
                <div class="result-item highlight">
                  <span class="label">Height (m):</span>
                  <span class="value">{{ scanResults.height }}</span>
                </div>
                <div class="result-item highlight">
                  <span class="label">Width (cm):</span>
                  <span class="value">{{ scanResults.width }}</span>
                </div>
                <div class="result-item">
                  <span class="label">Diameter:</span>
                  <span class="value">{{ scanResults.diameter }} cm</span>
                </div>
                <div class="result-item">
                  <span class="label">Est. Lumber:</span>
                  <span class="value">{{ scanResults.estimatedLumber }} bf</span>
                </div>
                <div class="result-item">
                  <span class="label">Quality:</span>
                  <span class="value">{{ scanResults.quality }}</span>
                </div>
                <div class="result-item">
                  <span class="label">Confidence:</span>
                  <span class="value">{{ scanResults.confidence }}%</span>
                </div>
              </div>
            </div>

            <div v-if="detectionError" class="error-message">{{ detectionError }}</div>
          </div>
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

export default {
  name: 'Operations',
  components: {
    StaffSidebar
  },
  data() {
    return {
      activeTab: 'inventory',
      tabs: [
        { label: 'Inventory', value: 'inventory', icon: '📦' },
        { label: 'Scanner', value: 'scanner', icon: '📹' },
        { label: 'Dispatch', value: 'dispatch', icon: '🚚' },
        { label: 'Reports', value: 'reports', icon: '📊' }
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
        height: '0',
        width: '0',
        diameter: '0',
        estimatedLumber: '0',
        quality: 'N/A',
        confidence: '0'
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
    async openCamera() {
      this.cameraError = ''
      this.uploadError = ''
      this.showCamera = true
      this.capturedImage = null

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.cameraError = 'Camera is not supported in this browser. Using upload camera instead.'
        this.scannerMode = 'upload'
        await this.$nextTick()
        if (this.$refs.fileInput) this.$refs.fileInput.click()
        return
      }

      if (!window.isSecureContext) {
        this.cameraError = 'Real-time camera needs HTTPS on mobile. Switched to upload camera mode.'
        this.scannerMode = 'upload'
        this.showCamera = false
        await this.$nextTick()
        if (this.$refs.fileInput) this.$refs.fileInput.click()
        return
      }

      try {
        const constraints = [
          { video: { facingMode: { ideal: this.selectedCamera }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
          { video: { facingMode: this.selectedCamera }, audio: false },
          { video: true, audio: false }
        ]

        let stream = null
        for (const constraint of constraints) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraint)
            break
          } catch (error) {
            stream = null
          }
        }

        if (!stream) throw new Error('Could not start camera stream')
        this.stream = stream

        await this.$nextTick()
        if (this.$refs.video) {
          this.$refs.video.srcObject = this.stream
          if (typeof this.$refs.video.play === 'function') {
            try { await this.$refs.video.play() } catch (e) {}
          }
        }
      } catch (err) {
        if (err?.name === 'NotAllowedError') {
          this.cameraError = 'Camera permission denied. Allow camera access in browser settings and try again.'
        } else if (err?.name === 'NotFoundError') {
          this.cameraError = 'No camera found on this device.'
        } else {
          this.cameraError = 'Unable to access camera. Switched to upload camera mode.'
        }
        this.scannerMode = 'upload'
        this.showCamera = false
        await this.$nextTick()
        if (this.$refs.fileInput) this.$refs.fileInput.click()
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

        if (result.height && result.width && result.diameter) {
          this.scanResults = {
            treeDetected: true,
            height: result.height || '0',
            width: result.width || '0',
            diameter: result.diameter || '0',
            estimatedLumber: result.estimatedLumber || '0',
            quality: result.quality || 'N/A',
            confidence: result.confidence || '0'
          }
        } else {
          this.detectionError = '⚠️ No brown object detected in image!'
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
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 70px;
}

.operations-main {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.operations-container {
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
