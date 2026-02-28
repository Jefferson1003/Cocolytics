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
          <div class="form-group">
            <label>GCash Phone Number</label>
            <input 
              v-model="phoneNumber"
              type="text"
              placeholder="09xxxxxxxxx"
              class="form-input"
            />
            <small>Payment link will be sent to your GCash account</small>
          </div>
        </div>

        <!-- GrabPay Payment -->
        <div v-if="selectedMethod === 'grab_pay'" class="payment-form">
          <div class="form-group">
            <label>Grab Account Phone Number</label>
            <input 
              v-model="phoneNumber"
              type="text"
              placeholder="09xxxxxxxxx"
              class="form-input"
            />
            <small>Payment link will be sent to your Grab app</small>
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

        <!-- Card Payment -->
        <div v-if="selectedMethod === 'card'" class="payment-form">
          <div class="form-group">
            <label>Card Details</label>
            <div class="card-inputs">
              <input 
                v-model="cardNumber"
                type="text"
                placeholder="4111 1111 1111 1111"
                @blur="formatCardNumber"
                class="form-input card-number"
                maxlength="19"
              />
              <div class="card-row">
                <input 
                  v-model="cardExpiry"
                  type="text"
                  placeholder="MM/YY"
                  @blur="formatExpiry"
                  class="form-input"
                  maxlength="5"
                />
                <input 
                  v-model="cardCVC"
                  type="text"
                  placeholder="CVC"
                  class="form-input"
                  maxlength="4"
                />
              </div>
            </div>
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
          {{ isProcessing ? '⏳ Processing...' : '💳 Pay Now' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
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
        { value: 'grab_pay', name: 'GrabPay', icon: '🚗' },
        { value: 'paymaya', name: 'PayMaya', icon: '💳' },
        { value: 'card', name: 'Card', icon: '🏧' }
      ],
      phoneNumber: '',
      emailAddress: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
      agreedToTerms: false,
      isProcessing: false,
      errorMessage: ''
    }
  },
  computed: {
    canProceed() {
      if (!this.agreedToTerms) return false
      
      switch (this.selectedMethod) {
        case 'gcash':
        case 'grab_pay':
          return this.phoneNumber.length >= 10
        case 'paymaya':
          return this.emailAddress.includes('@')
        case 'card':
          return this.cardNumber.length >= 16 && this.cardExpiry && this.cardCVC.length >= 3
        default:
          return false
      }
    }
  },
  methods: {
    async processPayment() {
      this.errorMessage = ''
      this.isProcessing = true

      try {
        // Step 1: Create payment source
        let sourceData = {
          type: this.selectedMethod,
          amount: this.totalAmount + this.deliveryFee
        }

        // Add phone or email based on method
        if (['gcash', 'grab_pay'].includes(this.selectedMethod)) {
          sourceData.phone = this.phoneNumber
        } else if (this.selectedMethod === 'paymaya') {
          sourceData.email = this.emailAddress
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
          redirectUrl: paymentResult.payment.attributes.redirect?.checkout_url
        })

        // Redirect to payment provider if needed
        if (paymentResult.payment.attributes.redirect?.checkout_url) {
          window.location.href = paymentResult.payment.attributes.redirect.checkout_url
        }

        this.closeModal()
      } catch (error) {
        console.error('Payment error:', error)
        this.errorMessage = error.message || 'Payment processing failed. Please try again.'
      } finally {
        this.isProcessing = false
      }
    },
    formatCardNumber() {
      this.cardNumber = this.cardNumber
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
    },
    formatExpiry() {
      this.cardExpiry = this.cardExpiry
        .replace(/\D/g, '')
        .replace(/(.{2})/, '$1/')
        .slice(0, 5)
    },
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    resetForm() {
      this.selectedMethod = 'gcash'
      this.phoneNumber = ''
      this.emailAddress = ''
      this.cardNumber = ''
      this.cardExpiry = ''
      this.cardCVC = ''
      this.agreedToTerms = false
      this.errorMessage = ''
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
</style>
