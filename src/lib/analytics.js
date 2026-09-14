/**
 * Outframe Labs Analytics & Event Tracking Utility
 * Integrates with Microsoft Clarity (Session Recordings, Heatmaps, Custom Events)
 * and can dispatch to GA4 / Meta Pixel when configured.
 */

// Safely execute Clarity commands
export function clarityEvent(eventName) {
  try {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('event', eventName)
    }
  } catch (e) {
    // Fail silently so tracking never disrupts user experience
  }
}

export function clarityTag(key, value) {
  try {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function' && key && value !== undefined) {
      window.clarity('set', String(key), String(value))
    }
  } catch (e) {}
}

export function clarityIdentify(userId, sessionId, pageName) {
  try {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('identify', String(userId || 'anonymous'), String(sessionId || ''), String(pageName || ''))
    }
  } catch (e) {}
}

// ── E-COMMERCE SPECIFIC TRACKING HELPERS ──

/**
 * Track when a user views a specific product
 */
export function trackProductView(product) {
  if (!product) return
  const productName = product.fullName || product.name || 'Outframed Keychain'
  clarityTag('product_viewed', productName)
  clarityTag('product_id', String(product.id || ''))
  clarityTag('product_price', String(product.price || 299))
  if (product.genre) {
    clarityTag('product_genre', product.genre)
  }
  clarityEvent('view_product')
}

/**
 * Track when a user clicks "Add to Cart"
 */
export function trackAddToCart(product, quantity = 1) {
  if (!product) return
  const productName = product.fullName || product.name || 'Outframed Keychain'
  clarityTag('last_cart_item', productName)
  clarityTag('cart_qty', String(quantity))
  clarityEvent('add_to_cart')
}

/**
 * Track when a user clicks "BUY IT NOW"
 */
export function trackBuyNow(product, quantity = 1) {
  if (!product) return
  const productName = product.fullName || product.name || 'Outframed Keychain'
  clarityTag('buy_now_product', productName)
  clarityTag('buy_now_qty', String(quantity))
  clarityTag('buy_now_price', String(Number(product.price || 299) * quantity))
  clarityEvent('click_buy_now')
}

/**
 * Track checkout funnel progression
 * step: 1 = Address, 2 = Payment Selection, 3 = Confirmation
 */
export function trackCheckoutStep(stepNumber, stepName, extraData = {}) {
  const stepLabel = `step_${stepNumber}_${stepName}`
  clarityTag('checkout_current_step', stepLabel)
  if (extraData.itemCount) {
    clarityTag('checkout_item_count', String(extraData.itemCount))
  }
  if (extraData.totalAmount) {
    clarityTag('checkout_total_amount', String(extraData.totalAmount))
  }
  if (extraData.paymentMethod) {
    clarityTag('checkout_payment_method', extraData.paymentMethod)
  }
  clarityEvent(`checkout_${stepLabel}`)
}

/**
 * Track successful order completion
 */
export function trackOrderCompleted(order) {
  if (!order) return
  const orderNumber = order.order_number || order.id || 'UNKNOWN'
  const total = order.total_amount || order.totalAmount || 0
  const method = order.payment_method || order.paymentMethod || 'COD'

  clarityTag('completed_order_number', String(orderNumber))
  clarityTag('completed_order_total', String(total))
  clarityTag('completed_order_method', String(method))
  clarityEvent('order_completed')
}
