<template>
  <div class="payment-modal-overlay" v-if="isOpen" @click="closeModal">
    <div class="payment-modal" @click.stop>
      <div class="modal-header">
        <h2>💳 Payment for Order #{{ orderId }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Details</h3>
          <div class="summary-items">
            <div class="summary-row">
              <span>Order Amount:</span>
              <span class="amount">₱{{ formatPrice(totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee:</span>
              <span class="amount">₱{{ formatPrice(deliveryFee) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total Amount:</span>
              <span class="amount">₱{{ formatPrice(totalAmount + deliveryFee) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="payment-methods">
          <h3>Select Payment Method</h3>
          <div class="methods-grid">
            <button 
              v-for="method in paymentMethods" 
              :key="method.value"
              @click="selectedMethod = method.value"
              :class="['method-btn', { active: selectedMethod === method.value }]"
            >
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-name">{{ method.name }}</span>
            </button>
          </div>
        </div>

        <!-- GCash Payment -->
        <div v-if="selectedMethod === 'gcash'" class="payment-form">
          <div v-if="!gcashQrCode" class="form-group">
            <button 
              @click="generateGcashCode"
              class="btn btn-generate"
              :disabled="isProcessing"
            >
              📲 Generate GCash QR Code
            </button>
            <small>Click to generate a QR code you can scan with GCash app</small>
          </div>
          <div v-else class="qr-code-section">
            <p class="qr-instruction">📱 Scan this QR code with your GCash app to pay</p>
            <div class="qr-display">
              <img :src="gcashQrCode" alt="GCash QR Code" class="qr-image" />
            </div>
            <button 
              @click="resetGcashCode"
              class="btn btn-reset"
            >
              Generate New Code
            </button>
          </div>
        </div>

        <!-- PayMaya Payment -->
        <div v-if="selectedMethod === 'paymaya'" class="payment-form">
          <div class="form-group">
            <label>Email Address</label>
            <input 
              v-model="emailAddress"
              type="email"
              placeholder="your@email.com"
              class="form-input"
            />
            <small>Payment link will be sent to your email</small>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="terms">
          <label class="checkbox">
            <input v-model="agreedToTerms" type="checkbox" />
            <span>I agree to the payment terms and conditions</span>
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          ⚠️ {{ errorMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="isProcessing" class="loading-state">
          <div class="spinner"></div>
          <p>Processing your payment...</p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary">Cancel</button>
        <button 
          @click="processPayment" 
          class="btn btn-primary"
          :disabled="!canProceed || isProcessing"
        >
          <template v-if="selectedMethod === 'gcash' && gcashQrCode">
            {{ isProcessing ? '⏳ Processing...' : '✓ Confirm Payment' }}
          </template>
          <template v-else-if="selectedMethod === 'paymaya'">
            {{ isProcessing ? '⏳ Processing...' : '💳 Pay with PayMaya' }}
          </template>
          <template v-else>
            {{ isProcessing ? '⏳ Processing...' : '💳 Pay Now' }}
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'PaymentModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    token: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedMethod: 'gcash',
      paymentMethods: [
        { value: 'gcash', name: 'GCash', icon: '📱' },
        { value: 'paymaya', name: 'PayMaya', icon: '💳' }
      ],
      phoneNumber: '',
      emailAddress: '',
      agreedToTerms: false,
      isProcessing: false,
      errorMessage: '',
      gcashQrCode: null,
      gcashSourceId: null
    }
  },
  computed: {
    canProceed() {
      if (!this.agreedToTerms) return false
      
      if (this.selectedMethod === 'gcash') {
        // For GCash, need to have generated a QR code
        return this.gcashQrCode !== null
      } else if (this.selectedMethod === 'paymaya') {
        return this.emailAddress.includes('@')
      }
      return false
    }
  },
  methods: {
    async generateGcashCode() {
      this.errorMessage = ''
      this.isProcessing = true

      try {
        // Create payment source for GCash
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-source`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'gcash',
            amount: this.totalAmount + this.deliveryFee
          })
        })

        if (!response.ok) {
          throw new Error('Failed to generate GCash code')
        }

        const result = await response.json()
        const sourceData = result.source

        // Extract checkout URL
        const checkoutUrl = sourceData.attributes.checkout_url
        this.gcashSourceId = sourceData.id

        // Generate QR code image from checkout URL
        const qrCodeDataUrl = await QRCode.toDataURL(checkoutUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        this.gcashQrCode = qrCodeDataUrl
        
        // Emit QR code generated event
        this.$emit('qr-generated', {
          sourceId: this.gcashSourceId,
          checkoutUrl: checkoutUrl,
          qrCodeImage: qrCodeDataUrl
        })
      } catch (error) {
        console.error('GCash code generation error:', error)
        this.errorMessage = error.message || 'Failed to generate GCash code. Please try again.'
      } finally {
        this.isProcessing = false
      }
    },
    resetGcashCode() {
      this.gcashQrCode = null
      this.gcashSourceId = null
    },
    async processPayment() {
      this.errorMessage = ''
      this.isProcessing = true

      try {
        if (this.selectedMethod === 'gcash' && this.gcashSourceId) {
          // For GCash, use the source already generated
          // Create payment with the GCash source
          const paymentResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-payment`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: this.orderId,
              sourceId: this.gcashSourceId,
              amount: this.totalAmount + this.deliveryFee,
              description: `Payment for Order #${this.orderId}`
            })
          })

          if (!paymentResponse.ok) {
            throw new Error('Failed to create payment')
          }

          const paymentResult = await paymentResponse.json()

          this.$emit('payment-success', {
            paymentId: paymentResult.payment.id,
            status: paymentResult.payment.attributes.status,
            method: 'gcash'
          })

          this.closeModal()
        } else if (this.selectedMethod === 'paymaya') {
          // For PayMaya, create source and payment
          let sourceData = {
            type: 'paymaya',
            amount: this.totalAmount + this.deliveryFee,
            email: this.emailAddress
          }

          const sourceResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-source`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sourceData)
          })

          if (!sourceResponse.ok) {
            throw new Error('Failed to create payment source')
          }

          const sourceResult = await sourceResponse.json()
          const sourceId = sourceResult.source.id

          // Step 2: Create payment
          const paymentResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-payment`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: this.orderId,
              sourceId,
              amount: this.totalAmount + this.deliveryFee,
              description: `Payment for Order #${this.orderId}`
            })
          })

          if (!paymentResponse.ok) {
            throw new Error('Failed to create payment')
          }

          const paymentResult = await paymentResponse.json()

          // Emit success event
          this.$emit('payment-success', {
            paymentId: paymentResult.payment.id,
            status: paymentResult.payment.attributes.status,
            redirectUrl: paymentResult.payment.attributes.redirect?.checkout_url,
            method: 'paymaya'
          })

          // Redirect to payment provider if needed
          if (paymentResult.payment.attributes.redirect?.checkout_url) {
            window.location.href = paymentResult.payment.attributes.redirect.checkout_url
          }

          this.closeModal()
        }
      } catch (error) {
        console.error('Payment error:', error)
        this.errorMessage = error.message || 'Payment processing failed. Please try again.'
      } finally {
        this.isProcessing = false
      }
    },
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    resetForm() {
      this.selectedMethod = 'gcash'
      this.phoneNumber = ''
      this.emailAddress = ''
      this.agreedToTerms = false
      this.errorMessage = ''
      this.gcashQrCode = null
      this.gcashSourceId = null
    },
    formatPrice(price) {
      return parseFloat(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })
    }
  }
}
</script>

<style scoped>
.payment-modal-overlay {
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

.payment-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
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
  font-size: 1.5em;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Order Summary */
.order-summary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.order-summary h3 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 0.95em;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

.summary-row.total {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  color: white;
  font-weight: 600;
}

.summary-row .amount {
  color: #667eea;
  font-weight: 600;
}

.summary-row.total .amount {
  color: #4caf50;
  font-size: 1.05em;
}

/* Payment Methods */
.payment-methods {
  margin-bottom: 24px;
}

.payment-methods h3 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 0.95em;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.method-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  color: rgba(255, 255, 255, 0.7);
}

.method-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.method-btn.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-color: #667eea;
  color: white;
}

.method-icon {
  font-size: 1.5em;
}

.method-name {
  font-size: 0.85em;
  font-weight: 600;
}

/* Payment Form */
.payment-form {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.9em;
}

.form-group small {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8em;
}

.form-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.95em;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.card-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* Terms */
.terms {
  margin-bottom: 20px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
  cursor: pointer;
}

.checkbox input {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

/* Messages */
.error-message {
  background: rgba(244, 67, 54, 0.2);
  border-left: 3px solid #f44336;
  color: #f44336;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.9em;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Buttons */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.3s;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .payment-modal {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 100vh;
  }

  .methods-grid {
    grid-template-columns: 1fr;
  }

  .card-row {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}

/* QR Code Styles */
.qr-code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.qr-instruction {
  color: #e0e0e0;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

.qr-display {
  width: 100%;
  max-width: 300px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.qr-image {
  width: 100%;
  height: auto;
  display: block;
}

.btn-generate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reset {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid #667eea;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: rgba(102, 126, 234, 0.3);
}

</style>
