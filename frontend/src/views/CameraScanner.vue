<template>
  <div class="container scanner-component">
    <h1>🌳 Coco Lumber Estimator</h1>

    <div class="mode-selection">
      <button id="realtimeMode" class="mode-btn active">📷 Real-time Camera</button>
      <button id="uploadMode" class="mode-btn">📁 Upload Image</button>
    </div>

    <div id="realtimeSection" class="section active">
      <div class="camera-container">
        <div class="video-wrapper">
          <video id="videoInput" autoplay playsinline muted></video>
          <canvas id="canvasOutput"></canvas>
          <div id="detectionOverlay"></div>
          <div id="cameraFeedback" class="camera-feedback"></div>
        </div>
      </div>

      <div class="camera-controls">
        <div class="camera-selection mobile-hidden">
          <label for="cameraSelect">Select Camera: </label>
          <select id="cameraSelect">
            <option value="environment">Back Camera</option>
            <option value="user">Front Camera</option>
          </select>
        </div>

        <div class="controls">
          <button id="startBtn" class="btn primary" disabled>🎥 Start Camera</button>
          <button id="toggleDetectBtn" class="btn secondary">🟢 Start Detection</button>
          <button id="stopBtn" class="btn danger">⏹️ Stop Camera</button>
        </div>
      </div>

      <div class="mobile-instructions">
        <h3>📱 Mobile Instructions:</h3>
        <ol>
          <li>Tap "Start Camera" and allow camera access</li>
          <li>Point camera at coconut tree trunk</li>
          <li>Tap "Start Detection" for real-time measurement</li>
          <li>For accuracy: Use "Calibrate" with known object</li>
        </ol>
      </div>
    </div>

    <div id="uploadSection" class="section">
      <div class="upload-container">
        <div class="upload-area" id="uploadArea">
          <div class="upload-content">
            <span class="upload-icon">📁</span>
            <h3>Upload Coconut Tree Image</h3>
            <p>Click here or drag & drop your image</p>
            <p class="upload-note">Supports: JPG, PNG, WebP (Max: 5MB)</p>
          </div>
          <input type="file" id="imageInput" accept="image/*" hidden>
        </div>

        <div class="upload-preview" id="uploadPreview">
          <img id="previewImage" src="" alt="Preview">
          <button id="removeImage" class="btn danger">🗑 Remove Image</button>
        </div>

        <div class="upload-controls">
          <button id="analyzeBtn" class="btn primary" disabled>🔍 Analyze Image</button>
          <button id="calibrateUploadBtn" class="btn">🎯 Calibrate Upload</button>
        </div>
      </div>
    </div>

    <div class="calibration">
      <h3>🎯 Calibration</h3>
      <div class="calibration-inputs">
        <label>Reference Width (cm): </label>
        <input type="number" id="refWidth" value="10.0" step="0.1" min="1" max="100">
        <button id="calibrateBtn" class="btn">Calibrate Camera</button>
      </div>
      <p id="calibrationStatus">Not calibrated - Calibrate for accurate measurements</p>
    </div>

    <div class="results">
      <h3>📊 Measurement Results:</h3>
      <div class="result-grid">
        <div class="result-item">
          <span class="result-label">Diameter:</span>
          <span id="diameterResult">-- cm</span>
        </div>
        <div class="result-item">
          <span class="result-label">Height:</span>
          <span id="heightResult">-- cm</span>
        </div>
        <div class="result-item">
          <span class="result-label">Volume:</span>
          <span id="volumeResult">-- cm³</span>
        </div>
        <div class="result-item">
          <span class="result-label">Weight:</span>
          <span id="weightResult">-- kg</span>
        </div>
        <div class="result-item highlight">
          <span class="result-label">Coco Lumber Pieces:</span>
          <span id="lumberResult">-- pieces</span>
        </div>
      </div>
      <div class="detection-quality">
        <span class="quality-label">Detection Quality:</span>
        <span id="qualityResult">--</span>
      </div>
      <p id="status">Status: Select mode to start</p>
    </div>

    <div class="detection-info">
      <h3>🔍 Detection Information</h3>
      <p id="detectionInfo">No tree detected</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CameraScanner',
  mounted() {
    this.setupDomBindings();
    this.initializeApp();
    // load OpenCV if not present
    if (!(window.cv && window.cv.imread)) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://docs.opencv.org/master/opencv.js';
      s.onload = () => { window.onOpenCvReady && window.onOpenCvReady(); };
      document.head.appendChild(s);
    } else {
      window.onOpenCvReady && window.onOpenCvReady();
    }
  },
  beforeUnmount() {
    // stop camera if active
    try { if (window._scannerStream) window._scannerStream.getTracks().forEach(t=>t.stop()) } catch(e){}
  },
  methods: {
    setupDomBindings() {
      // Attach event listeners mirroring app.js
      document.getElementById('realtimeMode')?.addEventListener('click', ()=>this.switchMode('realtime'));
      document.getElementById('uploadMode')?.addEventListener('click', ()=>this.switchMode('upload'));

      document.getElementById('uploadArea')?.addEventListener('click', ()=>document.getElementById('imageInput')?.click());
      document.getElementById('imageInput')?.addEventListener('change', (e)=>{ if(e.target.files.length) this.handleImageFile(e.target.files[0]) });
      document.getElementById('removeImage')?.addEventListener('click', ()=>{ this.removeUploadedImage() });
      document.getElementById('analyzeBtn')?.addEventListener('click', ()=>this.analyzeUploadedImage());
      document.getElementById('calibrateUploadBtn')?.addEventListener('click', ()=>this.startUploadCalibration());

      document.getElementById('startBtn')?.addEventListener('click', async ()=>{ await this.startCamera(); });
      document.getElementById('toggleDetectBtn')?.addEventListener('click', ()=>this.toggleDetection());
      document.getElementById('stopBtn')?.addEventListener('click', ()=>this.stopCamera());
      document.getElementById('calibrateBtn')?.addEventListener('click', ()=>this.startCameraCalibration());

      // drag/drop
      const uploadArea = document.getElementById('uploadArea');
      uploadArea?.addEventListener('dragover', (e)=>{ e.preventDefault(); uploadArea.classList.add('dragover') });
      uploadArea?.addEventListener('dragleave', ()=> uploadArea.classList.remove('dragover'));
      uploadArea?.addEventListener('drop', (e)=>{ e.preventDefault(); uploadArea.classList.remove('dragover'); if(e.dataTransfer.files.length) this.handleImageFile(e.dataTransfer.files[0]) });

      // canvas calibration click
      document.getElementById('canvasOutput')?.addEventListener('click', (ev)=> this.handleCalibrationClick(ev));
    },

    // ---------------- INITIALIZATION ----------------
    initializeApp() {
      // constants
      window.LUMBER_VOLUME_CM3 = 2000;
      window.WOOD_DENSITY_G_CM3 = 0.6;
      window.MIN_CONTOUR_AREA = 2500;
      window.DETECTION_INTERVAL = 400;
      window.MAX_IMAGE_SIZE = 5 * 1024 * 1024;

      // state
      window._scannerStream = null;
      window._openCvReady = false;
      window.PIXEL_TO_CM = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 0.05 : 0.1;
      window._calibrationMode = false;
      window._calibrationPoints = [];
      window._realTimeDetection = false;
      window._detectionIntervalId = null;

      window.onOpenCvReady = ()=>{
        window._openCvReady = true;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('status').textContent = 'Status: Ready - Select mode to start';
        document.body.classList.remove('no-opencv');
        this.updateCameraFeedback('OpenCV loaded successfully');
      };

      // set initial UI bindings for mode switches
      this.switchMode('realtime');
      console.log('App initialized');
    },

    switchMode(mode) {
      const realtimeModeBtn = document.getElementById('realtimeMode');
      const uploadModeBtn = document.getElementById('uploadMode');
      const realtimeSection = document.getElementById('realtimeSection');
      const uploadSection = document.getElementById('uploadSection');

      if (mode === 'realtime') {
        realtimeModeBtn.classList.add('active'); uploadModeBtn.classList.remove('active');
        realtimeSection.classList.add('active'); uploadSection.classList.remove('active');
      } else {
        uploadModeBtn.classList.add('active'); realtimeModeBtn.classList.remove('active');
        uploadSection.classList.add('active'); realtimeSection.classList.remove('active');
      }
    },

    // ---------------- CAMERA ----------------
    async startCamera() {
      if (!window._openCvReady) { alert('Please wait for OpenCV to load...'); return }
      try {
        if (window._scannerStream) window._scannerStream.getTracks().forEach(t=>t.stop());

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const constraints = { video: { width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:24}, facingMode: isMobile ? 'environment' : 'environment' }, audio:false };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        window._scannerStream = stream;
        const video = document.getElementById('videoInput');
        video.srcObject = stream;
        await new Promise(r => video.onloadedmetadata = r);
        await video.play();

        const canvas = document.getElementById('canvasOutput');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.style.display = 'block';

        document.getElementById('toggleDetectBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('status').textContent = 'Status: Camera active - Tap \'Start Detection\'';
        document.body.classList.add('camera-active');
        this.updateCameraFeedback(`Camera active: ${video.videoWidth}x${video.videoHeight}`);
      } catch (err) {
        console.error('Camera error', err); alert('Camera access error: '+(err.message||err.name));
      }
    },

    stopCamera() {
      if (window._scannerStream) {
        if (window._realTimeDetection) { window._realTimeDetection = false; clearInterval(window._detectionIntervalId); document.getElementById('toggleDetectBtn').textContent = '🟢 Start Detection'; document.getElementById('toggleDetectBtn').classList.remove('active'); }
        window._scannerStream.getTracks().forEach(t=>t.stop()); window._scannerStream = null;
        document.getElementById('videoInput').srcObject = null;
        document.getElementById('toggleDetectBtn').disabled = true; document.getElementById('stopBtn').disabled = true; document.getElementById('startBtn').disabled = false;
        document.getElementById('status').textContent = 'Status: Camera stopped'; document.getElementById('detectionOverlay').classList.remove('overlay-active'); document.body.classList.remove('camera-active');
        this.showNoDetection(); this.updateCameraFeedback('Camera stopped');
      }
    },

    toggleDetection() {
      if (!window._scannerStream) { alert('Please start camera first!'); return }
      if (!window._realTimeDetection) {
        window._realTimeDetection = true; document.getElementById('toggleDetectBtn').textContent = '🔴 Stop Detection'; document.getElementById('toggleDetectBtn').classList.add('active');
        document.getElementById('status').textContent = 'Status: Real-time detection ACTIVE';
        window._detectionIntervalId = setInterval(()=>this.processFrame(), window.DETECTION_INTERVAL);
        this.updateCameraFeedback('Detection active - Point camera at tree');
      } else {
        window._realTimeDetection = false; clearInterval(window._detectionIntervalId); document.getElementById('toggleDetectBtn').textContent = '🟢 Start Detection'; document.getElementById('toggleDetectBtn').classList.remove('active');
        document.getElementById('status').textContent = 'Status: Detection paused'; document.getElementById('detectionOverlay').classList.remove('overlay-active'); this.updateCameraFeedback('Detection paused');
      }
    },

    // ---------------- CALIBRATION ----------------
    startCameraCalibration() {
      if (!window._scannerStream) { alert('Please start camera first!'); return }
      const refWidth = parseFloat(document.getElementById('refWidth').value);
      if (!refWidth || refWidth <= 0) { alert('Please enter a valid reference width in centimeters.'); return }
      window._calibrationMode = true; window._calibrationPoints = []; document.getElementById('calibrationStatus').textContent = 'Tap two points on a known object...'; document.getElementById('calibrationStatus').style.color = '#e74c3c'; this.updateCameraFeedback('Calibration mode - Tap two points');
    },

    handleCalibrationClick(event) {
      if (!window._calibrationMode) return;
      const canvas = document.getElementById('canvasOutput'); const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX; const y = (event.clientY - rect.top) * scaleY; window._calibrationPoints.push({x,y});
      const ctx = canvas.getContext('2d'); ctx.beginPath(); ctx.arc(x, y, 8, 0, 2*Math.PI); ctx.fillStyle = window._calibrationPoints.length===1? '#3498db' : '#e74c3c'; ctx.fill();
      if (window._calibrationPoints.length===2) {
        const d = Math.hypot(window._calibrationPoints[1].x-window._calibrationPoints[0].x, window._calibrationPoints[1].y-window._calibrationPoints[0].y);
        const ref = parseFloat(document.getElementById('refWidth').value) || 10;
        if (ref>0 && d>10) { window.PIXEL_TO_CM = ref/d; window._calibrationMode=false; document.getElementById('calibrationStatus').textContent = `✅ Calibrated! 1px = ${window.PIXEL_TO_CM.toFixed(4)}cm`; document.getElementById('calibrationStatus').style.color='#27ae60'; this.updateCameraFeedback(`Calibration complete: ${window.PIXEL_TO_CM.toFixed(4)}cm/px`); setTimeout(()=>{ if (window._realTimeDetection) this.processFrame() }, 500) } else { document.getElementById('calibrationStatus').textContent='❌ Points too close - try again'; window._calibrationPoints=[] }
      }
    },

    // ---------------- UPLOAD ----------------
    handleImageFile(file) {
      if (!file.type.startsWith('image/')) { alert('Please upload an image file (JPG, PNG, WebP)'); return }
      if (file.size > (5*1024*1024)) { alert('Image size too large. Please upload image smaller than 5MB.'); return }
      const reader = new FileReader(); reader.onload = (e)=>{ document.getElementById('previewImage').src = e.target.result; document.getElementById('uploadPreview').style.display = 'block'; document.getElementById('analyzeBtn').disabled = false; document.getElementById('status').textContent='Status: Image uploaded - Click "Analyze Image"'; document.getElementById('detectionInfo').textContent='Image ready for analysis' }; reader.readAsDataURL(file);
    },

    removeUploadedImage() { document.getElementById('previewImage').src=''; document.getElementById('uploadPreview').style.display='none'; document.getElementById('analyzeBtn').disabled=true; document.getElementById('imageInput').value=''; document.getElementById('status').textContent='Status: Upload mode - No image selected'; document.getElementById('detectionInfo').textContent='No image uploaded'; this.clearResults(); },

    analyzeUploadedImage() {
      const img = document.getElementById('previewImage'); if (!img.src) { alert('Please upload an image first!'); return }
      document.getElementById('status').textContent='Status: Analyzing image...'; document.getElementById('detectionInfo').textContent='Processing image for tree detection';
      const tempCanvas = document.createElement('canvas'); tempCanvas.width = img.naturalWidth; tempCanvas.height = img.naturalHeight; tempCanvas.getContext('2d').drawImage(img,0,0);
      this.processImageWithOpenCV(tempCanvas);
    },

    processImageWithOpenCV(canvas) {
      try {
        let src = cv.imread(canvas);
        let results = this.enhancedTreeDetection(src);
        if (results.detected) {
          this.updateEnhancedResults(results.diameter, results.height, results.volume, results.weight, results.lumber);
          this.drawImageDetection(canvas, results.rect);
          document.getElementById('qualityResult').textContent = results.quality;
          document.getElementById('detectionInfo').textContent = `Tree detected: ${results.contourArea.toFixed(0)} pixels`;
          document.getElementById('status').textContent = 'Status: Analysis complete';
        } else { this.showNoDetection(); document.getElementById('detectionInfo').textContent='No tree detected in image'; document.getElementById('status').textContent='Status: Analysis failed - No tree found' }
        src.delete();
      } catch (err) { console.error('Image analysis error:', err); this.showNoDetection(); document.getElementById('detectionInfo').textContent='Analysis error - Try another image'; document.getElementById('status').textContent='Status: Analysis error' }
    },

    drawImageDetection(canvas, rect) {
      const ctx = canvas.getContext('2d'); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 4; ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 16px Arial'; ctx.fillText(`D: ${(rect.width * window.PIXEL_TO_CM).toFixed(1)}cm`, rect.x, rect.y - 10); ctx.fillText(`H: ${(rect.height * window.PIXEL_TO_CM).toFixed(1)}cm`, rect.x, rect.y + rect.height + 25);
      document.getElementById('previewImage').src = canvas.toDataURL();
    },

    // ---------------- FRAME PROCESSING ----------------
    processFrame() {
      if (!window._scannerStream) return;
      const video = document.getElementById('videoInput'); if (!video.videoWidth) return;
      try {
        const canvas = document.getElementById('canvasOutput'); const ctx = canvas.getContext('2d'); if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) { canvas.width = video.videoWidth; canvas.height = video.videoHeight }
        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        let src = cv.imread(canvas);
        let results = this.enhancedTreeDetection(src);
        if (results.detected) {
          this.updateEnhancedResults(results.diameter, results.height, results.volume, results.weight, results.lumber);
          this.drawDetectionOverlay(results.rect, results.diameter / window.PIXEL_TO_CM, results.height / window.PIXEL_TO_CM);
          document.getElementById('qualityResult').textContent = results.quality;
          document.getElementById('detectionInfo').textContent = `Tree detected: ${results.contourArea.toFixed(0)} pixels`;
        } else { this.showNoDetection(); document.getElementById('detectionInfo').textContent = 'No tree detected - adjust camera' }
        src.delete();
      } catch (err) { console.error('Frame processing error:', err); this.showNoDetection(); document.getElementById('detectionInfo').textContent='Processing error' }
    },

    drawDetectionOverlay(rect, diameter_px, height_px) {
      document.getElementById('detectionOverlay').classList.add('overlay-active');
      const ctx = document.getElementById('canvasOutput').getContext('2d'); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=3; ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      ctx.fillStyle='#e74c3c'; ctx.font='14px Arial'; ctx.fillText(`D: ${(diameter_px * window.PIXEL_TO_CM).toFixed(1)}cm`, rect.x, rect.y - 5); ctx.fillText(`H: ${(height_px * window.PIXEL_TO_CM).toFixed(1)}cm`, rect.x, rect.y + rect.height + 20);
    },

    // ---------------- DETECTION ALGORITHM ----------------
    enhancedTreeDetection(src) {
      let hsv = new cv.Mat(); let mask = new cv.Mat();
      cv.cvtColor(src, hsv, cv.COLOR_RGBA2HSV);

      let low_brown1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0,50,30,0]);
      let high_brown1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [20,255,200,255]);
      let low_brown2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [160,50,30,0]);
      let high_brown2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180,255,200,255]);

      let mask1 = new cv.Mat(); let mask2 = new cv.Mat();
      cv.inRange(hsv, low_brown1, high_brown1, mask1);
      cv.inRange(hsv, low_brown2, high_brown2, mask2);
      cv.bitwise_or(mask1, mask2, mask);

      let kernel_open = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3,3));
      let kernel_close = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(9,9));
      cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel_open);
      cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel_close);

      let contours = new cv.MatVector(); let hierarchy = new cv.Mat();
      cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let result = { detected:false, diameter:0, height:0, volume:0, weight:0, lumber:0, quality:'Low', contourArea:0, rect:null };

      if (contours.size()>0) {
        let maxArea=0, maxIdx=-1;
        for (let i=0;i<contours.size();i++){ let area = cv.contourArea(contours.get(i)); if (area>window.MIN_CONTOUR_AREA && area>maxArea){ maxArea=area; maxIdx=i } }
        if (maxIdx!==-1) {
          let trunk = contours.get(maxIdx); let rect = cv.boundingRect(trunk);
          let diameter_cm = rect.width * window.PIXEL_TO_CM; let height_cm = rect.height * window.PIXEL_TO_CM; let radius_cm = diameter_cm/2;
          let volume_cm3 = Math.PI * Math.pow(radius_cm,2) * height_cm * 0.8; let weight_kg = (volume_cm3 * window.WOOD_DENSITY_G_CM3)/1000; let num_lumber = Math.max(0, (volume_cm3/window.LUMBER_VOLUME_CM3)*0.7);
          let quality = maxArea > 10000 ? 'High' : (maxArea > 5000 ? 'Medium' : 'Low');
          result = { detected:true, diameter:diameter_cm, height:height_cm, volume:volume_cm3, weight:weight_kg, lumber:num_lumber, quality, contourArea:maxArea, rect };
        }
      }

      [hsv, mask, mask1, mask2, contours, hierarchy, low_brown1, high_brown1, low_brown2, high_brown2, kernel_open, kernel_close].forEach(m=>{ try{ if (m && !m.isDeleted()) m.delete() }catch(e){} });
      return result;
    },

    // ---------------- UTILITIES / UI ----------------
    updateEnhancedResults(diameter, height, volume, weight, lumber) {
      document.getElementById('diameterResult').textContent = `${diameter.toFixed(1)} cm`;
      document.getElementById('heightResult').textContent = `${height.toFixed(1)} cm`;
      document.getElementById('volumeResult').textContent = `${volume.toFixed(0)} cm³`;
      document.getElementById('weightResult').textContent = `${weight.toFixed(1)} kg`;
      document.getElementById('lumberResult').textContent = `${Math.round(lumber*10)/10} pieces`;
      const results = [document.getElementById('diameterResult'), document.getElementById('heightResult'), document.getElementById('volumeResult'), document.getElementById('weightResult'), document.getElementById('lumberResult')];
      results.forEach(r=>{ r.parentElement.classList.add('detecting'); setTimeout(()=>r.parentElement.classList.remove('detecting'),1000) });
    },

    showNoDetection() { document.getElementById('diameterResult').textContent='-- cm'; document.getElementById('heightResult').textContent='-- cm'; document.getElementById('volumeResult').textContent='-- cm³'; document.getElementById('weightResult').textContent='-- kg'; document.getElementById('lumberResult').textContent='-- pieces'; document.getElementById('qualityResult').textContent='--'; document.getElementById('detectionOverlay').classList.remove('overlay-active'); },

    clearResults() { this.showNoDetection(); },

    updateCameraFeedback(message) { const el = document.getElementById('cameraFeedback'); el.textContent = message; el.style.display='block'; setTimeout(()=>{ if (!window._calibrationMode) el.style.display='none' }, 3000); }
  }
}
</script>

<style scoped>
/* Adopted styles from provided style.css (condensed) */
* { box-sizing: border-box }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif }
.container { max-width: 100%; margin: 0 auto; background: white; padding: 15px; border-radius: 12px }
.video-wrapper { position: relative; width: 100%; height: 300px; margin: 0 auto; border: 3px solid #3498db; border-radius: 10px; overflow: hidden; background: #000 }
#videoInput { width:100%; height:100%; object-fit:cover }
#canvasOutput { position:absolute; top:0; left:0; width:100%; height:100%; display:block }
.camera-feedback { position:absolute; top:10px; left:10px; right:10px; background: rgba(0,0,0,0.7); color:white; padding:8px; border-radius:5px; font-size:12px; text-align:center; display:none }
.controls { text-align:center; margin:15px 0; display:flex; flex-direction:column; gap:8px }
.btn { background:#3498db; color:white; border:none; padding:12px 16px; border-radius:20px; cursor:pointer }
.btn.primary { background:#27ae60 }
.btn.danger { background:#e74c3c }
.mode-selection { display:flex; margin-bottom:12px }
.mode-btn { flex:1; padding:10px; border:none; background:#ecf0f1; cursor:pointer }
.mode-btn.active { background:#3498db; color:white }
.result-grid { display:grid; grid-template-columns:1fr; gap:10px }
.result-item { background:white; padding:12px; border-radius:8px; text-align:center; border-left:4px solid #3498db }
.result-item.highlight { background:#d4edda; border-left-color:#28a745 }
.upload-area { border:3px dashed #3498db; border-radius:10px; padding:30px; text-align:center; background:#f8f9fa }
.upload-preview img { max-width:100%; max-height:300px; border-radius:10px }
.calibration { background:#fff3cd; padding:12px; border-radius:8px; margin-top:12px }
.overlay-active { border-color:#e74c3c !important; box-shadow:0 0 20px rgba(231,76,60,0.5) }
.detecting { animation: pulse 1s infinite }
@keyframes pulse { 0%{background-color:white}50%{background-color:#d4edda}100%{background-color:white} }
</style>
