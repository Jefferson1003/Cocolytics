<template>
  <div v-if="showModal" class="mobile-link-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>📱 Mobile Access</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Local IP -->
        <div class="link-section">
          <h3>📡 Local Network (Same WiFi)</h3>
          <p class="description">Use this if mobile is on the same WiFi as your computer</p>
          <div class="link-box">
            <input 
              type="text" 
              :value="localNetworkLink" 
              readonly 
              class="link-input"
              @click="copyToClipboard(localNetworkLink, 'Local link copied!')"
            />
            <button @click="copyToClipboard(localNetworkLink, 'Local link copied!')" class="copy-btn">
              📋 Copy
            </button>
          </div>
          <p class="hint">Click the input or button to copy</p>
        </div>

        <!-- Public Link -->
        <div class="link-section" v-if="ngrokLink">
          <h3>🌐 Public Link (Ngrok)</h3>
          <p class="description">Share anywhere - works from any network</p>
          <div class="link-box">
            <input 
              type="text" 
              :value="ngrokLink" 
              readonly 
              class="link-input"
              @click="copyToClipboard(ngrokLink, 'Ngrok link copied!')"
            />
            <button @click="copyToClipboard(ngrokLink, 'Ngrok link copied!')" class="copy-btn">
              📋 Copy
            </button>
          </div>
          <p class="hint">If ngrok is running, use this link. Check your ngrok tunnel.</p>
        </div>

        <!-- QR Code Display -->
        <div class="link-section">
          <h3>📲 Scan QR Code</h3>
          <p class="description">Scan with your phone camera to open instantly</p>
          
          <!-- QR Code Tabs -->
          <div class="qr-tabs">
            <button 
              @click="activeQRTab = 'local'" 
              :class="['qr-tab', { active: activeQRTab === 'local' }]"
            >
              Local Network
            </button>
            <button 
              v-if="ngrokLink"
              @click="activeQRTab = 'ngrok'" 
              :class="['qr-tab', { active: activeQRTab === 'ngrok' }]"
            >
              Public Link
            </button>
          </div>

          <!-- QR Code Image -->
          <div class="qr-code-container">
            <div v-if="activeQRTab === 'local'" class="qr-display">
              <img 
                :src="getQRCodeUrl(localNetworkLink)" 
                alt="Local Network QR Code"
                class="qr-image"
              />
              <p class="qr-label">📡 Local Network</p>
            </div>
            <div v-if="activeQRTab === 'ngrok' && ngrokLink" class="qr-display">
              <img 
                :src="getQRCodeUrl(ngrokLink)" 
                alt="Public Link QR Code"
                class="qr-image"
              />
              <p class="qr-label">🌐 Public Link</p>
            </div>
          </div>
          
          <p class="hint">Point your phone camera at the QR code to open</p>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <h4>💡 Tips:</h4>
          <ul>
            <li>Local IP: {{ localIp }}</li>
            <li>Use HTTPS ngrok link for secure access</li>
            <li>App works offline with PWA caching</li>
            <li>Can be installed on mobile home screen</li>
          </ul>
        </div>

        <!-- Success Message -->
        <div v-if="copyMessage" class="success-message">
          ✓ {{ copyMessage }}
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-close">Close</button>
        <button @click="openTestOnMobile" class="btn-test">🚀 Test on Mobile</button>
      </div>
    </div>
  </div>

  <!-- Floating Button -->
  <button v-if="!isOnMobile" class="mobile-fab" @click="openModal" title="Open on Mobile">
    📱
  </button>
</template>

<script>
export default {
  name: 'MobileAccessLink',
  data() {
    return {
      showModal: false,
      localIp: '',
      localNetworkLink: '',
      ngrokLink: '',
      copyMessage: '',
      isOnMobile: false,
      activeQRTab: 'local'
    }
  },
  mounted() {
    this.detectMobile()
    this.getLocalIp()
    this.checkNgrokLink()
  },
  methods: {
    detectMobile() {
      this.isOnMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    },
    getLocalIp() {
      // Get from hostname first
      const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
      const hostname = window.location.hostname
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Try to detect local IP using WebRTC
        this.detectLocalIP()
          .then(ip => {
            this.localIp = ip
            this.localNetworkLink = `http://${ip}:5173/login`
          })
          .catch(() => {
            // Fallback to showing instruction
            this.localIp = 'Use ipconfig to find IP'
            this.localNetworkLink = `http://localhost:5173/login`
          })
      } else {
        this.localIp = hostname
        this.localNetworkLink = `${protocol}://${hostname}:5173/login`
        // If it's ngrok, also set it
        if (hostname.includes('ngrok')) {
          this.ngrokLink = this.localNetworkLink
        }
      }
    },
    detectLocalIP() {
      return new Promise((resolve, reject) => {
        // Try WebRTC to get local IP
        const pc = new RTCPeerConnection({ iceServers: [] })
        pc.createDataChannel('')
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(reject)
        
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return
          const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/
          const match = ipRegex.exec(ice.candidate.candidate)
          if (match) {
            resolve(match[0])
            pc.close()
          }
        }
        
        // Timeout after 2 seconds
        setTimeout(() => {
          pc.close()
          reject(new Error('Timeout'))
        }, 2000)
      })
    },
    checkNgrokLink() {
      // Check if ngrok URL is available
      const hostname = window.location.hostname
      if (hostname.includes('ngrok-free.dev') || hostname.includes('ngrok.dev')) {
        this.ngrokLink = window.location.origin + '/login'
      }
    },
    openModal() {
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.copyMessage = ''
    },
    copyToClipboard(text, message) {
      navigator.clipboard.writeText(text).then(() => {
        this.copyMessage = message
        setTimeout(() => {
          this.copyMessage = ''
        }, 2000)
      })
    },
    getQRCodeUrl(url) {
      // Generate QR code URL using QR Server API
      if (!url) return ''
      const size = 300
      return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=10`
    },
    openTestOnMobile() {
      // Generate ngrok or local link
      const link = this.ngrokLink || this.localNetworkLink
      if (link) {
        window.open(link, '_blank')
      }
    }
  }
}
</script>

<style scoped>
.mobile-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 999;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.mobile-fab:active {
  transform: scale(0.95);
}

.mobile-link-overlay {
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
  padding: 16px;
}

.modal-content {
  background: #242442;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3em;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.link-section {
  margin-bottom: 24px;
}

.link-section h3 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 1.1em;
}

.description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  margin: 0 0 12px 0;
}

.link-box {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 8px;
}

.link-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  word-break: break-all;
}

.link-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.copy-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
}

.copy-btn:hover {
  transform: translateY(-2px);
}

.copy-btn:active {
  transform: translateY(0);
}

.hint {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8em;
  margin: 8px 0 0 0;
}

/* QR Code Styles */
.qr-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.qr-tab {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.qr-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

.qr-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.qr-code-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-image {
  width: 280px;
  height: 280px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
}

.qr-label {
  color: #333;
  font-weight: 600;
  font-size: 0.95em;
  margin: 0;
  text-align: center;
}

.info-box {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
}

.info-box h4 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 0.95em;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
}

.info-box li {
  padding: 4px 0;
}

.success-message {
  background: rgba(76, 175, 80, 0.2);
  color: #a5d6a7;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  margin: 12px 0;
}

.modal-footer {
  padding: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-close {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-test {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-test:hover {
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .mobile-fab {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .modal-content {
    margin: 0;
    border-radius: 12px;
  }

  .link-box {
    flex-direction: column;
  }

  .copy-btn {
    width: 100%;
  }

  .qr-code-container {
    padding: 12px;
    min-height: 270px;
  }

  .qr-image {
    width: 220px;
    height: 220px;
  }

  .qr-tabs {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-close,
  .btn-test {
    width: 100%;
  }
}
</style>
