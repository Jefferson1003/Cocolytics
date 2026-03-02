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

// Check if we're in test mode (using placeholder or demo credentials)
const isTestMode = !PAYMONGO_SECRET_KEY || 
                   PAYMONGO_SECRET_KEY.includes('placeholder') || 
                   PAYMONGO_SECRET_KEY.includes('your_secret_key_here') ||
                   PAYMONGO_SECRET_KEY === 'sk_test_placeholder';

if (isTestMode) {
  console.log('⚠️  PayMongo TEST MODE - Using mock payment responses');
  console.log('📝 To use real PayMongo:');
  console.log('   1. Go to https://dashboard.paymongo.com/developers');
  console.log('   2. Copy your API keys');
  console.log('   3. Update .env file with real keys');
} else {
  console.log('✅ PayMongo LIVE MODE - Using real API');
}

class PayMongoService {
  /**
   * Create a payment source (payment method)
   */
  static async createPaymentSource(sourceData) {
    try {
      // In test mode, generate a mock payment source
      if (isTestMode) {
        console.log('🧪 TEST MODE: Generating mock payment source for:', sourceData.type);
        return this.generateMockPaymentSource(sourceData);
      }

      console.log('💳 Creating PayMongo payment source:', sourceData.type);
      
      const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${paymongoAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: sourceData.type, // 'gcash', 'paymaya'
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
        const errorData = await response.json().catch(() => ({}));
        console.error('PayMongo API Error:', errorData);
        throw new Error(`PayMongo API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment source created:', result.data.id);
      return result;
    } catch (error) {
      console.error('❌ PayMongo createPaymentSource error:', error);
      throw error;
    }
  }

  /**
   * Generate mock payment source for testing
   */
  static generateMockPaymentSource(sourceData) {
    const sourceId = `src_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockData = {
      data: {
        id: sourceId,
        type: 'source',
        attributes: {
          type: sourceData.type,
          amount: sourceData.amount,
          currency: 'PHP',
          status: 'pending',
          redirect: {
            checkout_url: `${process.env.FRONTEND_URL}/test-payment?source=${sourceId}&type=${sourceData.type}&amount=${(sourceData.amount/100).toFixed(2)}`
          }
        }
      }
    };
    
    console.log('🧪 Mock payment source created:', sourceId);
    return mockData;
  }

  /**
   * Create a payment from a source
   */
  static async createPayment(paymentData) {
    try {
      // In test mode, generate a mock payment
      if (isTestMode) {
        console.log('🧪 TEST MODE: Generating mock payment for source:', paymentData.sourceId);
        return this.generateMockPayment(paymentData);
      }

      console.log('💳 Creating PayMongo payment for source:', paymentData.sourceId);

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
        const errorData = await response.json().catch(() => ({}));
        console.error('PayMongo API Error:', errorData);
        throw new Error(`PayMongo API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment created:', result.data.id);
      return result;
    } catch (error) {
      console.error('❌ PayMongo createPayment error:', error);
      throw error;
    }
  }

  /**
   * Generate mock payment for testing
   */
  static generateMockPayment(paymentData) {
    const paymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockData = {
      data: {
        id: paymentId,
        type: 'payment',
        attributes: {
          amount: paymentData.amount,
          currency: 'PHP',
          status: 'pending',
          source: {
            id: paymentData.sourceId,
            type: 'source'
          },
          description: paymentData.description,
          statement_descriptor: 'COCOLYTICS ORDER'
        }
      }
    };
    
    console.log('🧪 Mock payment created:', paymentId);
    return mockData;
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
