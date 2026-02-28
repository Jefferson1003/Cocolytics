/**
 * Cocolumber Price Prediction System
 * Calculates predicted price based on size, length, and quality
 */

class CocolumberPricing {
  /**
   * Calculate predicted price for a cocolumber product
   * Base prices vary by size category and length
   */
  static calculatePrice(product) {
    // Base price per cm for different sizes (PHP)
    const baseGradePrices = {
      'Small': { base: 15, perCm: 1.2, minLength: 12, maxLength: 16 },
      'Medium': { base: 20, perCm: 1.5, minLength: 17, maxLength: 22 },
      'Large': { base: 35, perCm: 1.8, minLength: 23, maxLength: 26 },
      'Extra Large': { base: 50, perCm: 2.0, minLength: 27, maxLength: 32 },
      'Premium Large': { base: 40, perCm: 1.9, minLength: 23, maxLength: 26 },
      'Premium XL': { base: 55, perCm: 2.1, minLength: 27, maxLength: 32 },
      'Organic Large': { base: 45, perCm: 1.95, minLength: 23, maxLength: 26 },
      'Organic XL': { base: 60, perCm: 2.2, minLength: 27, maxLength: 32 },
      'Organic Jumbo': { base: 70, perCm: 2.3, minLength: 27, maxLength: 32 },
      'Standard Large': { base: 32, perCm: 1.6, minLength: 21, maxLength: 24 },
      'Standard Medium': { base: 18, perCm: 1.4, minLength: 19, maxLength: 21 },
      'Standard Small': { base: 14, perCm: 1.1, minLength: 13, maxLength: 17 },
      'Economy': { base: 12, perCm: 0.9, minLength: 12, maxLength: 16 }
    };

    const size = product.size || 'Medium';
    const length = product.length || 20;
    
    const priceConfig = baseGradePrices[size] || baseGradePrices['Medium'];
    
    // Calculate base price
    let price = priceConfig.base + (length * priceConfig.perCm);
    
    // Quality multipliers (if provided)
    if (product.quality_grade) {
      const qualityMultipliers = {
        'Premium': 1.25,
        'Grade A': 1.15,
        'Grade B': 1.0,
        'Grade C': 0.85
      };
      price *= (qualityMultipliers[product.quality_grade] || 1.0);
    }
    
    // Round to nearest 5 for market-friendly pricing
    price = Math.round(price / 5) * 5;
    
    return price;
  }

  /**
   * Get bulk discount based on quantity
   */
  static getBulkDiscount(quantity) {
    if (quantity >= 100) return 0.20; // 20% discount
    if (quantity >= 50) return 0.15;  // 15% discount
    if (quantity >= 20) return 0.10;  // 10% discount
    if (quantity >= 10) return 0.05;  // 5% discount
    return 0; // No discount
  }

  /**
   * Calculate total order price with bulk discount
   */
  static calculateOrderTotal(items) {
    let total = 0;
    let totalQuantity = 0;

    items.forEach(item => {
      const price = this.calculatePrice(item);
      total += price * item.quantity;
      totalQuantity += item.quantity;
    });

    // Apply bulk discount
    const bulkDiscount = this.getBulkDiscount(totalQuantity);
    const discountAmount = total * bulkDiscount;
    const finalTotal = total - discountAmount;

    return {
      subtotal: total,
      bulkDiscount,
      discountAmount,
      total: finalTotal,
      totalQuantity,
      breakdown: items.map(item => ({
        ...item,
        unitPrice: this.calculatePrice(item),
        itemTotal: this.calculatePrice(item) * item.quantity
      }))
    };
  }

  /**
   * Get price breakdown text
   */
  static getPriceText(price) {
    return `₱${price.toFixed(2)}`;
  }

  /**
   * Format price breakdown for display
   */
  static formatPriceBreakdown(orderBreakdown) {
    return `
      Subtotal: ₱${orderBreakdown.subtotal.toFixed(2)}
      Bulk Discount (${(orderBreakdown.bulkDiscount * 100).toFixed(0)}%): -₱${orderBreakdown.discountAmount.toFixed(2)}
      Total: ₱${orderBreakdown.total.toFixed(2)}
    `;
  }
}

module.exports = CocolumberPricing;
