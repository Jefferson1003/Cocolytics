<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="dashboard-container">
      <div class="scanner-header">
        <h1>🟤 Brown Object Scanner</h1>
      </div>

      <div class="scanner-wrapper">
        <!-- Status Banner -->
        <div v-if="detectionStarted && scanResults.treeDetected" class="detection-status success">
          <span class="status-icon">✅</span>
          <div class="status-info">
            <strong>Brown Detected!</strong>
            <p>Cocolumber dimensions calculated successfully</p>
          </div>
        </div>
        <div v-else-if="detectionStarted && !scanResults.treeDetected && !detectionError" class="detection-status scanning">
          <span class="status-icon">🔍</span>
          <div class="status-info">
            <strong>Scanning...</strong>
            <p>Looking for brown objects</p>
          </div>
        </div>

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
            <canvas ref="overlayCanvas" class="overlay-canvas" @click="handleCalibrationClick"></canvas>
            <div v-if="!showCamera && !capturedImage" class="placeholder">
              <span class="placeholder-icon">📹</span>
              <p>Point camera at brown objects</p>
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
              <button v-if="showCamera" class="btn-action btn-calibrate" @click="startCalibration">📏 Calibrate</button>
              
              <template v-if="showCamera && !capturedImage">
                <button class="btn-action btn-detect" @click="startDetection">
                  🟢 Start Detection
                </button>
                <button class="btn-action btn-stop" @click="closeCamera">
                  ⏹️ Stop Camera
                </button>
              </template>

              <template v-if="capturedImage">
                <button class="btn-action btn-detect" @click="startDetection">
                  🟢 Start Detection
                </button>
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
                <span class="result-label">Brown Detected:</span>
                <span class="result-value">{{ scanResults.treeDetected ? 'Yes ✓' : 'No ✗' }}</span>
              </div>
              <div class="result-item result-highlight">
                <span class="result-label">Height (m):</span>
                <span class="result-value">{{ scanResults.height }}</span>
              </div>
              <div class="result-item result-highlight">
                <span class="result-label">Width (cm):</span>
                <span class="result-value">{{ scanResults.width || scanResults.diameter }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Diameter:</span>
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
                capture="environment"
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
                <span class="result-label">Brown Detected:</span>
                <span class="result-value">{{ scanResults.treeDetected ? 'Yes ✓' : 'No ✗' }}</span>
              </div>
              <div class="result-item result-highlight">
                <span class="result-label">Height (m):</span>
                <span class="result-value">{{ scanResults.height }}</span>
              </div>
              <div class="result-item result-highlight">
                <span class="result-label">Width (cm):</span>
                <span class="result-value">{{ scanResults.width || scanResults.diameter }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Diameter:</span>
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
      // Realtime / OpenCV related
      realTimeDetection: false,
      openCvReady: false,
      PIXEL_TO_CM: 0.1,
      calibrationMode: false,
      calibrationPoints: [],
      detectionIntervalRef: null,
      scanResults: {
        treeDetected: false,
        height: '0',
        width: '0',
        diameter: '0',
        estimatedLumber: '0',
        quality: 'N/A',
        confidence: '0'
      }
    }
  },
  mounted() {
    // Load OpenCV.js dynamically if not present
    if (window.cv && window.cv.imread) {
      this.openCvReady = true
      return
    }

    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.x/opencv.js'
    script.async = true
    script.onload = () => {
      // Wait for OpenCV to initialize
      const checkReady = () => {
        if (window.cv && window.cv.onRuntimeInitialized) {
          window.cv.onRuntimeInitialized = () => {
            this.openCvReady = true
            console.log('OpenCV.js loaded')
          }
        } else if (window.cv && window.cv.imread) {
          this.openCvReady = true
          console.log('OpenCV.js ready')
        } else {
          setTimeout(checkReady, 200)
        }
      }
      checkReady()
    }
    document.body.appendChild(script)
  },
  methods: {
    async openCamera() {
      this.uploadError = ''
      this.showCamera = true
      this.capturedImage = null
      this.cameraError = ''

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.cameraError = 'Camera is not supported in this browser. Using upload camera instead.'
        this.activeTab = 'upload'
        await this.$nextTick()
        if (this.$refs.fileInput) this.$refs.fileInput.click()
        return
      }

      if (!window.isSecureContext) {
        this.cameraError = 'Real-time camera needs HTTPS on mobile. Switched to upload camera mode.'
        this.activeTab = 'upload'
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
        console.error('Camera access error:', err)
        if (err?.name === 'NotAllowedError') {
          this.cameraError = 'Camera permission denied. Allow camera access in browser settings and try again.'
        } else if (err?.name === 'NotFoundError') {
          this.cameraError = 'No camera found on this device.'
        } else {
          this.cameraError = 'Unable to access camera. Switched to upload camera mode.'
        }
        this.activeTab = 'upload'
        this.showCamera = false
        await this.$nextTick()
        if (this.$refs.fileInput) this.$refs.fileInput.click()
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
      // If camera is active and no captured image, toggle realtime detection
      if (this.showCamera && !this.capturedImage) {
        if (!this.openCvReady) {
          this.detectionError = 'OpenCV not loaded yet. Please wait.'
          return
        }

        if (!this.realTimeDetection) {
          // Start realtime processing
          this.realTimeDetection = true
          this.detectionStarted = true
          this.detectionError = ''
          // ensure overlay canvas matches video size
          this.$nextTick(() => {
            this.setupOverlaySize()
            this.detectionIntervalRef = setInterval(this.processFrame, 400)
          })
        } else {
          // Stop realtime
          this.stopRealtimeDetection()
        }

        return
      }

      // Fallback: existing uploaded/captured image path (send to backend)
      this.detectionStarted = true
      this.detectionError = ''
      try {
        const imageData = this.capturedImage || this.uploadedImage
        if (!imageData) {
          this.detectionError = 'No image to analyze. Please capture or upload an image first.'
          return
        }

        this.scanResults = {
          treeDetected: false,
          height: 'Analyzing...',
          width: 'Analyzing...',
          diameter: 'Analyzing...',
          estimatedLumber: 'Analyzing...',
          quality: 'Analyzing...',
          confidence: 'Analyzing...'
        }

        const token = localStorage.getItem('token')
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/staff/detect-cocolumber`

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

          const responseText = await response.text()
          try { result = JSON.parse(responseText) } catch (e) { this.detectionError = 'Server error (invalid JSON)'; return }
        } catch (fetchError) {
          this.detectionError = 'Connection failed. Check if backend/ML services are running.'
          return
        }

        if (!response.ok) {
          this.detectionError = `Detection failed: ${result.message || result.error || 'Unknown error'}`
          return
        }

        if (result.height && result.width && result.diameter) {
          this.scanResults = {
            treeDetected: true,
            height: result.height || '0',
            width: result.width || '0',
            diameter: result.diameter || result.width || '0',
            estimatedLumber: result.estimatedLumber || '0',
            quality: result.quality || 'N/A',
            confidence: result.confidence || '0'
          }
          // Show detailed success message
          const message = `✅ Brown Cocolumber Detected!\n\n` +
            `📏 Height: ${this.scanResults.height} m\n` +
            `📐 Width: ${this.scanResults.width} cm\n` +
            `🪵 Diameter: ${this.scanResults.diameter} cm\n` +
            `📦 Estimated: ${this.scanResults.estimatedLumber} board feet\n` +
            `🏆 Quality: ${this.scanResults.quality}\n` +
            `✅ Confidence: ${this.scanResults.confidence}%`
          alert(message)
        } else {
          this.detectionError = '⚠️ No brown object detected in image!'
          this.scanResults = { treeDetected: false, height: '0', width: '0', diameter: '0', estimatedLumber: '0', quality: 'N/A', confidence: '0' }
          alert('⚠️ No brown object detected. Please scan a brown cocolumber object.')
        }
      } catch (error) {
        this.detectionError = `Detection failed: ${error.message}`
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
    if (this.detectionIntervalRef) {
      clearInterval(this.detectionIntervalRef)
      this.detectionIntervalRef = null
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

.dashboard-container {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
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

.btn-calibrate {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
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

.detection-status {
  padding: 20px 30px;
  margin-bottom: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: slideDown 0.4s ease-out;
}

.detection-status.success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(129, 199, 132, 0.15));
  border: 2px solid #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.detection-status.scanning {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(100, 181, 246, 0.15));
  border: 2px solid #2196F3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.status-icon {
  font-size: 2.5rem;
  animation: pulse 1.5s infinite;
}

.status-info {
  flex: 1;
  text-align: left;
}

.status-info strong {
  display: block;
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 4px;
}

.status-info p {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
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

.result-item.result-highlight {
  background: #f0f8ff;
  border: 2px solid #2196F3;
  box-shadow: 0 0 8px rgba(33, 150, 243, 0.2);
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
    padding: 76px 16px 20px;
    width: 100%;
  }

  .scanner-header h1 {
    font-size: 1.8rem;
  }

  .tab-content {
    padding: 20px;
  }

  .scanner-results {
    padding: 16px;
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
    grid-template-columns: 1fr;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .result-label,
  .result-value {
    word-break: break-word;
  }

  .result-value {
    align-self: flex-end;
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
