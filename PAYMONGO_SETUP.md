# PayMongo Integration Guide

## Overview
This guide explains how to set up PayMongo payment processing for the Cocolytics order delivery system.

## Setup Steps

### 1. Register with PayMongo
- Visit https://paymongo.com/
- Sign up for a business account
- Verify your email and business details
- Complete KYC requirements

### 2. Get API Keys
After account setup:
1. Log in to PayMongo Dashboard
2. Go to **Developers** → **API Keys**
3. Copy your:
   - **Public Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

⚠️ **Important:** Keep your Secret Key confidential!

### 3. Environment Variables

#### Backend (.env)
```
PAYMONGO_PUBLIC_KEY=pk_your_public_key_here
PAYMONGO_SECRET_KEY=sk_your_secret_key_here
PAYMONGO_API_URL=https://api.paymongo.com/v1
FRONTEND_URL=http://localhost:5173  # or your production URL
```

#### Frontend (.env)
```
VITE_PAYMONGO_PUBLIC_KEY=pk_your_public_key_here
VITE_API_BASE_URL=http://localhost:3000  # Your backend URL
```

### 4. Database Setup

Run the migration files:
```bash
# 1. Apply shipping migration
mysql -u root -p cocolytics < backend/shipping-migration.sql

# 2. Apply payment migration
mysql -u root -p cocolytics < backend/payment-migration.sql
```

### 5. Backend Setup

Add PayMongo service to your server:

```javascript
// In your main server file (server.js)
const paymentRoutes = require('./routes/payment');

app.use('/api/payments', paymentRoutes);
```

### 6. Payment Methods Available

#### E-Wallet Payments
- **GCash** - Philippine mobile money (requires phone number)
- **GrabPay** - Grab app payments (requires phone number)
- **PayMaya** - PayMaya wallet (requires email)

#### Card Payments
- Visa, Mastercard, JCB via card payment

### 7. Payment Flow

**For Buyers:**
1. View order with payment option
2. Click "Pay Now" button
3. Select payment method (GCash, GrabPay, PayMaya, Card)
4. Enter payment details
5. Click "Pay Now"
6. Redirected to payment provider
7. Complete payment authentication
8. Returned to app with payment confirmation

**For Dashboard:**
- Track payment status real-time
- View payment history per order
- Process refunds if needed

### 8. Webhook Configuration

PayMongo will send payment events to your webhook endpoint:

```
POST /api/payments/webhook
```

To set up webhooks in PayMongo Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click **Create Webhook**
3. Enter webhook URL:
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. Select events:
   - `payment.paid`
   - `payment.failed`
   - `source.chargeable`
5. Click Create

### 9. Testing

#### Test Payment Methods
- **GCash**: 09171234567
- **GrabPay**: 09171234567
- **PayMaya**: test@email.com
- **Card**: Use test cards (provided by PayMongo)

#### Test Card Numbers
- Visa: `4111 1111 1111 1111`
- Mastercard: `5555 5555 5555 4444`
- Any expiry/CVC in the future

### 10. Payment Status Workflow

```
Payment Created
    ↓
pending → (awaiting payment)
    ↓
chargeable → (ready for charge)
    ↓
paid ✓ (payment successful)
    
OR

failed → (payment declined)
expired → (payment link expired)
```

### 11. Security Best Practices

1. **Never expose Secret Key**: Use only in backend
2. **HTTPS only**: Always use HTTPS in production
3. **Validate amounts**: Verify amounts server-side
4. **PCI Compliance**: Use PayMongo's hosted payment forms
5. **Webhook verification**: Always verify webhook signatures

### 12. Refund Process

To process a refund:

```javascript
POST /api/payments/refund
{
  "paymentId": "pay_xxx",
  "amount": 500.00,
  "reason": "Customer requested refund"
}
```

### 13. Testing Checklist

- [ ] API keys configured correctly
- [ ] Database tables created
- [ ] Payment routes active
- [ ] Frontend PaymentModal component integrated
- [ ] Test payment with GCash
- [ ] Test payment with GrabPay
- [ ] Test payment with PayMaya
- [ ] Webhook receiving events
- [ ] Payment status updating in database
- [ ] Refund functionality working

### 14. Support & Documentation

- **PayMongo Docs**: https://developers.paymongo.com/
- **PayMongo API Reference**: https://developers.paymongo.com/api/
- **Status Page**: https://status.paymongo.com/
- **Support**: support@paymongo.com

### 15. Integration Checklist

**Backend:**
- ✅ PayMongoService created
- ✅ Payment routes created
- ✅ Database migrations prepared
- ✅ Webhook handler implemented

**Frontend:**
- ✅ PaymentModal component created
- ✅ Multiple payment methods supported
- ✅ Payment status tracking
- ✅ Error handling

**Next Steps:**
1. Set environment variables
2. Run database migrations
3. Test payment flow
4. Deploy to production
5. Monitor payment transactions

## Pricing

PayMongo charges per transaction:
- **E-Wallet**: 2% of transaction
- **Cards**: 2.9% + ₱5 per transaction
- **Bank Transfer**: Custom rates

For more details: https://paymongo.com/pricing

## Additional Notes

- Minimum transaction: ₱1.00
- Maximum transaction: Based on issuer limits
- Settlement: Within 3-5 business days
- Supports recurring/subscription payments
- Real-time reconciliation available

---

**Last Updated**: February 28, 2026
**Version**: 1.0
