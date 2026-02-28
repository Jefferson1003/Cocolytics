/**
 * PayMongo Payment Integration
 * Handles payment processing for deliveries and orders
 */

const crypto = require('crypto');

// PayMongo Configuration
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Base64 encode credentials for PayMongo API
const paymongoAuth = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64');

class PayMongoService {
  /**
   * Create a payment source (payment method)
   */
  static async createPaymentSource(sourceData) {
    try {
      const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${paymongoAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: sourceData.type, // 'gcash', 'grab_pay', 'paymaya', 'dob'
              amount: sourceData.amount, // in cents
              currency: 'PHP',
              redirect: {
                success: sourceData.successUrl,
                failed: sourceData.failedUrl
              }
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`PayMongo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayMongo createPaymentSource error:', error);
      throw error;
    }
  }

  /**
   * Create a payment from a source
   */
  static async createPayment(paymentData) {
    try {
      const response = await fetch(`${PAYMONGO_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${paymongoAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: paymentData.amount, // in cents
              currency: 'PHP',
              source: {
                id: paymentData.sourceId,
                type: 'source'
              },
              description: paymentData.description || 'Order Payment',
              statement_descriptor: 'COCOLYTICS ORDER'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`PayMongo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayMongo createPayment error:', error);
      throw error;
    }
  }

  /**
   * Retrieve payment details
   */
  static async getPayment(paymentId) {
    try {
      const response = await fetch(`${PAYMONGO_API_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${paymongoAuth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`PayMongo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayMongo getPayment error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha256', PAYMONGO_SECRET_KEY)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Create a webhook for payment events
   */
  static async createWebhook(webhookData) {
    try {
      const response = await fetch(`${PAYMONGO_API_URL}/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${paymongoAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            attributes: {
              url: webhookData.url,
              events: webhookData.events // ['payment.paid', 'source.chargeable', 'payment.failed']
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`PayMongo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayMongo createWebhook error:', error);
      throw error;
    }
  }
}

module.exports = PayMongoService;
