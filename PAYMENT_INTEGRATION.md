# Payment Modal Integration Guide

## Quick Start - Integrating PaymentModal into OrderTracking

### Step 1: Import PaymentModal Component

In your `OrderTracking.vue` (or any component that needs payments):

```javascript
import PaymentModal from '../components/PaymentModal.vue'

// Add to components
components: {
  StaffSidebar,
  PaymentModal
}
```

### Step 2: Add Payment Modal Data

In your component's `data()` method:

```javascript
data() {
  return {
    // ...existing data...
    showPaymentModal: false,
    selectedOrderForPayment: null,
    paymentAmount: 0,
    deliveryFee: 50, // Set your delivery fee
    token: localStorage.getItem('token')
  }
}
```

### Step 3: Add Modal to Template

In your template (OrderTracking.vue):

```html
<!-- Add this inside your component -->
<PaymentModal
  :isOpen="showPaymentModal"
  :orderId="selectedOrderForPayment?.id"
  :totalAmount="selectedOrderForPayment?.total_amount"
  :deliveryFee="deliveryFee"
  :token="token"
  @close="showPaymentModal = false"
  @payment-success="handlePaymentSuccess"
/>
```

### Step 4: Add Payment Button

In your order card/display:

```html
<div class="order-actions">
  <!-- ...existing buttons... -->
  
  <button 
    v-if="order.payment_status !== 'paid'"
    @click="openPaymentModal(order)"
    class="btn btn-payment"
  >
    💳 Pay Now
  </button>
  
  <span v-else class="status-paid">✓ Paid</span>
</div>
```

### Step 5: Add Methods

In your component's `methods`:

```javascript
methods: {
  openPaymentModal(order) {
    this.selectedOrderForPayment = order
    this.paymentAmount = order.total_amount
    this.showPaymentModal = true
  },

  handlePaymentSuccess(paymentData) {
    this.$emit('payment-completed', paymentData)
    // Show success message
    this.successMessage = `✓ Payment of ₱${this.paymentAmount} received!`
    // Refresh orders to update payment status
    this.loadOrders()
    setTimeout(() => {
      this.successMessage = ''
    }, 3000)
  }
}
```

### Step 6: Add Styling

```css
.btn-payment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-payment:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.status-paid {
  color: #4caf50;
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 6px;
}
```

## Complete Example - OrderTracking.vue Integration

```vue
<template>
  <div class="staff-layout">
    <StaffSidebar />
    <div class="tracking-main">
      <!-- ...existing tracking content... -->

      <!-- Order Cards with Payment -->
      <div class="orders-grid">
        <div v-for="order in activeOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <h3>Order #{{ order.id }}</h3>
            <span :class="['status-badge', order.status]">
              {{ formatStatus(order.status) }}
            </span>
          </div>
          <div class="order-details">
            <p>{{ order.size }} - {{ order.length }}cm × {{ order.quantity }}</p>
            <p>₱{{ formatPrice(order.total_amount) }}</p>
          </div>
          <div class="order-actions">
            <button 
              v-if="order.payment_status !== 'paid'"
              @click="openPaymentModal(order)"
              class="btn btn-payment"
            >
              💳 Pay Now
            </button>
            <span v-else class="status-paid">✓ Paid</span>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <PaymentModal
        :isOpen="showPaymentModal"
        :orderId="selectedOrderForPayment?.id"
        :totalAmount="selectedOrderForPayment?.total_amount"
        :deliveryFee="deliveryFee"
        :token="token"
        @close="showPaymentModal = false"
        @payment-success="handlePaymentSuccess"
      />

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'
import PaymentModal from '../components/PaymentModal.vue'

export default {
  name: 'OrderTracking',
  components: {
    StaffSidebar,
    PaymentModal
  },
  data() {
    return {
      activeOrders: [],
      showPaymentModal: false,
      selectedOrderForPayment: null,
      deliveryFee: 50,
      token: localStorage.getItem('token'),
      successMessage: ''
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/buyer/orders`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        if (!response.ok) throw new Error('Failed')
        this.activeOrders = await response.json()
      } catch (error) {
        console.error('Error:', error)
      }
    },
    openPaymentModal(order) {
      this.selectedOrderForPayment = order
      this.showPaymentModal = true
    },
    handlePaymentSuccess(paymentData) {
      this.successMessage = `✓ Payment successful! Tracking Number: ${paymentData.paymentId.slice(-6)}`
      this.showPaymentModal = false
      this.loadOrders() // Refresh to show updated payment status
      setTimeout(() => {
        this.successMessage = ''
      }, 5000)
    },
    formatPrice(price) {
      return parseFloat(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })
    },
    formatStatus(status) {
      const map = {
        'pending': 'Pending',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'completed': 'Completed'
      }
      return map[status] || status
    }
  }
}
</script>

<style scoped>
/* ...existing styles... */

.btn-payment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-payment:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.status-paid {
  color: #4caf50;
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 6px;
  display: inline-block;
}

.alert-success {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 12px;
}
</style>
```

## Available Payment Methods

The PaymentModal supports 4 payment methods:

1. **GCash** 📱
   - Requires: Philippine mobile number
   - Format: 09XXXXXXXXX

2. **GrabPay** 🚗
   - Requires: Grab registered phone number
   - Format: 09XXXXXXXXX

3. **PayMaya** 💳
   - Requires: Email address
   - Format: valid@email.com

4. **Card Payment** 🏧
   - Requires: Card number, expiry, CVC
   - Supports: Visa, Mastercard, JCB

## Testing Payment Flow

### Test with GCash
1. Click "Pay Now"
2. Select GCash
3. Enter: 09171234567
4. Click "Pay Now"
5. You'll be redirected to GCash payment page
6. Use test credentials provided by PayMongo

### Test with Card
1. Click "Pay Now"
2. Select Card
3. Enter test card: 4111 1111 1111 1111
4. Expiry: any future date (e.g., 12/25)
5. CVC: any 3 digits (e.g., 123)
6. Click "Pay Now"

## Handling Payment Responses

When payment is successful, the `@payment-success` event emits:

```javascript
{
  paymentId: "pay_xxx...",
  status: "paid" | "pending" | "chargeable",
  redirectUrl: "https://..." // If applicable
}
```

## Storing Payment Information

The backend automatically saves payment info to the `payments` table:
- Payment ID
- Order ID
- Amount
- Status
- Payment method
- Timestamp

## Security Features

✅ **Implemented:**
- HTTPS required
- Webhook signature verification
- Payment status validation
- Secret key encryption
- PCI DSS compliance via PayMongo

## Next Steps

1. Install PayMongo npm package (optional)
2. Set environment variables
3. Run database migrations
4. Add PaymentModal to your components
5. Test with test credentials
6. Deploy to production with live keys

## API Endpoints Used

- `POST /api/payments/create-source` - Create payment source
- `POST /api/payments/create-payment` - Process payment
- `GET /api/payments/:paymentId` - Get payment status
- `POST /api/payments/webhook` - Handle payment events
- `GET /api/orders/:orderId/payment-status` - Get order payment status

---

For more help, see [PAYMONGO_SETUP.md](./PAYMONGO_SETUP.md)
