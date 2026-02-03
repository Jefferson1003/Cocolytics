<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="dashboard-container">
      <div class="scanner-header">
        <h1>� Coco Lumber Estimator</h1>
      </div>

      <div class="scanner-wrapper">
        <!-- Tabs -->
        <div class="tabs-container">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'camera' }"
            @click="activeTab = 'camera'">
            📹 Real-time Camera
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'upload' }"
            @click="activeTab = 'upload'">
            📁 Upload Image
          </button>
        </div>

        <!-- Camera Tab -->
        <div v-if="activeTab === 'camera'" class="tab-content">
          <div class="display-area">
            <video v-if="showCamera && !capturedImage" ref="video" autoplay playsinline class="camera-feed"></video>
            <img v-if="capturedImage" :src="capturedImage" alt="Captured" class="captured-image" />
            <div v-if="!showCamera && !capturedImage" class="placeholder">
              <span class="placeholder-icon">📹</span>
              <p>Camera Preview</p>
            </div>
            <canvas ref="canvas" style="display: none;"></canvas>
          </div>

          <div class="camera-controls-section">
            <div class="camera-select">
              <label>Select Camera:</label>
              <select v-model="selectedCamera" class="camera-dropdown">
                <option value="environment">Back Camera</option>
                <option value="user">Front Camera</option>
              </select>
            </div>

            <div class="action-buttons">
              <button 
                v-if="!showCamera"
                class="btn-action btn-start" 
                @click="openCamera">
                🎥 Start Camera
              </button>
              
              <template v-if="showCamera && !capturedImage">
                <button class="btn-action btn-detect" @click="startDetection">
                  🟢 Start Detection
                </button>
                <button class="btn-action btn-stop" @click="closeCamera">
                  ⏹️ Stop Camera
                </button>
              </template>

              <template v-if="capturedImage">
                <button class="btn-action btn-retake" @click="retakeImage">
                  🔄 Retake
                </button>
                <button class="btn-action btn-save" @click="saveImage">
                  💾 Save Image
                </button>
                <button class="btn-action btn-stop" @click="closeCamera">
                  ✕ Close
                </button>
              </template>

              <button 
                v-if="showCamera && !capturedImage"
                class="btn-action btn-capture" 
                @click="captureImage">
                📸 Capture
              </button>
            </div>
          </div>

          <div v-if="cameraError" class="error-message">{{ cameraError }}</div>
          <div v-if="detectionError" class="detection-error">
            <span class="error-icon">⚠️</span>
            {{ detectionError }}
          </div>

          <!-- Scanner Results Section -->
          <div v-if="(capturedImage || showCamera) && detectionStarted && !detectionError" class="scanner-results">
            <h3>🔍 Detection Results</h3>
            <div class="results-grid">
              <div class="result-item">
                <span class="result-label">Tree Detected:</span>
                <span class="result-value">{{ scanResults.treeDetected ? 'Yes ✓' : 'No ✗' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Tree Height:</span>
                <span class="result-value">{{ scanResults.height }} meters</span>
              </div>
              <div class="result-item">
                <span class="result-label">Trunk Diameter:</span>
                <span class="result-value">{{ scanResults.diameter }} cm</span>
              </div>
              <div class="result-item">
                <span class="result-label">Estimated Lumber:</span>
                <span class="result-value">{{ scanResults.estimatedLumber }} board feet</span>
              </div>
              <div class="result-item">
                <span class="result-label">Quality Grade:</span>
                <span class="result-value">{{ scanResults.quality }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Confidence:</span>
                <span class="result-value">{{ scanResults.confidence }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Tab -->
        <div v-if="activeTab === 'upload'" class="tab-content">
          <div class="display-area">
            <div v-if="!uploadedImage" 
                 class="upload-zone" 
                 @dragover.prevent="isDragging = true"
                 @dragleave.prevent="isDragging = false"
                 @drop.prevent="handleFileDrop"
                 :class="{ 'drag-over': isDragging }"
                 @click="$refs.fileInput.click()">
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileSelect"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                style="display: none;">
              <span class="upload-icon">📁</span>
              <p>Click to browse or drag & drop</p>
              <span class="upload-hint">Supported: JPG, PNG, GIF (Max 5MB)</span>
            </div>

            <div v-else class="uploaded-preview">
              <img :src="uploadedImage" alt="Uploaded" class="preview-image" />
            </div>
          </div>

          <div class="action-buttons">
            <button v-if="uploadedImage" class="btn-action btn-detect" @click="startDetection">
              🟢 Start Detection
            </button>
            <button v-if="uploadedImage" class="btn-action btn-remove" @click="removeUploadedImage">
              🗑️ Remove
            </button>
            <button v-if="uploadedImage" class="btn-action btn-download" @click="downloadUploadedImage">
              💾 Download
            </button>
          </div>

          <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
          <div v-if="detectionError" class="detection-error">
            <span class="error-icon">⚠️</span>
            {{ detectionError }}
          </div>

          <!-- Scanner Results Section -->
          <div v-if="uploadedImage && detectionStarted && !detectionError" class="scanner-results">
            <h3>🔍 Detection Results</h3>
            <div class="results-grid">
              <div class="result-item">
                <span class="result-label">Tree Detected:</span>
                <span class="result-value">{{ scanResults.treeDetected ? 'Yes ✓' : 'No ✗' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Tree Height:</span>
                <span class="result-value">{{ scanResults.height }} meters</span>
              </div>
              <div class="result-item">
                <span class="result-label">Trunk Diameter:</span>
                <span class="result-value">{{ scanResults.diameter }} cm</span>
              </div>
              <div class="result-item">
                <span class="result-label">Estimated Lumber:</span>
                <span class="result-value">{{ scanResults.estimatedLumber }} board feet</span>
              </div>
              <div class="result-item">
                <span class="result-label">Quality Grade:</span>
                <span class="result-value">{{ scanResults.quality }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Confidence:</span>
                <span class="result-value">{{ scanResults.confidence }}%</span>
              </div>
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
  name: 'CameraScanner',
  components: {
    StaffSidebar
  },
  data() {
    return {
      activeTab: 'camera',
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
        diameter: '0',
        estimatedLumber: '0',
        quality: 'N/A',
        confidence: '0'
      }
    }
  },
  methods: {
    async openCamera() {
      this.showCamera = true
      this.capturedImage = null
      this.cameraError = ''
      
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: this.selectedCamera }
        })
        
        await this.$nextTick()
        
        if (this.$refs.video) {
          this.$refs.video.srcObject = this.stream
        }
      } catch (err) {
        console.error('Camera access error:', err)
        this.cameraError = 'Unable to access camera. Please ensure camera permissions are granted.'
      }
    },
    captureImage() {
      const video = this.$refs.video
      const canvas = this.$refs.canvas
      
      if (video && canvas) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const context = canvas.getContext('2d')
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        this.capturedImage = canvas.toDataURL('image/png')
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop())
        }
      }
    },
    retakeImage() {
      this.capturedImage = null
      this.openCamera()
    },
    async saveImage() {
      const link = document.createElement('a')
      link.download = `coconut-tree-scan-${Date.now()}.png`
      link.href = this.capturedImage
      link.click()
      
      alert('Image saved successfully!')
    },
    closeCamera() {
      this.showCamera = false
      this.capturedImage = null
      this.cameraError = ''
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processUploadedFile(file)
      }
    },
    handleFileDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file) {
        this.processUploadedFile(file)
      }
    },
    processUploadedFile(file) {
      this.uploadError = ''
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Invalid file type. Please upload JPG, PNG, or GIF images.'
        return
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'File size exceeds 5MB limit.'
        return
      }
      
      // Read and display image
      const reader = new FileReader()
      reader.onload = (e) => {
        this.uploadedImage = e.target.result
        console.log('Image loaded successfully, size:', this.uploadedImage.length)
      }
      reader.onerror = () => {
        this.uploadError = 'Failed to read the file. Please try again.'
      }
      reader.readAsDataURL(file)
    },
    removeUploadedImage() {
      this.uploadedImage = null
      this.uploadError = ''
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    async startDetection() {
      this.detectionStarted = true
      this.detectionError = ''
      
      try {
        // Get the image data (either from camera or upload)
        const imageData = this.capturedImage || this.uploadedImage
        
        console.log('Starting detection...')
        console.log('Captured Image:', this.capturedImage ? 'Available (' + this.capturedImage.length + ' chars)' : 'Not available')
        console.log('Uploaded Image:', this.uploadedImage ? 'Available (' + this.uploadedImage.length + ' chars)' : 'Not available')
        console.log('Using image data:', imageData ? 'Yes (' + imageData.length + ' chars)' : 'No')
        
        if (!imageData) {
          this.detectionError = 'No image to analyze. Please capture or upload an image first.'
          console.error('No image data available')
          return
        }
        
        // Show loading state
        this.scanResults = {
          treeDetected: false,
          height: 'Analyzing...',
          diameter: 'Analyzing...',
          estimatedLumber: 'Analyzing...',
          quality: 'Analyzing...',
          confidence: 'Analyzing...'
        }
        
        // Send image to backend API for ML detection
        const token = localStorage.getItem('token')
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/staff/detect-cocolumber`
        
        console.log('Sending to API:', apiUrl)
        console.log('Image size:', imageData.length, 'bytes')
        
        let response, result
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
          })
          
          // Log response status and headers
          console.log('Response status:', response.status)
          console.log('Response headers:', response.headers.get('content-type'))
          
          // Get response text first to debug HTML errors
          const responseText = await response.text()
          console.log('Response text (first 200 chars):', responseText.substring(0, 200))
          
          // Try to parse as JSON
          try {
            result = JSON.parse(responseText)
          } catch (parseError) {
            console.error('JSON parse error:', parseError)
            this.detectionError = '❌ Server error. Please check if backend is running on port 3000.'
            return
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError)
          this.detectionError = '❌ Connection failed. Check if backend and ML services are running.'
          return
        }
        
        console.log('Detection result:', result) // Debug log
        
        if (!response.ok) {
          this.detectionError = `❌ Detection failed: ${result.message || result.error || 'Unknown error'}`
          return
        }
        
        // Check detection result
        const detectedClass = (result.detectedClass || '').toLowerCase()
        
        // Check if it's a human
        if (detectedClass.includes('human') || detectedClass.includes('person') || 
            detectedClass.includes('man') || detectedClass.includes('woman') ||
            detectedClass.includes('child') || detectedClass.includes('people')) {
          this.detectionError = '⚠️ This is human, not cocolumber!'
          this.scanResults = {
            treeDetected: false,
            height: '0',
            diameter: '0',
            estimatedLumber: '0',
            quality: 'N/A',
            confidence: '0'
          }
          alert('⚠️ Human detected! This is not cocolumber.')
          return
        }
        
        // Check if it's cocolumber, wood, or tree
        if (detectedClass.includes('cocolumber') || 
            detectedClass.includes('coconut') || 
            detectedClass.includes('wood') || 
            detectedClass.includes('tree') || 
            detectedClass.includes('timber') ||
            detectedClass.includes('lumber') ||
            detectedClass.includes('log') ||
            detectedClass.includes('bark') ||
            detectedClass.includes('trunk')) {
          
          // Valid cocolumber detected - use ML results
          this.scanResults = {
            treeDetected: true,
            height: result.height || '0',
            diameter: result.diameter || '0',
            estimatedLumber: result.estimatedLumber || '0',
            quality: result.quality || 'N/A',
            confidence: result.confidence || '0'
          }
          alert('✅ Cocolumber detected successfully!')
        } else if (detectedClass.includes('not_cocolumber')) {
          // ML service explicitly rejected as non-cocolumber
          this.detectionError = '⚠️ Only cocolumber/wood/logs/trees can be scanned!'
          this.scanResults = {
            treeDetected: false,
            height: '0',
            diameter: '0',
            estimatedLumber: '0',
            quality: 'N/A',
            confidence: '0'
          }
          alert('⚠️ Only cocolumber/wood/logs/trees can be scanned! This appears to be something else.')
        } else {
          // Other object detected - not cocolumber
          this.detectionError = `⚠️ This is ${result.detectedClass || 'unknown object'}, not cocolumber!`
          this.scanResults = {
            treeDetected: false,
            height: '0',
            diameter: '0',
            estimatedLumber: '0',
            quality: 'N/A',
            confidence: '0'
          }
          alert(`⚠️ Only cocolumber/wood/logs/trees can be scanned! Detected: ${result.detectedClass || 'Unknown object'}.`)
        }
        
      } catch (error) {
        console.error('Detection error:', error)
        this.detectionError = `❌ Detection failed: ${error.message}`
        alert(`❌ Detection failed: ${error.message}. Make sure ML service is running.`)
        
        // Reset results
        this.scanResults = {
          treeDetected: false,
          height: '0',
          diameter: '0',
          estimatedLumber: '0',
          quality: 'N/A',
          confidence: '0'
        }
      }
    },
    downloadUploadedImage() {
      const link = document.createElement('a')
      link.download = `uploaded-coconut-tree-${Date.now()}.png`
      link.href = this.uploadedImage
      link.click()
    }
  },
  beforeUnmount() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #8b7fc7 0%, #9d8fcc 100%);
}

.dashboard-container {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scanner-header {
  margin-bottom: 30px;
  text-align: center;
}

.scanner-header h1 {
  font-size: 2.5rem;
  color: #333;
  font-weight: 700;
  margin: 0;
}

.scanner-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 1000px;
  overflow: hidden;
}

.tabs-container {
  display: flex;
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.tab-btn {
  flex: 1;
  padding: 18px 30px;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  background: #ebebeb;
}

.tab-btn.active {
  background: #4fa3d1;
  color: white;
  border-bottom: 3px solid #3b8ab8;
}

.tab-content {
  padding: 40px;
}

.display-area {
  width: 100%;
  height: 500px;
  background: #000;
  border-radius: 12px;
  border: 3px solid #4fa3d1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 25px;
  position: relative;
}

.camera-feed,
.captured-image,
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  text-align: center;
  color: #666;
}

.placeholder-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 15px;
  opacity: 0.5;
}

.placeholder p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.7;
}

.upload-zone {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #1a1a1a;
  transition: all 0.3s;
}

.upload-zone:hover,
.upload-zone.drag-over {
  background: #2a2a2a;
  border-color: #5eb3e0;
}

.upload-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 15px;
  opacity: 0.7;
}

.upload-zone p {
  color: #ccc;
  font-size: 1.2rem;
  margin: 10px 0;
}

.upload-hint {
  color: #888;
  font-size: 0.9rem;
}

.camera-controls-section {
  margin-bottom: 20px;
}

.camera-select {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.camera-select label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.camera-dropdown {
  padding: 10px 20px;
  border: 2px solid #4fa3d1;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 180px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-action {
  padding: 14px 32px;
  border: none;
  border-radius: 25px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-start {
  background: linear-gradient(135deg, #45b649 0%, #3a9a3d 100%);
  color: white;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(69, 182, 73, 0.4);
}

.btn-detect {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-detect:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-stop {
  background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
  color: white;
}

.btn-stop:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(117, 117, 117, 0.4);
}

.btn-capture {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
}

.btn-capture:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.btn-retake {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
}

.btn-retake:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.btn-save {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-remove {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.btn-remove:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.btn-download {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.error-message {
  color: #f44336;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.detection-error {
  color: #ff9800;
  padding: 20px;
  margin-top: 25px;
  text-align: center;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 12px;
  border: 2px solid #ff9800;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error-icon {
  font-size: 2rem;
}

.scanner-results {
  margin-top: 30px;
  padding: 25px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid #4fa3d1;
}

.scanner-results h3 {
  color: #333;
  font-size: 1.4rem;
  margin-bottom: 20px;
  text-align: center;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 18px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.result-label {
  font-weight: 600;
  color: #555;
}

.result-value {
  color: #2196F3;
  font-weight: 700;
}

@media (max-width: 768px) {
  .dashboard-container {
    margin-left: 0;
    padding: 20px;
  }

  .scanner-header h1 {
    font-size: 1.8rem;
  }

  .tab-content {
    padding: 20px;
  }

  .display-area {
    height: 350px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .results-grid {
    grid-template-columns: 1frpx;
  }

  .display-area {
    height: 350px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
