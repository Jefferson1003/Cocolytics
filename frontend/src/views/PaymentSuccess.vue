<template>
  <div class="staff-layout">
    <StaffSidebar />

    <div class="payment-result-page">
      <div class="result-card success">
        <div class="icon-container">
          <div class="success-icon">✓</div>
        </div>
        <h1>Payment Successful!</h1>
        <p class="message">Your payment has been processed successfully.</p>
        
        <div class="details" v-if="paymentDetails">
          <div class="detail-row">
            <span class="label">Payment Method:</span>
            <strong>{{ paymentDetails.method }}</strong>
          </div>
          <div class="detail-row">
            <span class="label">Amount Paid:</span>
            <strong class="amount">₱{{ paymentDetails.amount }}</strong>
          </div>
          <div class="detail-row">
            <span class="label">Transaction Date:</span>
            <strong>{{ paymentDetails.date }}</strong>
          </div>
        </div>

        <div class="actions">
          <router-link to="/my-orders" class="btn btn-primary">
            <span class="icon">📦</span> View My Orders
          </router-link>
          <router-link to="/sellers" class="btn btn-secondary">
            <span class="icon">🛍️</span> Continue Shopping
          </router-link>
        </div>

        <div class="info-box">
          <p><strong>📧 Confirmation sent!</strong></p>
          <p>Order confirmation and receipt have been sent to your email.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'PaymentSuccess',
  components: {
    StaffSidebar
  },
  data() {
    return {
      paymentDetails: null
    }
  },
  mounted() {
    // Get payment details from query params if available
    const urlParams = new URLSearchParams(window.location.search)
    
    this.paymentDetails = {
      method: urlParams.get('method') || 'E-Wallet',
      amount: urlParams.get('amount') || '0.00',
      date: new Date().toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Auto-redirect after 10 seconds
    setTimeout(() => {
      this.$router.push('/my-orders')
    }, 10000)
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
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.icon-container {
  margin-bottom: 24px;
}

.success-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: bold;
  margin: 0 auto;
  animation: successPulse 0.6s ease-out;
  box-shadow: 0 0 30px rgba(76, 175, 80, 0.4);
}

@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

h1 {
  color: #4CAF50;
  font-size: 2em;
  margin: 20px 0 12px;
}

.message {
  color: #ccc;
  font-size: 1.1em;
  margin-bottom: 32px;
}

.details {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #999;
}

.detail-row .amount {
  color: #4CAF50;
  font-size: 1.3em;
}

.actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  min-width: 200px;
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

.info-box {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 16px;
  color: #4CAF50;
}

.info-box p {
  margin: 4px 0;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .result-card {
    padding: 32px 24px;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    min-width: 100%;
  }
}
</style>
