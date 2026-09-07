import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  RefreshCw
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'
import { getOrder, getOrdersByPhone, advanceOrderStatus } from '../lib/db'

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOrderId = searchParams.get('orderId') || ''

  const [query, setQuery] = useState(initialOrderId)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copiedAwb, setCopiedAwb] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const STAGES = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Payment verified' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Crafting & Gold Patina' },
    { key: 'PACKED', label: 'Packed', desc: 'Quality inspected' },
    { key: 'SHIPPED', label: 'Shipped', desc: 'In Courier transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Arriving today' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Package received' },
  ]

  const fetchOrderDetails = async (idToSearch) => {
    if (!idToSearch) return
    setLoading(true)
    setNotFound(false)

    try {
      let res = await getOrder(idToSearch)
      if (!res) {
        // Try searching by phone
        const byPhone = await getOrdersByPhone(idToSearch)
        if (byPhone.length > 0) {
          res = byPhone[0]
        }
      }

      if (res) {
        setOrder(res)
      } else {
        setOrder(null)
        setNotFound(true)
      }
    } catch (e) {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderId) {
      setQuery(initialOrderId)
      fetchOrderDetails(initialOrderId)
    }
  }, [initialOrderId])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchParams({ orderId: query.trim() })
    fetchOrderDetails(query.trim())
  }

  const handleCopyAwb = (awb) => {
    if (!awb) return
    navigator.clipboard.writeText(awb)
    setCopiedAwb(true)
    setTimeout(() => setCopiedAwb(false), 2000)
  }

  const handleAdvanceStatus = () => {
    if (!order) return
    const updated = advanceOrderStatus(order.order_number)
    if (updated) {
      setOrder({ ...updated })
    }
  }

  const getStageIndex = (status) => {
    if (status === 'IN_TRANSIT') return 3
    const idx = STAGES.findIndex((s) => s.key === status)
    return idx >= 0 ? idx : 0
  }

  const currentStageIndex = order ? getStageIndex(order.status) : 0

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-cream-muted/60 mb-6">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-cream">Live Order Tracking</span>
        </div>

        {/* Page Title & Search Bar */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-3">
            <Truck className="h-3.5 w-3.5" /> Pan-India Live Logistics
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-cream">
            Track Your Keychain
          </h1>
          <p className="mt-2 text-sm text-cream-muted/80">
            Enter your Outframe Order ID or 10-digit registered mobile number to see real-time dispatch and courier updates.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cream-muted/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. OFL-2026-1049 or Mobile No."
                className="w-full rounded-full border border-gold/30 bg-charcoal/80 pl-10 pr-4 py-3 text-sm text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 shadow-lg shadow-black/50"
              />
            </div>
            <button
              type="submit"
              className="btn-gold rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/20"
            >
              Track
            </button>
          </form>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <RefreshCw className="h-8 w-8 text-gold animate-spin mx-auto mb-3" />
            <p className="text-sm text-cream-muted">Fetching live tracking information...</p>
          </div>
        )}

        {notFound && !loading && (
          <div className="rounded-2xl border border-charcoal-light bg-charcoal/60 p-8 text-center max-w-md mx-auto">
            <Package className="h-12 w-12 text-cream-muted/30 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-cream">Order Not Found</h3>
            <p className="mt-1 text-xs text-cream-muted/70">
              We couldn't find an order matching "{query}". Please double-check your Order Number or phone number.
            </p>
          </div>
        )}

        {/* Order Tracking Dashboard */}
        {order && !loading && (
          <div className="space-y-6">
            {/* Top Order Status Card */}
            <div className="rounded-2xl border border-gold/25 bg-charcoal/70 p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-charcoal-light/80">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-xl sm:text-2xl font-bold text-cream">
                      {order.order_number}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-bold text-gold">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-cream-muted/60">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · Customer: <strong className="text-cream">{order.customer_name}</strong>
                  </p>
                </div>

                {/* Estimated Delivery Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-right sm:text-right">
                  <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider block">
                    Estimated Delivery
                  </span>
                  <span className="font-heading text-sm sm:text-base font-bold text-emerald-300">
                    {order.shipment?.estimated_delivery
                      ? new Date(order.shipment.estimated_delivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                      : 'Within 3-4 Days'}
                  </span>
                </div>
              </div>

              {/* Step Progress Tracker */}
              <div className="pt-8 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative">
                  {STAGES.map((stage, idx) => {
                    const isDone = idx <= currentStageIndex
                    const isCurrent = idx === currentStageIndex

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center relative">
                        {/* Step Icon */}
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isDone
                              ? 'bg-gold text-obsidian shadow-lg shadow-gold/30 ring-4 ring-gold/20'
                              : 'bg-charcoal-light text-cream-muted/40 border border-charcoal-light'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>

                        <span
                          className={`mt-2.5 text-xs font-bold block ${
                            isCurrent ? 'text-gold' : isDone ? 'text-cream' : 'text-cream-muted/40'
                          }`}
                        >
                          {stage.label}
                        </span>
                        <span className="text-[10px] text-cream-muted/50 leading-tight mt-0.5">
                          {stage.desc}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Demo Status Advance Trigger */}
              <div className="mt-4 pt-4 border-t border-charcoal-light/60 flex items-center justify-between text-xs">
                <span className="text-cream-muted/50 text-[11px]">
                  Simulate live courier status progression:
                </span>
                <button
                  onClick={handleAdvanceStatus}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold hover:text-obsidian transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Advance Status (Demo)</span>
                </button>
              </div>
            </div>

            {/* Courier & Shipping Logistics (Shiprocket Ready) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Courier Partner & AWB Card */}
              <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal/60 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Courier Partner
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Shiprocket Ready
                  </span>
                </div>

                <div className="divide-y divide-charcoal-light/60 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-cream-muted/70">Carrier</span>
                    <span className="font-bold text-cream">{order.shipment?.courier_partner || 'Delhivery Express'}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-cream-muted/70">AWB Tracking Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gold">{order.shipment?.awb_code || 'DL849204819'}</span>
                      <button
                        onClick={() => handleCopyAwb(order.shipment?.awb_code)}
                        className="text-cream-muted/60 hover:text-cream"
                        title="Copy AWB Code"
                      >
                        {copiedAwb ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-cream-muted/70">Tracking Portal</span>
                    <a
                      href={order.shipment?.tracking_url || `https://www.delhivery.com/track/package/${order.shipment?.awb_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gold hover:underline font-semibold"
                    >
                      Track with Carrier <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal/60 p-6 space-y-4">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Delivery Destination
                </h3>
                <div className="text-xs text-cream-muted space-y-1">
                  <p className="font-bold text-sm text-cream">{order.shipping_address?.full_name || order.customer_name}</p>
                  <p>{order.shipping_address?.street_address}</p>
                  <p>
                    {order.shipping_address?.city}, {order.shipping_address?.state} - <strong className="text-cream">{order.shipping_address?.pincode}</strong>
                  </p>
                  <p className="pt-2 text-cream-muted/50">Phone: {order.shipping_address?.phone || order.customer_phone}</p>
                </div>
              </div>
            </div>

            {/* Checkpoint Activity Logs */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal/60 p-6">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Chronological Timeline Updates
              </h3>

              <div className="space-y-4">
                {(order.tracking_events || []).map((evt, i) => (
                  <div key={evt.id || i} className="flex gap-4 items-start">
                    <div className="h-7 w-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-cream">{evt.activity}</span>
                        <span className="text-[10px] text-cream-muted/40">
                          {new Date(evt.event_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[11px] text-cream-muted/60 block mt-0.5">
                        Location: {evt.location || 'Hub'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items in this order */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal/60 p-6">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gold mb-4 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Ordered Keychains
              </h3>
              <div className="divide-y divide-charcoal-light/60">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover bg-obsidian border border-charcoal-light" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-cream block">{item.name}</span>
                        <span className="text-[11px] text-cream-muted/60">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-charcoal-light/80 flex justify-between items-center text-xs">
                <span className="text-cream-muted">Total (including ₹60 shipping)</span>
                <span className="font-heading text-base font-bold text-cream">₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  )
}
