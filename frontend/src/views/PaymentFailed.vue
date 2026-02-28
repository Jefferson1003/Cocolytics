<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="payment-result-page">
      <div class="result-card failed">
        <div class="icon-container">
          <div class="failed-icon">✕</div>
        </div>
        <h1>Payment Failed</h1>
        <p class="message">We couldn't process your payment. Please try again.</p>
        
        <div class="error-details" v-if="errorMessage">
          <p><strong>Error:</strong> {{ errorMessage }}</p>
        </div>

        <div class="info-box warning">
          <p><strong>⚠️ Don't worry!</strong></p>
          <p>Your order has been saved but not confirmed. No charges were made to your account.</p>
          <p>You can try paying again or choose a different payment method.</p>
        </div>

        <div class="actions">
          <button @click="retryPayment" class="btn btn-primary">
            <span class="icon">🔄</span> Retry Payment
          </button>
          <router-link to="/cart" class="btn btn-secondary">
            <span class="icon">🛒</span> Back to Cart
          </router-link>
          <router-link to="/my-orders" class="btn btn-tertiary">
            <span class="icon">📦</span> View Orders
          </router-link>
        </div>

        <div class="help-box">
          <h3>Need Help?</h3>
          <p>Contact our support team:</p>
          <p><strong>📧 support@cocolytics.com</strong></p>
          <p><strong>📱 +63 912 345 6789</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'PaymentFailed',
  components: {
    StaffSidebar
  },
  data() {
    return {
      errorMessage: ''
    }
  },
  mounted() {
    // Get error details from query params if available
    const urlParams = new URLSearchParams(window.location.search)
    this.errorMessage = urlParams.get('error') || 'Payment was not completed'
  },
  methods: {
    retryPayment() {
      // Go back to orders and try again
      this.$router.push('/my-orders')
    }
  }
}
</script>

<style scoped>
.staff-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 60px;
}

.payment-result-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.result-card {
  background: rgba(36, 36, 66, 0.95);
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.icon-container {
  margin-bottom: 24px;
}

.failed-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: bold;
  margin: 0 auto;
  animation: failedShake 0.6s ease-out;
  box-shadow: 0 0 30px rgba(231, 76, 60, 0.4);
}

@keyframes failedShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

h1 {
  color: #e74c3c;
  font-size: 2em;
  margin: 20px 0 12px;
}

.message {
  color: #ccc;
  font-size: 1.1em;
  margin-bottom: 24px;
}

.error-details {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #ff6b6b;
}

.info-box {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #ffc107;
}

.info-box p {
  margin: 8px 0;
  font-size: 0.95em;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.btn {
  padding: 14px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-secondary:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.btn-tertiary {
  background: rgba(255, 255, 255, 0.05);
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-tertiary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.help-box {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 20px;
  color: #fff;
}

.help-box h3 {
  margin: 0 0 12px;
  color: #4CAF50;
  font-size: 1.1em;
}

.help-box p {
  margin: 6px 0;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .result-card {
    padding: 32px 24px;
  }
}
</style>
