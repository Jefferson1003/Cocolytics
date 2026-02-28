/**
 * Payment Routes
 * Handles order payment processing via PayMongo
 */

const express = require('express');
const router = express.Router();
const PayMongoService = require('../services/paymongoService');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

/**
 * POST /api/payments/create-source
 * Create a payment source for the current user
 */
router.post('/create-source', authenticateToken, async (req, res) => {
  try {
    const { type, amount, successUrl, failedUrl } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ error: 'Missing required fields: type, amount' });
    }

    // Amount must be in cents
    const amountInCents = Math.round(amount * 100);

    const sourceData = {
      type, // 'gcash', 'grab_pay', 'paymaya', 'dob'
      amount: amountInCents,
      successUrl: successUrl || `${process.env.FRONTEND_URL}/orders/payment-success`,
      failedUrl: failedUrl || `${process.env.FRONTEND_URL}/orders/payment-failed`
    };

    const source = await PayMongoService.createPaymentSource(sourceData);

    res.json({
      success: true,
      source: source.data
    });
  } catch (error) {
    console.error('Error creating payment source:', error);
    res.status(500).json({ error: 'Failed to create payment source' });
  }
});

/**
 * POST /api/payments/create-payment
 * Create a payment for an order
 */
router.post('/create-payment', authenticateToken, async (req, res) => {
  try {
    const { orderId, sourceId, amount, description } = req.body;
    const userId = req.user.id;

    if (!orderId || !sourceId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify order belongs to user
    const orderQuery = 'SELECT * FROM orders WHERE id = ? AND user_id = ?';
    const [order] = await db.query(orderQuery, [orderId, userId]);

    if (!order || order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const amountInCents = Math.round(amount * 100);

    const paymentData = {
      sourceId,
      amount: amountInCents,
      description: description || `Payment for Order #${orderId}`
    };

    const payment = await PayMongoService.createPayment(paymentData);

    // Save payment record to database
    const savePaymentQuery = `
      INSERT INTO payments (order_id, user_id, paymongo_payment_id, amount, status, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const paymentStatus = payment.data.attributes.status || 'pending';
    const paymentMethod = payment.data.attributes.source?.type || 'unknown';

    await db.query(savePaymentQuery, [
      orderId,
      userId,
      payment.data.id,
      amount,
      paymentStatus,
      paymentMethod
    ]);

    // Update order payment status
    const updateOrderQuery = 'UPDATE orders SET payment_status = ?, paymongo_payment_id = ? WHERE id = ?';
    await db.query(updateOrderQuery, [paymentStatus, payment.data.id, orderId]);

    res.json({
      success: true,
      payment: payment.data,
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

/**
 * GET /api/payments/:paymentId
 * Get payment status
 */
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PayMongoService.getPayment(paymentId);

    // Update local payment status
    const query = 'UPDATE payments SET status = ? WHERE paymongo_payment_id = ?';
    const status = payment.data.attributes.status || 'unknown';
    await db.query(query, [status, paymentId]);

    res.json({
      success: true,
      payment: payment.data
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({ error: 'Failed to retrieve payment' });
  }
});

/**
 * POST /api/payments/webhook
 * Handle PayMongo webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-paymongo-signature'];
    const payload = req.body.toString();

    // Verify webhook signature
    if (!PayMongoService.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(payload);
    const eventType = event.data.attributes?.type;

    if (eventType === 'payment.paid') {
      const paymentId = event.data.id;

      // Update payment status to paid
      const query = `
        UPDATE payments SET status = 'paid', paid_at = NOW() 
        WHERE paymongo_payment_id = ?
      `;
      await db.query(query, [paymentId]);

      // Update related order
      const paymentQuery = 'SELECT order_id FROM payments WHERE paymongo_payment_id = ?';
      const [payment] = await db.query(paymentQuery, [paymentId]);

      if (payment && payment.length > 0) {
        const updateOrderQuery = 'UPDATE orders SET payment_status = ?, paid_at = NOW() WHERE id = ?';
        await db.query(updateOrderQuery, ['paid', payment[0].order_id]);
      }
    } else if (eventType === 'payment.failed') {
      const paymentId = event.data.id;

      const query = 'UPDATE payments SET status = ?, failed_at = NOW() WHERE paymongo_payment_id = ?';
      await db.query(query, ['failed', paymentId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/orders/:orderId/payment-status
 * Get payment status for an order
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT p.*, o.total_amount 
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE p.order_id = ? AND p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT 1
    `;

    const [payment] = await db.query(query, [orderId, userId]);

    if (!payment || payment.length === 0) {
      return res.status(404).json({ error: 'No payment found for this order' });
    }

    res.json({
      success: true,
      payment: payment[0]
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Failed to retrieve payment status' });
  }
});

module.exports = router;
