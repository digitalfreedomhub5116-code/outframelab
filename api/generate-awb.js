import { createClient } from '@supabase/supabase-js'

/**
 * Helper to parse request body in both Express and Serverless (Vercel/Next.js/Vite)
 */
async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
  })
}

/**
 * Helper to send JSON response in Express / Vercel / Vite environments
 */
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function') {
    res.status(statusCode).json(data)
  } else {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }
}

/**
 * Formats a Date object to YYYY-MM-DD HH:mm (required by Shiprocket)
 */
function formatShiprocketDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const YYYY = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const DD = pad(d.getDate())
  const HH = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}`
}

/**
 * Authenticate with Shiprocket
 * Uses process.env.SHIPROCKET_TOKEN or auto-authenticates with SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD
 */
async function getShiprocketAuthToken() {
  const directToken = process.env.SHIPROCKET_TOKEN
  if (directToken && directToken.trim() && directToken !== 'your_shiprocket_bearer_token_here') {
    return directToken.trim()
  }

  const email = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (email && password) {
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const authData = await authRes.json()
    if (authRes.ok && authData?.token) {
      return authData.token
    }
    throw new Error(`Shiprocket auth login failed: ${authData?.message || JSON.stringify(authData)}`)
  }

  return null
}

/**
 * Universal Serverless API Route for Shiprocket AWB Generation
 * Compatible with Vercel Serverless Functions, Next.js API Routes, Express, and Vite dev middleware
 */
export default async function handler(req, res) {
  // Allow CORS for local dev / cross-origin admin panels
  res.setHeader?.('Access-Control-Allow-Origin', '*')
  res.setHeader?.('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end()
    }
    res.statusCode = 200
    return res.end()
  }

  if (req.method === 'GET') {
    const hasToken = Boolean(
      (process.env.SHIPROCKET_TOKEN && process.env.SHIPROCKET_TOKEN !== 'your_shiprocket_bearer_token_here') ||
      (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)
    )
    return sendJson(res, 200, {
      success: true,
      connected: hasToken,
      pickup_location: process.env.PICKUP_LOCATION_ID || process.env.SHIPROCKET_PICKUP_LOCATION || 'Home',
    })
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      success: false,
      error: `Method ${req.method} Not Allowed. Expected POST or GET.`,
    })
  }

  try {
    const body = await parseRequestBody(req)
    const orderId = body.orderId || body.order_id
    const fallbackOrderData = body.orderData || null

    if (!orderId && !fallbackOrderData?.id) {
      return sendJson(res, 400, {
        success: false,
        error: 'Missing required parameter: orderId is required to generate an AWB.',
      })
    }

    // 1. Initialize Supabase Client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY

    let supabase = null
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey)
    }

    // 2. Fetch Order Details from Database
    let order = null
    const searchTarget = String(orderId || fallbackOrderData?.id).trim()

    if (supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTarget)
        let query = supabase
          .from('orders')
          .select('*, order_items(*), shipments(*)')

        if (isUUID) {
          query = query.or(`id.eq.${searchTarget},order_number.eq.${searchTarget}`)
        } else {
          query = query.eq('order_number', searchTarget)
        }

        const { data, error } = await query.maybeSingle()
        if (!error && data) {
          order = data
        }
      } catch (err) {
        console.warn('Database query error while fetching order:', err)
      }
    }

    // Fallback to client-provided order data if database lookup didn't return (e.g., in-memory mock order)
    if (!order && fallbackOrderData) {
      order = fallbackOrderData
    }

    if (!order) {
      return sendJson(res, 404, {
        success: false,
        error: `Order "${searchTarget}" not found in database.`,
      })
    }

    // 3. Extract & Validate Shipping Address and Details
    const rawAddress = order.shipping_address || {}
    const customerName = (order.customer_name || rawAddress.full_name || 'Valued Customer').trim()
    const nameParts = customerName.split(' ')
    const firstName = nameParts[0] || 'Customer'
    const lastName = nameParts.slice(1).join(' ') || '.'

    const rawPhone = String(order.customer_phone || rawAddress.phone || '').replace(/[^0-9]/g, '')
    const phone = rawPhone.slice(-10) // Clean 10-digit Indian mobile number
    const email = order.customer_email || rawAddress.email || 'orders@outframelabs.com'

    const streetAddress = (rawAddress.street_address || rawAddress.address || '').trim()
    const city = (rawAddress.city || '').trim()
    const state = (rawAddress.state || '').trim()
    const rawPincode = String(rawAddress.pincode || '').trim()

    // ─── DETAILED VALIDATION (Pincode & Required Fields) ───
    if (!rawPincode) {
      return sendJson(res, 400, {
        success: false,
        error: 'Missing Delivery PIN code. Please ensure the customer has provided a valid 6-digit postal code.',
      })
    }

    // Indian postal code format: 6 digits, cannot start with 0
    const indianPincodeRegex = /^[1-9][0-9]{5}$/
    if (!indianPincodeRegex.test(rawPincode)) {
      return sendJson(res, 400, {
        success: false,
        error: `Invalid PIN code "${rawPincode}". Indian postal codes must be exactly 6 digits without letters or spaces.`,
      })
    }

    if (!streetAddress || streetAddress.length < 5) {
      return sendJson(res, 400, {
        success: false,
        error: 'Delivery address is too short or incomplete. Please provide a valid street address.',
      })
    }

    if (!phone || phone.length !== 10) {
      return sendJson(res, 400, {
        success: false,
        error: `Invalid phone number "${rawPhone}". Please provide a valid 10-digit mobile number for courier SMS updates.`,
      })
    }

    // 4. Authenticate with Shiprocket API
    const shiprocketToken = await getShiprocketAuthToken()

    // 5. Build Items Array
    const orderItems = order.order_items || order.items || []
    const formattedItems = orderItems.length > 0
      ? orderItems.map((it, idx) => ({
          name: it.name || it.product_name || 'Outframed 3D Keychain',
          sku: it.sku || `OFL-KC-${it.product_id || it.id || idx + 1}`,
          units: Number(it.quantity || 1),
          selling_price: Number(it.price || 249),
          discount: 0,
          tax: 0,
          hsn: 39269099, // Standard HSN code for 3D printed plastic keychains & collectables
        }))
      : [
          {
            name: 'Outframed Antique Gold 3D Keychain',
            sku: 'OFL-KC-01',
            units: 1,
            selling_price: Number(order.total_amount || 249),
            discount: 0,
            tax: 0,
            hsn: 39269099,
          },
        ]

    // 6. Format Order Data into Shiprocket Custom Order Payload
    // Package dimensions hardcoded per specification: Length: 10cm, Width: 10cm, Height: 5cm, Weight: 0.1kg
    const pickupLocationId =
      process.env.PICKUP_LOCATION_ID ||
      process.env.SHIPROCKET_PICKUP_LOCATION ||
      'Home'

    const orderNumber = order.order_number || `OFL-${order.id}`
    const paymentMethod = (order.payment_method || '').toUpperCase() === 'COD' ? 'COD' : 'Prepaid'
    const totalAmount = Number(order.total_amount || order.subtotal || 249)

    const shiprocketPayload = {
      order_id: orderNumber,
      order_date: formatShiprocketDate(order.created_at),
      pickup_location: pickupLocationId,
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || '',
      comment: 'Outframe Labs Collector Keychain Drop - Handle with Care',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: streetAddress,
      billing_address_2: rawAddress.landmark || '',
      billing_city: city || 'Pune',
      billing_pincode: rawPincode,
      billing_state: state || 'Maharashtra',
      billing_country: 'India',
      billing_email: email,
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: formattedItems,
      payment_method: paymentMethod,
      sub_total: totalAmount,
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.1,
    }

    // ── Require valid Shiprocket credentials ──
    if (!shiprocketToken) {
      return sendJson(res, 400, {
        success: false,
        error:
          'Shiprocket is not connected: Missing SHIPROCKET_TOKEN or SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD in Vercel. Please add your credentials in Vercel Settings -> Environment Variables so this order can be pushed to your Shiprocket account and generate a valid shipping label.',
      })
    }

    // 7. Make POST Request to Shiprocket: Create Custom Order (/v1/external/orders/create/adhoc)
    const createOrderResponse = await fetch(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${shiprocketToken}`,
        },
        body: JSON.stringify(shiprocketPayload),
      }
    )

    const createOrderResult = await createOrderResponse.json()

    if (!createOrderResponse.ok || !createOrderResult.shipment_id) {
      const errorMsg =
        createOrderResult.message ||
        createOrderResult.errors ||
        JSON.stringify(createOrderResult)

      console.error('Shiprocket order creation error:', errorMsg)

      // Friendly mapping for common logistics issues
      let friendlyError = `Shiprocket Error: ${typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}`
      if (String(errorMsg).toLowerCase().includes('pincode') || String(errorMsg).toLowerCase().includes('serviceable')) {
        friendlyError = `Delivery Pincode (${rawPincode}) is currently not serviceable by Shiprocket courier partners.`
      } else if (String(errorMsg).toLowerCase().includes('pickup')) {
        friendlyError = `Invalid pickup location "${pickupLocationId}". Please verify your PICKUP_LOCATION_ID in .env matches your Shiprocket dashboard.`
      }

      return sendJson(res, 422, {
        success: false,
        error: friendlyError,
        raw: createOrderResult,
      })
    }

    const shiprocketOrderId = createOrderResult.order_id
    const shipmentId = createOrderResult.shipment_id

    // 8. Assign Courier & Generate AWB (/v1/external/courier/assign/awb)
    let awbCode = createOrderResult.awb_code || null
    let courierName = createOrderResult.courier_name || 'Delhivery Surface'

    if (!awbCode) {
      const assignAwbResponse = await fetch(
        'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${shiprocketToken}`,
          },
          body: JSON.stringify({
            shipment_id: shipmentId,
          }),
        }
      )

      const assignAwbResult = await assignAwbResponse.json()

      if (assignAwbResponse.ok && assignAwbResult.response?.data?.awb_code) {
        awbCode = assignAwbResult.response.data.awb_code
        courierName = assignAwbResult.response.data.courier_name || courierName
      } else if (assignAwbResult.awb_code) {
        awbCode = assignAwbResult.awb_code
        courierName = assignAwbResult.courier_name || courierName
      } else {
        const awbError =
          assignAwbResult.response?.data?.awb_assign_error ||
          assignAwbResult.message ||
          assignAwbResult.response?.data?.error ||
          'Failed to assign courier partner'
        return sendJson(res, 422, {
          success: false,
          error: `Shiprocket: ${awbError}`,
          shipment_id: shipmentId,
        })
      }
    }

    // 9. Generate Printable Shipping Label URL (/v1/external/courier/generate/label)
    let labelUrl = null
    try {
      const labelRes = await fetch(
        'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${shiprocketToken}`,
          },
          body: JSON.stringify({ shipment_id: [shipmentId] }),
        }
      )
      const labelData = await labelRes.json()
      if (labelRes.ok && labelData?.label_url) {
        labelUrl = labelData.label_url
      }
    } catch (e) {
      console.warn('Label URL generation notice:', e)
    }

    const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`

    // 10. Update Database: Mark Order as "Shipped" & Store Shipment Details
    await updateDatabaseWithAwb({
      supabase,
      order,
      shiprocketOrderId,
      shipmentId,
      courierPartner: courierName,
      awbCode,
      trackingUrl,
    })

    // 11. Return Success to Frontend
    return sendJson(res, 200, {
      success: true,
      order_id: orderNumber,
      shipment_id: shipmentId,
      awb_code: awbCode,
      courier_name: courierName,
      tracking_url: trackingUrl,
      label_url: labelUrl || `https://shiprocket.co/tracking/${awbCode}`,
      status: 'Shipped',
    })
  } catch (error) {
    console.error('Unhandled error in generate-awb serverless route:', error)
    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal server error during AWB generation.',
    })
  }
}

/**
 * Database update helper to mark order as "Shipped" and insert/update shipment & tracking records
 */
async function updateDatabaseWithAwb({
  supabase,
  order,
  shiprocketOrderId,
  shipmentId,
  courierPartner,
  awbCode,
  trackingUrl,
}) {
  if (!supabase || !order.id) return

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(order.id))
    const nowIso = new Date().toISOString()

    // Update orders status
    if (isUUID) {
      await supabase
        .from('orders')
        .update({
          status: 'Shipped',
          updated_at: nowIso,
        })
        .eq('id', order.id)
    } else {
      await supabase
        .from('orders')
        .update({
          status: 'Shipped',
          updated_at: nowIso,
        })
        .eq('order_number', order.order_number || order.id)
    }

    // Insert or update shipments record
    if (isUUID) {
      const { data: existingShipments } = await supabase
        .from('shipments')
        .select('id')
        .eq('order_id', order.id)
        .limit(1)

      let targetShipmentId = existingShipments?.[0]?.id

      if (targetShipmentId) {
        await supabase
          .from('shipments')
          .update({
            shiprocket_order_id: String(shiprocketOrderId),
            shiprocket_shipment_id: String(shipmentId),
            courier_partner: courierPartner,
            awb_code: awbCode,
            tracking_url: trackingUrl,
            status: 'Shipped',
            updated_at: nowIso,
          })
          .eq('id', targetShipmentId)
      } else {
        const { data: insertedShipment } = await supabase
          .from('shipments')
          .insert({
            order_id: order.id,
            shiprocket_order_id: String(shiprocketOrderId),
            shiprocket_shipment_id: String(shipmentId),
            courier_partner: courierPartner,
            awb_code: awbCode,
            tracking_url: trackingUrl,
            status: 'Shipped',
          })
          .select('id')
          .single()

        targetShipmentId = insertedShipment?.id
      }

      // Add Tracking Milestone Event for real-time tracking visibility
      await supabase.from('tracking_events').insert({
        order_id: order.id,
        shipment_id: targetShipmentId,
        status: 'SHIPPED',
        activity: `AWB Generated (${awbCode}) via ${courierPartner}. Handed over to courier partner.`,
        location: 'Outframe Labs Fulfillment Hub, Bengaluru',
        event_time: nowIso,
      })
    }
  } catch (err) {
    console.warn('Notice: Could not write to Supabase table (non-blocking):', err)
  }
}
