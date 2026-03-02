<template>
  <div class="lumber-scanner-layout">
    <StaffSidebar />
    
    <div class="scanner-main">
      <div class="scanner-header">
        <h1>🌳 Lumber Scanner</h1>
        <p>Real-time tree detection and measurement using AI</p>
      </div>

      <!-- Mode Selector -->
      <div class="mode-tabs">
        <button 
          id="realtimeMode"
          @click="switchMode('realtime')"
          :class="['mode-btn', { active: currentMode === 'realtime' }]"
        >
          📹 Real-time Camera
        </button>
        <button 
          id="uploadMode"
          @click="switchMode('upload')"
          :class="['mode-btn', { active: currentMode === 'upload' }]"
        >
          📸 Upload Image
        </button>
      </div>

      <!-- Real-time Section -->
      <div id="realtimeSection" class="section-content" v-show="currentMode === 'realtime'">
        <div class="controls-group">
          <div class="control-item">
            <label>Select Camera:</label>
            <select id="cameraSelect" class="form-input">
              <option value="environment">Rear Camera</option>
              <option value="user">Front Camera</option>
            </select>
          </div>

          <div class="control-item">
            <label>Reference Width (cm):</label>
            <input 
              type="number" 
              id="refWidth" 
              placeholder="e.g., 10"
              value="10"
              min="1"
              max="100"
              class="form-input"
            />
          </div>

          <div class="button-group">
            <button id="startBtn" class="btn btn-primary">🎥 Start Camera</button>
            <button id="calibrateBtn" class="btn btn-secondary">📐 Calibrate</button>
            <button id="toggleDetectBtn" class="btn btn-success" disabled>🟢 Start Detection</button>
            <button id="stopBtn" class="btn btn-danger" disabled>⏹ Stop Camera</button>
          </div>

          <div id="calibrationStatusRealtime" class="calibration-status"></div>
        </div>

        <div class="camera-container">
          <video id="videoInput" playsinline autoplay muted></video>
          <canvas id="canvasOutput"></canvas>
          <div id="detectionOverlay" class="detection-overlay"></div>
          <div id="cameraFeedback" class="camera-feedback"></div>
        </div>

        <div class="debug-panel">
          <label style="color: white; font-weight:600; display:block; margin-bottom:8px;">Debug / Tuning</label>
          <label style="color:white"><input type="checkbox" id="showMaskCheckbox"> Show Mask Preview</label>
          <div class="hsv-controls">
            <label>Hmin <input type="range" id="hmin" min="0" max="179" value="0"></label>
            <label>Hmax <input type="range" id="hmax" min="0" max="179" value="35"></label>
            <label>Smin <input type="range" id="smin" min="0" max="255" value="30"></label>
            <label>Smax <input type="range" id="smax" min="0" max="255" value="255"></label>
            <label>Vmin <input type="range" id="vmin" min="0" max="255" value="40"></label>
            <label>Vmax <input type="range" id="vmax" min="0" max="255" value="255"></label>
          </div>
          <canvas id="maskCanvas" style="display:none; width:320px; height:180px; border-radius:8px; margin-top:8px; background:#111"></canvas>
        </div>
      </div>

      <!-- Upload Section -->
      <div id="uploadSection" class="section-content" v-show="currentMode === 'upload'">
        <div class="upload-area-container">
          <div id="uploadArea" class="upload-area">
            <div class="upload-icon">📁</div>
            <p>Click to upload or drag and drop</p>
            <small>JPG, PNG, WebP up to 5MB</small>
          </div>
          <input type="file" id="imageInput" accept="image/*" style="display: none;" />
        </div>

        <div id="uploadPreview" class="upload-preview" style="display: none;">
          <img id="previewImage" src="" alt="Preview" />
          
          <div class="upload-controls">
            <div class="control-item">
              <label>Reference Width (cm):</label>
              <input 
                type="number" 
                id="refWidthUpload" 
                placeholder="e.g., 10"
                min="1"
                max="100"
                class="form-input"
              />
            </div>

            <div class="button-group">
              <button id="calibrateUploadBtn" class="btn btn-secondary">📐 Calibrate Image</button>
              <button id="analyzeBtn" class="btn btn-primary" disabled>🔍 Analyze Image</button>
              <button id="removeImage" class="btn btn-danger">✕ Remove</button>
            </div>
          </div>

          <div id="calibrationStatusUpload" class="calibration-status"></div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="results-grid">
        <div class="result-card">
          <span class="result-label">Diameter</span>
          <span id="diameterResult" class="result-value">-- cm</span>
        </div>
        <div class="result-card">
          <span class="result-label">Height</span>
          <span id="heightResult" class="result-value">-- cm</span>
        </div>
        <div class="result-card">
          <span class="result-label">Volume</span>
          <span id="volumeResult" class="result-value">-- cm³</span>
        </div>
        <div class="result-card">
          <span class="result-label">Weight</span>
          <span id="weightResult" class="result-value">-- kg</span>
        </div>
        <div class="result-card">
          <span class="result-label">Lumber Pieces</span>
          <span id="lumberResult" class="result-value">-- pieces</span>
        </div>
        <div class="result-card">
          <span class="result-label">Quality</span>
          <span id="qualityResult" class="result-value">--</span>
        </div>
      </div>

      <!-- Status Information -->
      <div class="info-section">
        <div class="status-bar">
          <span id="status" class="status-text">Status: Ready</span>
          <span id="detectionInfo" class="detection-info">No detection yet</span>
        </div>
      </div>

      <!-- Mobile Instructions -->
      <div class="mobile-instructions" style="display: none;">
        <h3>📱 Mobile Instructions</h3>
        <ul>
          <li>Allow camera access when prompted</li>
          <li>Hold device steady for best results</li>
          <li>Calibrate with known object for accuracy</li>
          <li>Point camera at tree for detection</li>
        </ul>
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
      currentMode: 'realtime'
    }
  },
  mounted() {
    // Load OpenCV - use correct CDN URL
    if (window.cv) {
      console.log('OpenCV already loaded')
      this.initializeScannerApp()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/opencv.js/4.10.0/opencv.min.js'
    script.async = true
    script.onload = () => {
      console.log('OpenCV.js loaded from CDN')
      // Wait for OpenCV to fully initialize
      let waitCount = 0
      const checkOpenCV = () => {
        if (window.cv && window.cv.imread) {
          console.log('OpenCV ready for use')
          this.initializeScannerApp()
        } else if (waitCount < 20) {
          waitCount++
          setTimeout(checkOpenCV, 500)
        } else {
          console.error('OpenCV failed to initialize')
        }
      }
      checkOpenCV()
    }
    script.onerror = () => {
      console.error('Failed to load OpenCV.js')
      const statusElement = document.getElementById('status')
      if (statusElement) {
        statusElement.textContent = 'Status: OpenCV library failed to load'
      }
    }
    document.head.appendChild(script)
  },
  beforeUnmount() {
    this.cleanupScanner()
  },
  methods: {
    switchMode(mode) {
      this.currentMode = mode
      
      const realtimeModeBtn = document.getElementById('realtimeMode')
      const uploadModeBtn = document.getElementById('uploadMode')
      
      realtimeModeBtn?.classList.toggle('active', mode === 'realtime')
      uploadModeBtn?.classList.toggle('active', mode === 'upload')
      
      if (mode === 'upload' && window.scannerStream) {
        this.stopCameraScanner()
      }
      
      console.log(`Switched to ${mode} mode`)
    },
    initializeScannerApp() {
      if (typeof window.cv === 'undefined' || !window.cv) {
        console.error('❌ OpenCV.js not loaded yet, retrying...')
        setTimeout(() => this.initializeScannerApp(), 1000)
        return
      }

      console.log('✅ OpenCV.js is available, initializing scanner...')
      
      try {
        window.scannerState = {
          stream: null,
          openCvReady: true,
          pixelToCm: 0.1,
          calibrationMode: false,
          calibrationPoints: [],
          realTimeDetection: false,
          detectionInterval: null,
          // HSV tuning defaults (H:0-179, S/V:0-255)
          hsv: { hmin: 0, hmax: 35, smin: 30, smax: 255, vmin: 40, vmax: 255 },
          showMask: false,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          currentMode: 'realtime'
        }
        
        window.LUMBER_VOLUME_CM3 = 2000
        window.WOOD_DENSITY_G_CM3 = 0.6
        window.MIN_CONTOUR_AREA = 500
        window.DETECTION_INTERVAL = 400
        window.MAX_IMAGE_SIZE = 5 * 1024 * 1024
        
        this.attachEventListeners()
        
        const statusElement = document.getElementById('status')
        if (statusElement) {
          statusElement.textContent = "Status: Ready - Start camera to begin"
        }
        
        console.log('✅ Scanner app initialized successfully')
      } catch (err) {
        console.error('❌ Initialization error:', err)
      }
    },
    attachEventListeners() {
      const startBtn = document.getElementById('startBtn')
      const toggleDetectBtn = document.getElementById('toggleDetectBtn')
      const stopBtn = document.getElementById('stopBtn')
      const calibrateBtn = document.getElementById('calibrateBtn')
      const analyzeBtn = document.getElementById('analyzeBtn')
      const calibrateUploadBtn = document.getElementById('calibrateUploadBtn')
      const removeImageBtn = document.getElementById('removeImage')
      const uploadArea = document.getElementById('uploadArea')
      const imageInput = document.getElementById('imageInput')
      const canvasOutput = document.getElementById('canvasOutput')

      startBtn?.addEventListener('click', () => this.startCameraScanner())
      toggleDetectBtn?.addEventListener('click', () => this.toggleDetection())
      stopBtn?.addEventListener('click', () => this.stopCameraScanner())
      calibrateBtn?.addEventListener('click', () => this.startCameraCalibration())
      analyzeBtn?.addEventListener('click', () => this.analyzeUploadedImage())
      calibrateUploadBtn?.addEventListener('click', () => this.startUploadCalibration())
      removeImageBtn?.addEventListener('click', () => this.removeImage())
      // Canvas click: Alt+click = sample pixel, normal click = calibration when in calibration mode
      canvasOutput?.addEventListener('click', (e) => {
        if (window.scannerState?.calibrationMode) return this.handleCalibrationClick(e)
        if (e.altKey) return this.samplePixelFromCanvas(e)
      })

      // Preview image click: sample pixel when not in calibration mode
      const previewImage = document.getElementById('previewImage')
      previewImage?.addEventListener('click', (e) => {
        if (window.scannerState?.calibrationMode) return
        this.samplePixelFromImage(e)
      })

      uploadArea?.addEventListener('click', () => imageInput?.click())
      uploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault()
        uploadArea.classList.add('dragover')
      })
      uploadArea?.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover')
      })
      uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault()
        uploadArea.classList.remove('dragover')
        if (e.dataTransfer.files.length > 0) {
          this.handleImageFile(e.dataTransfer.files[0])
        }
      })

      imageInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleImageFile(e.target.files[0])
        }
      })

      // Debug / HSV tuning controls
      const showMaskCheckbox = document.getElementById('showMaskCheckbox')
      const maskCanvas = document.getElementById('maskCanvas')
      const hmin = document.getElementById('hmin')
      const hmax = document.getElementById('hmax')
      const smin = document.getElementById('smin')
      const smax = document.getElementById('smax')
      const vmin = document.getElementById('vmin')
      const vmax = document.getElementById('vmax')

      if (showMaskCheckbox) {
        showMaskCheckbox.addEventListener('change', (e) => {
          window.scannerState.showMask = !!e.target.checked
          if (maskCanvas) maskCanvas.style.display = window.scannerState.showMask ? 'block' : 'none'
        })
      }

      const updateHSV = () => {
        if (!window.scannerState) return
        window.scannerState.hsv = {
          hmin: parseInt(hmin?.value || 0),
          hmax: parseInt(hmax?.value || 35),
          smin: parseInt(smin?.value || 30),
          smax: parseInt(smax?.value || 255),
          vmin: parseInt(vmin?.value || 40),
          vmax: parseInt(vmax?.value || 255)
        }
      }

      ;[hmin, hmax, smin, smax, vmin, vmax].forEach(el => {
        el?.addEventListener('input', updateHSV)
      })
    },
    async startCameraScanner() {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 24 },
            facingMode: 'environment'
          },
          audio: false
        }

        const videoInput = document.getElementById('videoInput')
        const canvasOutput = document.getElementById('canvasOutput')
        const startBtn = document.getElementById('startBtn')
        const toggleDetectBtn = document.getElementById('toggleDetectBtn')
        const stopBtn = document.getElementById('stopBtn')
        const statusElement = document.getElementById('status')

        if (!videoInput || !canvasOutput) {
          alert('Camera elements not found')
          return
        }

        if (window.scannerStream) {
          window.scannerStream.getTracks().forEach(track => track.stop())
        }

        window.scannerStream = await navigator.mediaDevices.getUserMedia(constraints)
        if (!window.scannerState) window.scannerState = {}
        window.scannerState.stream = window.scannerStream
        videoInput.srcObject = window.scannerStream

        await new Promise((resolve) => {
          videoInput.onloadedmetadata = () => resolve()
        })

        await videoInput.play()

        canvasOutput.width = videoInput.videoWidth
        canvasOutput.height = videoInput.videoHeight

        toggleDetectBtn.disabled = false
        stopBtn.disabled = false
        startBtn.disabled = true
        statusElement.textContent = "Status: Camera active - Tap 'Start Detection'"

        document.body.classList.add('camera-active')
        this.updateCameraFeedback(`Camera active: ${videoInput.videoWidth}x${videoInput.videoHeight}`)

        console.log(`Camera started: ${videoInput.videoWidth}x${videoInput.videoHeight}`)
      } catch (err) {
        this.handleCameraError(err)
      }
    },
    stopCameraScanner() {
      if (window.scannerStream) {
        if (window.scannerState.realTimeDetection) {
          window.scannerState.realTimeDetection = false
          clearInterval(window.scannerState.detectionInterval)
          const toggleDetectBtn = document.getElementById('toggleDetectBtn')
          toggleDetectBtn.textContent = "🟢 Start Detection"
          toggleDetectBtn.classList.remove('active')
        }

        window.scannerStream.getTracks().forEach(track => track.stop())
        window.scannerStream = null
        if (window.scannerState) window.scannerState.stream = null

        const videoInput = document.getElementById('videoInput')
        videoInput.srcObject = null

        const startBtn = document.getElementById('startBtn')
        const toggleDetectBtn = document.getElementById('toggleDetectBtn')
        const stopBtn = document.getElementById('stopBtn')
        const statusElement = document.getElementById('status')

        toggleDetectBtn.disabled = true
        stopBtn.disabled = true
        startBtn.disabled = false
        statusElement.textContent = "Status: Camera stopped"

        document.body.classList.remove('camera-active')
        this.updateCameraFeedback("Camera stopped")

        this.showNoDetection()
        console.log("Camera stopped")
      }
    },
    toggleDetection() {
      if (!window.scannerStream) {
        alert("Please start camera first!")
        return
      }

      if (!window.cv || !window.cv.imread) {
        alert("OpenCV.js is still loading... Please wait a moment and try again.")
        console.warn('OpenCV not ready:', { cv: typeof window.cv, imread: window.cv?.imread })
        return
      }

      if (window.scannerState.pixelToCm === 0.1) {
        const proceed = confirm(
          "⚠️ Scanner not calibrated yet!\n\n" +
          "For accurate measurements, please:\n" +
          "1. Enter reference width (e.g., 10cm)\n" +
          "2. Click 'Calibrate Camera'\n" +
          "3. Tap two points on a known object\n\n" +
          "Continue anyway with default calibration?"
        )
        if (!proceed) return
      }

      const toggleDetectBtn = document.getElementById('toggleDetectBtn')
      const statusElement = document.getElementById('status')

      if (!window.scannerState.realTimeDetection) {
        console.log('Starting detection with pixelToCm:', window.scannerState.pixelToCm)
        window.scannerState.realTimeDetection = true
        toggleDetectBtn.textContent = "🔴 Stop Detection"
        toggleDetectBtn.classList.add('active')
        statusElement.textContent = "Status: Real-time detection ACTIVE"

        console.log('Starting real-time detection interval...')
        window.scannerState.detectionInterval = setInterval(() => this.processFrame(), window.DETECTION_INTERVAL)

        this.updateCameraFeedback("Detection active - Point camera at tree")
        console.log("Real-time detection started")
      } else {
        window.scannerState.realTimeDetection = false
        toggleDetectBtn.textContent = "🟢 Start Detection"
        toggleDetectBtn.classList.remove('active')
        statusElement.textContent = "Status: Detection paused"

        clearInterval(window.scannerState.detectionInterval)
        window.scannerState.detectionInterval = null
        this.updateCameraFeedback("Detection paused")
        console.log("Real-time detection stopped")
      }
    },
    processFrame() {
      if (!window.scannerStream || !window.cv || !window.cv.imread) {
        console.warn('❌ Scanner not ready:', { 
          stream: !!window.scannerStream, 
          cv: !!window.cv,
          pixelToCm: window.scannerState?.pixelToCm 
        })
        return
      }

      try {
        const canvasOutput = document.getElementById('canvasOutput')
        const videoInput = document.getElementById('videoInput')
        const ctx = canvasOutput.getContext('2d')

        if (!ctx || !canvasOutput) {
          console.warn('❌ Canvas not available')
          return
        }

        if (canvasOutput.width !== videoInput.videoWidth || 
            canvasOutput.height !== videoInput.videoHeight) {
          canvasOutput.width = videoInput.videoWidth
          canvasOutput.height = videoInput.videoHeight
        }

        ctx.drawImage(videoInput, 0, 0, canvasOutput.width, canvasOutput.height)

        let src = cv.imread(canvasOutput)
        let results = this.enhancedTreeDetection(src)

        console.log('🔍 Detection result:', {
          detected: results.detected,
          contourArea: results.contourArea?.toFixed(0),
          minArea: window.MIN_CONTOUR_AREA,
          pixelToCm: window.scannerState.pixelToCm
        })

        if (results.detected) {
          console.log('✅ TREE DETECTED!', results)
          this.updateEnhancedResults(
            results.diameter,
            results.height,
            results.volume,
            results.weight,
            results.lumber
          )

          this.drawDetectionOverlay(results.rect, results.diameter, results.height)
          const qualityResult = document.getElementById('qualityResult')
          if (qualityResult) qualityResult.textContent = results.quality
          const detectionInfo = document.getElementById('detectionInfo')
          if (detectionInfo) detectionInfo.textContent = `✅ Tree detected: ${results.contourArea.toFixed(0)} pixels`
        } else {
          this.showNoDetection()
          const detectionInfo = document.getElementById('detectionInfo')
          if (detectionInfo) detectionInfo.textContent = "❌ No tree detected - adjust camera"
        }

        src.delete()
      } catch (err) {
        console.error('Frame processing error:', err.message)
        this.showNoDetection()
      }
    },
    enhancedTreeDetection(src) {
      let hsv = new cv.Mat()
      let mask = new cv.Mat()

      try {
        // canvas image data is RGBA in browser; convert from RGBA to HSV
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2HSV)

        // Use dynamic HSV thresholds from scannerState (allows slider tuning)
        const hsvRange = (window.scannerState && window.scannerState.hsv) ? window.scannerState.hsv : { hmin:0, hmax:35, smin:30, smax:255, vmin:40, vmax:255 }

        // Create low/high Mats using hsv.type() (3 channels)
        let low1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hsvRange.hmin, hsvRange.smin, hsvRange.vmin])
        let high1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hsvRange.hmax, hsvRange.smax, hsvRange.vmax])

        // For reds that wrap around hue, we can also check high-hue range (optional)
        let low2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [155, hsvRange.smin, hsvRange.vmin])
        let high2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, hsvRange.smax, hsvRange.vmax])

        let mask1 = new cv.Mat()
        let mask2 = new cv.Mat()

        cv.inRange(hsv, low1, high1, mask1)
        cv.inRange(hsv, low2, high2, mask2)
        cv.bitwise_or(mask1, mask2, mask)

        // Less aggressive morphology
        let kernel_open = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(2, 2))
        let kernel_close = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5))

        cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel_open)
        cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel_close)

        // If mask preview enabled, render to debug canvas
        try {
          if (window.scannerState && window.scannerState.showMask) {
            const maskCanvas = document.getElementById('maskCanvas')
            if (maskCanvas) {
              // ensure canvas matches src size for clearer preview
              maskCanvas.width = mask.cols
              maskCanvas.height = mask.rows
              cv.imshow(maskCanvas, mask)
            }
          }
        } catch (renderErr) {
          console.warn('Mask preview render failed:', renderErr)
        }

        let contours = new cv.MatVector()
        let hierarchy = new cv.Mat()
        cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

        const contourCount = contours.size()
        console.log(`📦 Contours found: ${contourCount} (threshold: ${window.MIN_CONTOUR_AREA}px)`)

        let result = {
          detected: false,
          diameter: 0,
          height: 0,
          volume: 0,
          weight: 0,
          lumber: 0,
          quality: 'Low',
          contourArea: 0,
          rect: null
        }

        if (contours.size() > 0) {
          let maxArea = 0
          let maxContourIndex = -1
          let allAreas = []

          for (let i = 0; i < contours.size(); i++) {
            let area = cv.contourArea(contours.get(i))
            allAreas.push(area.toFixed(0))
            if (area > window.MIN_CONTOUR_AREA && area > maxArea) {
              maxArea = area
              maxContourIndex = i
            }
          }

          console.log(`📊 All contour areas: [${allAreas.join(', ')}]`)
          console.log(`✨ Max area: ${maxArea.toFixed(0)}, index: ${maxContourIndex}`)

          if (maxContourIndex !== -1) {
            let trunk = contours.get(maxContourIndex)
            let rect = cv.boundingRect(trunk)

            let diameter_cm = rect.width * window.scannerState.pixelToCm
            let height_cm = rect.height * window.scannerState.pixelToCm
            let radius_cm = diameter_cm / 2
            let volume_cm3 = Math.PI * Math.pow(radius_cm, 2) * height_cm * 0.8
            let weight_kg = (volume_cm3 * window.WOOD_DENSITY_G_CM3) / 1000
            let num_lumber = Math.max(0, (volume_cm3 / window.LUMBER_VOLUME_CM3) * 0.7)

            let quality = maxArea > 10000 ? 'High' : (maxArea > 5000 ? 'Medium' : 'Low')

            result = {
              detected: true,
              diameter: diameter_cm,
              height: height_cm,
              volume: volume_cm3,
              weight: weight_kg,
              lumber: num_lumber,
              quality: quality,
              contourArea: maxArea,
              rect: rect
            }
          }
        }

        [hsv, mask, mask1, mask2, contours, hierarchy,
         low_brown1, high_brown1, low_brown2, high_brown2,
         kernel_open, kernel_close].forEach(mat => {
          if (mat && !mat.isDeleted()) mat.delete()
        })

        return result
      } catch (err) {
        console.error('❌ Detection error:', err)
        return {
          detected: false,
          diameter: 0,
          height: 0,
          volume: 0,
          weight: 0,
          lumber: 0,
          quality: 'Low',
          contourArea: 0,
          rect: null
        }
      }
    },
    samplePixelFromCanvas(event) {
      try {
        const canvasOutput = document.getElementById('canvasOutput')
        if (!canvasOutput) return

        const rect = canvasOutput.getBoundingClientRect()
        const scaleX = canvasOutput.width / rect.width
        const scaleY = canvasOutput.height / rect.height
        const x = Math.floor((event.clientX - rect.left) * scaleX)
        const y = Math.floor((event.clientY - rect.top) * scaleY)

        const ctx = canvasOutput.getContext('2d')
        const img = ctx.getImageData(x, y, 1, 1).data
        const [r, g, b] = [img[0], img[1], img[2]]
        const hsv = this.rgbToHsv(r, g, b)

        if (!window.scannerState) window.scannerState = {}
        window.scannerState.hsv = {
          hmin: Math.max(0, Math.floor(hsv.h) - 8),
          hmax: Math.min(179, Math.floor(hsv.h) + 8),
          smin: Math.max(0, Math.floor(hsv.s) - 30),
          smax: Math.min(255, Math.floor(hsv.s) + 30),
          vmin: Math.max(0, Math.floor(hsv.v) - 30),
          vmax: Math.min(255, Math.floor(hsv.v) + 30)
        }

        // update sliders if present
        ;['hmin','hmax','smin','smax','vmin','vmax'].forEach(id => {
          const el = document.getElementById(id)
          if (el) el.value = window.scannerState.hsv[id]
        })

        const statusElement = document.getElementById('status')
        if (statusElement) statusElement.textContent = `Status: Sampled HSV(${Math.floor(hsv.h)},${Math.floor(hsv.s)},${Math.floor(hsv.v)})`
        window.scannerState.showMask = true
        const maskCanvas = document.getElementById('maskCanvas')
        if (maskCanvas) maskCanvas.style.display = 'block'
      } catch (err) {
        console.error('Sample pixel error:', err)
      }
    },
    samplePixelFromImage(event) {
      try {
        const previewImage = document.getElementById('previewImage')
        if (!previewImage || !previewImage.src) return

        const rect = previewImage.getBoundingClientRect()
        const scaleX = previewImage.naturalWidth / rect.width
        const scaleY = previewImage.naturalHeight / rect.height
        const x = Math.floor((event.clientX - rect.left) * scaleX)
        const y = Math.floor((event.clientY - rect.top) * scaleY)

        const tempCanvas = document.createElement('canvas')
        const tctx = tempCanvas.getContext('2d')
        tempCanvas.width = previewImage.naturalWidth
        tempCanvas.height = previewImage.naturalHeight
        tctx.drawImage(previewImage, 0, 0)

        const img = tctx.getImageData(x, y, 1, 1).data
        const [r, g, b] = [img[0], img[1], img[2]]
        const hsv = this.rgbToHsv(r, g, b)

        if (!window.scannerState) window.scannerState = {}
        window.scannerState.hsv = {
          hmin: Math.max(0, Math.floor(hsv.h) - 8),
          hmax: Math.min(179, Math.floor(hsv.h) + 8),
          smin: Math.max(0, Math.floor(hsv.s) - 30),
          smax: Math.min(255, Math.floor(hsv.s) + 30),
          vmin: Math.max(0, Math.floor(hsv.v) - 30),
          vmax: Math.min(255, Math.floor(hsv.v) + 30)
        }

        ;['hmin','hmax','smin','smax','vmin','vmax'].forEach(id => {
          const el = document.getElementById(id)
          if (el) el.value = window.scannerState.hsv[id]
        })

        const statusElement = document.getElementById('status')
        if (statusElement) statusElement.textContent = `Status: Sampled HSV(${Math.floor(hsv.h)},${Math.floor(hsv.s)},${Math.floor(hsv.v)})`
        window.scannerState.showMask = true
        const maskCanvas = document.getElementById('maskCanvas')
        if (maskCanvas) maskCanvas.style.display = 'block'
      } catch (err) {
        console.error('Sample image pixel error:', err)
      }
    },
    rgbToHsv(r, g, b) {
      // r,g,b: 0-255 -> return h:0-179 (OpenCV range), s:0-255, v:0-255
      let r1 = r / 255, g1 = g / 255, b1 = b / 255
      let max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1)
      let d = max - min
      let h = 0
      if (d === 0) h = 0
      else if (max === r1) h = ((g1 - b1) / d) % 6
      else if (max === g1) h = ((b1 - r1) / d) + 2
      else h = ((r1 - g1) / d) + 4
      h = Math.round(h * 60)
      if (h < 0) h += 360
      // convert to OpenCV hue range 0-179
      h = Math.round(h / 2)
      let s = max === 0 ? 0 : d / max
      let v = max
      return { h: h, s: Math.round(s * 255), v: Math.round(v * 255) }
    },
    drawDetectionOverlay(rect, diameter, height) {
      try {
        const detectionOverlay = document.getElementById('detectionOverlay')
        if (detectionOverlay) {
          detectionOverlay.classList.add('overlay-active')
        }

        const canvasOutput = document.getElementById('canvasOutput')
        if (!canvasOutput) return
        
        const ctx = canvasOutput.getContext('2d')
        if (!ctx) return

        ctx.strokeStyle = '#e74c3c'
        ctx.lineWidth = 3
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

        ctx.fillStyle = '#e74c3c'
        ctx.font = '14px Arial'
        ctx.fillText(`D: ${(diameter).toFixed(1)}cm`, rect.x, rect.y - 5)
        ctx.fillText(`H: ${(height).toFixed(1)}cm`, rect.x, rect.y + rect.height + 20)
      } catch (err) {
        console.error('Error drawing overlay:', err)
      }
    },
    startCameraCalibration() {
      const refWidthInput = document.getElementById('refWidth')
      if (!refWidthInput) {
        console.error('❌ refWidth input not found')
        return
      }

      const refWidth = parseFloat(refWidthInput.value)
      if (!refWidth || refWidth <= 0) {
        alert("⚠️ Please enter a valid reference width in centimeters (e.g., 10)")
        return
      }

      if (!window.scannerState.stream) {
        alert("❌ Please start camera first before calibrating!")
        return
      }

      window.scannerState.calibrationMode = true
      window.scannerState.calibrationPoints = []

      const calibrationStatus = document.getElementById('calibrationStatusRealtime')
      if (calibrationStatus) {
        calibrationStatus.textContent = "👆 Tap two points on a known object (max 10cm apart)"
        calibrationStatus.style.color = "#e74c3c"
        calibrationStatus.style.display = "block"
      }

      this.updateCameraFeedback("📐 Calibration mode - Tap two points on object")
      console.log(`📐 Calibration mode activated with reference: ${refWidth}cm`)
    },
    handleCalibrationClick(event) {
      if (!window.scannerState.calibrationMode) return

      const canvasOutput = document.getElementById('canvasOutput')
      if (!canvasOutput) return

      const calibrationStatus = document.getElementById('calibrationStatusRealtime')
      
      const rect = canvasOutput.getBoundingClientRect()
      const scaleX = canvasOutput.width / rect.width
      const scaleY = canvasOutput.height / rect.height

      const x = (event.clientX - rect.left) * scaleX
      const y = (event.clientY - rect.top) * scaleY

      window.scannerState.calibrationPoints.push({x, y})
      console.log(`📍 Point ${window.scannerState.calibrationPoints.length} clicked at (${x.toFixed(0)}, ${y.toFixed(0)})`)

      const ctx = canvasOutput.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = window.scannerState.calibrationPoints.length === 1 ? '#3498db' : '#e74c3c'
        ctx.fill()
      }

      if (window.scannerState.calibrationPoints.length === 1) {
        if (calibrationStatus) {
          calibrationStatus.textContent = "✌️ Now tap the second point..."
          calibrationStatus.style.color = "#e74c3c"
        }
        this.updateCameraFeedback("First point set - tap second point")
      }

      if (window.scannerState.calibrationPoints.length === 2) {
        const points = window.scannerState.calibrationPoints
        const pixelDistance = Math.sqrt(
          Math.pow(points[1].x - points[0].x, 2) +
          Math.pow(points[1].y - points[0].y, 2)
        )

        const refWidthInput = document.getElementById('refWidth')
        const refWidthCm = refWidthInput ? parseFloat(refWidthInput.value) : 0

        console.log(`📏 Pixel distance: ${pixelDistance.toFixed(1)}px, Reference: ${refWidthCm}cm`)

        if (refWidthCm > 0 && pixelDistance > 10) {
          window.scannerState.pixelToCm = refWidthCm / pixelDistance
          window.scannerState.calibrationMode = false

          if (calibrationStatus) {
            calibrationStatus.textContent = `✅ SUCCESS! 1px = ${window.scannerState.pixelToCm.toFixed(4)}cm`
            calibrationStatus.style.color = "#27ae60"
          }

          this.updateCameraFeedback(`✅ Calibration complete! Ready to detect.`)
          console.log(`✅ Calibration complete: 1px = ${window.scannerState.pixelToCm.toFixed(4)}cm`)

          setTimeout(() => {
            if (window.scannerState.realTimeDetection) this.processFrame()
          }, 500)
        } else {
          if (calibrationStatus) {
            calibrationStatus.textContent = `❌ Points too close (${pixelDistance.toFixed(0)}px) - Try again!`
            calibrationStatus.style.color = "#e74c3c"
          }
          window.scannerState.calibrationPoints = []
          this.updateCameraFeedback("Points too close - tap two points farther apart")
        }
      }
    },
    handleImageFile(file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, WebP)')
        return
      }

      if (file.size > window.MAX_IMAGE_SIZE) {
        alert('Image size too large. Please upload image smaller than 5MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const previewImage = document.getElementById('previewImage')
        previewImage.src = e.target.result
        const uploadPreview = document.getElementById('uploadPreview')
        uploadPreview.style.display = 'block'
        const analyzeBtn = document.getElementById('analyzeBtn')
        analyzeBtn.disabled = false
        const statusElement = document.getElementById('status')
        statusElement.textContent = 'Status: Image uploaded - Click "Analyze Image"'
        const detectionInfo = document.getElementById('detectionInfo')
        detectionInfo.textContent = 'Image ready for analysis'
      }
      reader.readAsDataURL(file)
    },
    removeImage() {
      const previewImage = document.getElementById('previewImage')
      previewImage.src = ''
      const uploadPreview = document.getElementById('uploadPreview')
      uploadPreview.style.display = 'none'
      const analyzeBtn = document.getElementById('analyzeBtn')
      analyzeBtn.disabled = true
      const imageInput = document.getElementById('imageInput')
      imageInput.value = ''
      const statusElement = document.getElementById('status')
      statusElement.textContent = 'Status: Upload mode - No image selected'
      const detectionInfo = document.getElementById('detectionInfo')
      detectionInfo.textContent = 'No image uploaded'
      this.showNoDetection()
    },
    analyzeUploadedImage() {
      const previewImage = document.getElementById('previewImage')
      if (!previewImage.src) {
        alert('Please upload an image first!')
        return
      }

      const statusElement = document.getElementById('status')
      statusElement.textContent = 'Status: Analyzing image...'
      const detectionInfo = document.getElementById('detectionInfo')
      detectionInfo.textContent = 'Processing image for tree detection'

      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      tempCanvas.width = previewImage.naturalWidth
      tempCanvas.height = previewImage.naturalHeight
      tempCtx.drawImage(previewImage, 0, 0)

      this.processImageWithOpenCV(tempCanvas)
    },
    processImageWithOpenCV(canvas) {
      try {
        let src = cv.imread(canvas)
        let results = this.enhancedTreeDetection(src)

        if (results.detected) {
          this.updateEnhancedResults(
            results.diameter,
            results.height,
            results.volume,
            results.weight,
            results.lumber
          )

          this.drawImageDetection(canvas, results.rect)
          const qualityResult = document.getElementById('qualityResult')
          qualityResult.textContent = results.quality
          const detectionInfo = document.getElementById('detectionInfo')
          detectionInfo.textContent = `Tree detected: ${results.contourArea.toFixed(0)} pixels`
          const statusElement = document.getElementById('status')
          statusElement.textContent = 'Status: Analysis complete'
        } else {
          this.showNoDetection()
          const detectionInfo = document.getElementById('detectionInfo')
          detectionInfo.textContent = 'No tree detected in image'
          const statusElement = document.getElementById('status')
          statusElement.textContent = 'Status: Analysis failed - No tree found'
        }

        src.delete()
      } catch (err) {
        console.error('Image analysis error:', err)
        this.showNoDetection()
        const detectionInfo = document.getElementById('detectionInfo')
        detectionInfo.textContent = 'Analysis error - Try another image'
        const statusElement = document.getElementById('status')
        statusElement.textContent = 'Status: Analysis error'
      }
    },
    drawImageDetection(canvas, rect) {
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#e74c3c'
      ctx.lineWidth = 4
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

      ctx.fillStyle = '#e74c3c'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(`D: ${(rect.width * window.scannerState.pixelToCm).toFixed(1)}cm`, rect.x, rect.y - 10)
      ctx.fillText(`H: ${(rect.height * window.scannerState.pixelToCm).toFixed(1)}cm`, rect.x, rect.y + rect.height + 25)

      const previewImage = document.getElementById('previewImage')
      previewImage.src = canvas.toDataURL()
    },
    startUploadCalibration() {
      const previewImage = document.getElementById('previewImage')
      if (!previewImage.src) {
        alert('Please upload an image first!')
        return
      }

      window.scannerState.calibrationMode = true
      window.scannerState.calibrationPoints = []
      const calibrationStatus = document.getElementById('calibrationStatusUpload')
      if (calibrationStatus) {
        calibrationStatus.textContent = "Click two points on a known object in the image..."
        calibrationStatus.style.color = "#e74c3c"
      }

      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      tempCanvas.width = previewImage.naturalWidth
      tempCanvas.height = previewImage.naturalHeight
      tempCtx.drawImage(previewImage, 0, 0)

      const clickHandler = (e) => {
        if (!window.scannerState.calibrationMode) return

        const rect = previewImage.getBoundingClientRect()
        const scaleX = previewImage.naturalWidth / rect.width
        const scaleY = previewImage.naturalHeight / rect.height

        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        window.scannerState.calibrationPoints.push({x, y})

        tempCtx.beginPath()
        tempCtx.arc(x, y, 8, 0, 2 * Math.PI)
        tempCtx.fillStyle = window.scannerState.calibrationPoints.length === 1 ? '#3498db' : '#e74c3c'
        tempCtx.fill()

        previewImage.src = tempCanvas.toDataURL()

        if (window.scannerState.calibrationPoints.length === 1) {
          calibrationStatus.textContent = "Now click the second point..."
        }

        if (window.scannerState.calibrationPoints.length === 2) {
          const points = window.scannerState.calibrationPoints
          const pixelDistance = Math.sqrt(
            Math.pow(points[1].x - points[0].x, 2) +
            Math.pow(points[1].y - points[0].y, 2)
          )

          const refWidthInput = document.getElementById('refWidthUpload') || document.getElementById('refWidth')
          const refWidth = refWidthInput ? parseFloat(refWidthInput.value) : 0

          if (refWidth > 0 && pixelDistance > 10) {
            window.scannerState.pixelToCm = refWidth / pixelDistance
            window.scannerState.calibrationMode = false

            calibrationStatus.textContent = `✅ Calibrated! 1px = ${window.scannerState.pixelToCm.toFixed(4)}cm`
            calibrationStatus.style.color = "#27ae60"

            previewImage.removeEventListener('click', clickHandler)
            setTimeout(() => this.analyzeUploadedImage(), 500)
          } else {
            calibrationStatus.textContent = "❌ Points too close - try again"
            window.scannerState.calibrationPoints = []
          }
        }
      }

      previewImage.addEventListener('click', clickHandler)
    },
    updateEnhancedResults(diameter, height, volume, weight, lumber) {
      const diameterResult = document.getElementById('diameterResult')
      const heightResult = document.getElementById('heightResult')
      const volumeResult = document.getElementById('volumeResult')
      const weightResult = document.getElementById('weightResult')
      const lumberResult = document.getElementById('lumberResult')

      diameterResult.textContent = `${diameter.toFixed(1)} cm`
      heightResult.textContent = `${height.toFixed(1)} cm`
      volumeResult.textContent = `${volume.toFixed(0)} cm³`
      weightResult.textContent = `${weight.toFixed(1)} kg`
      lumberResult.textContent = `${Math.round(lumber * 10) / 10} pieces`

      const results = [diameterResult, heightResult, volumeResult, weightResult, lumberResult]
      results.forEach(result => {
        result.parentElement.classList.add('detecting')
        setTimeout(() => result.parentElement.classList.remove('detecting'), 1000)
      })
    },
    showNoDetection() {
      const diameterResult = document.getElementById('diameterResult')
      const heightResult = document.getElementById('heightResult')
      const volumeResult = document.getElementById('volumeResult')
      const weightResult = document.getElementById('weightResult')
      const lumberResult = document.getElementById('lumberResult')
      const qualityResult = document.getElementById('qualityResult')
      const detectionOverlay = document.getElementById('detectionOverlay')

      diameterResult.textContent = "-- cm"
      heightResult.textContent = "-- cm"
      volumeResult.textContent = "-- cm³"
      weightResult.textContent = "-- kg"
      lumberResult.textContent = "-- pieces"
      qualityResult.textContent = "--"

      detectionOverlay.classList.remove('overlay-active')
    },
    updateCameraFeedback(message) {
      const cameraFeedback = document.getElementById('cameraFeedback')
      cameraFeedback.textContent = message
      cameraFeedback.style.display = 'block'
      setTimeout(() => {
        if (!window.scannerState.calibrationMode) {
          cameraFeedback.style.display = 'none'
        }
      }, 3000)
    },
    handleCameraError(err) {
      let errorMessage = "Camera error: "

      switch (err.name) {
        case 'NotAllowedError':
          errorMessage += "Please allow camera access in your browser settings."
          break
        case 'NotFoundError':
          errorMessage += "No camera found on this device."
          break
        case 'NotSupportedError':
          errorMessage += "Camera not supported by your browser."
          break
        case 'NotReadableError':
          errorMessage += "Camera is being used by another application."
          break
        case 'OverconstrainedError':
          errorMessage += "Camera doesn't support required settings. Trying alternative..."
          this.tryAlternativeConstraints()
          return
        default:
          errorMessage += "Unknown error occurred."
      }

      alert(errorMessage)
      const statusElement = document.getElementById('status')
      statusElement.textContent = "Status: " + errorMessage
      this.updateCameraFeedback("Camera error - " + errorMessage)
    },
    async tryAlternativeConstraints() {
      try {
        this.updateCameraFeedback("Trying alternative camera settings...")

        const alternativeConstraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 }
          },
          audio: false
        }

        const videoInput = document.getElementById('videoInput')
        const canvasOutput = document.getElementById('canvasOutput')
        const startBtn = document.getElementById('startBtn')
        const toggleDetectBtn = document.getElementById('toggleDetectBtn')
        const stopBtn = document.getElementById('stopBtn')
        const statusElement = document.getElementById('status')

        window.scannerStream = await navigator.mediaDevices.getUserMedia(alternativeConstraints)
        if (!window.scannerState) window.scannerState = {}
        window.scannerState.stream = window.scannerStream
        videoInput.srcObject = window.scannerStream

        await new Promise((resolve) => {
          videoInput.onloadedmetadata = () => resolve()
        })

        await videoInput.play()

        canvasOutput.width = videoInput.videoWidth
        canvasOutput.height = videoInput.videoHeight

        toggleDetectBtn.disabled = false
        stopBtn.disabled = false
        startBtn.disabled = true
        statusElement.textContent = "Status: Camera active (alternative mode)"

        document.body.classList.add('camera-active')
        this.updateCameraFeedback("Camera started with alternative settings")

        console.log(`Alternative camera: ${videoInput.videoWidth}x${videoInput.videoHeight}`)
      } catch (fallbackErr) {
        console.error("Alternative camera also failed:", fallbackErr)
        alert("Cannot access camera with any settings. Please check permissions.")
        const statusElement = document.getElementById('status')
        statusElement.textContent = "Status: Camera access failed"
      }
    },
    cleanupScanner() {
      this.stopCameraScanner()
      const imageInput = document.getElementById('imageInput')
      if (imageInput) {
        // keep handlers intact; just clear any selected file
        imageInput.value = ''
      }
    }
  }
}
</script>

<style scoped>
.lumber-scanner-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 70px;
}

.scanner-main {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.scanner-header {
  text-align: center;
  margin-bottom: 24px;
}

.scanner-header h1 {
  color: white;
  font-size: 2.2em;
  margin-bottom: 8px;
  font-weight: 700;
}

.scanner-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1em;
}

.mode-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.mode-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.3s;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.mode-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.section-content {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.controls-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 0.9em;
}

.form-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.9em;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: white;
}

.camera-container {
  position: relative;
  background: black;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  max-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#videoInput, #canvasOutput {
  width: 100%;
  height: auto;
  display: block;
}

#canvasOutput {
  position: absolute;
}

.detection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.overlay-active {
  border: 3px solid #4caf50;
  box-shadow: inset 0 0 10px rgba(76, 175, 80, 0.3);
}

.camera-feedback {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #4caf50;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 600;
  display: none;
  max-width: 200px;
}

.upload-area-container {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed rgba(102, 126, 234, 0.5);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.upload-area.dragover {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.upload-icon {
  font-size: 2.5em;
  margin-bottom: 12px;
}

.upload-area p {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  margin-bottom: 6px;
}

.upload-area small {
  color: rgba(255, 255, 255, 0.5);
}

.upload-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

#previewImage {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.upload-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.calibration-status {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-weight: 600;
  min-height: 24px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.result-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.result-card:hover {
  transform: translateY(-2px);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.result-card.detecting {
  animation: detect-pulse 0.6s ease-out;
}

@keyframes detect-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.result-label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.result-value {
  display: block;
  color: white;
  font-size: 1.3em;
  font-weight: 700;
}

.info-section {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.95em;
}

.detection-info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
}

.mobile-instructions {
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.8);
}

.mobile-instructions h3 {
  margin: 0 0 12px 0;
  color: #ffc107;
  font-size: 1em;
}

.mobile-instructions ul {
  margin: 0;
  padding-left: 20px;
}

.mobile-instructions li {
  margin-bottom: 6px;
}

@media (max-width: 768px) {
  .scanner-header h1 {
    font-size: 1.6em;
  }

  .controls-group {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
