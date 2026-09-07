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
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  RefreshCw,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'
import AuthModal from '../components/AuthModal'
import {
  getOrder,
  getOrdersByPhone,
  getUserOrders,
  getCurrentCustomer,
  initAuthListener,
  advanceOrderStatus
} from '../lib/db'

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOrderId = searchParams.get('orderId') || ''

  // Auth & User State
  const [currentUser, setCurrentUser] = useState(() => getCurrentCustomer())
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Orders List State
  const [userOrders, setUserOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Search / Single Order State
  const [query, setQuery] = useState(initialOrderId)
  const [searchedOrder, setSearchedOrder] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Expanded Order Cards (for viewing full courier tracking details)
  const [expandedOrders, setExpandedOrders] = useState({})
  const [copiedAwb, setCopiedAwb] = useState(null)

  const STAGES = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Payment verified' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Crafting & Gold Patina' },
    { key: 'PACKED', label: 'Packed', desc: 'Quality inspected' },
    { key: 'SHIPPED', label: 'Shipped', desc: 'In Courier transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Arriving today' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Package received' },
  ]

  const getStageIndex = (status) => {
    if (status === 'IN_TRANSIT') return 3
    const idx = STAGES.findIndex((s) => s.key === status)
    return idx >= 0 ? idx : 0
  }

  // Auth Listener
  useEffect(() => {
    const unsub = initAuthListener((user) => {
      setCurrentUser(user)
    })
    return () => unsub && unsub()
  }, [])

  // Load User Orders on Mount and when User changes
  const loadOrders = async (user = currentUser) => {
    setOrdersLoading(true)
    try {
      const orders = await getUserOrders(user)
      setUserOrders(orders || [])
    } catch (e) {
      console.warn('Failed to load user orders:', e)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    loadOrders(currentUser)
  }, [currentUser])

  // Search Single Order
  const fetchSingleOrder = async (idToSearch) => {
    if (!idToSearch) return
    setSearchLoading(true)
    setNotFound(false)

    try {
      let res = await getOrder(idToSearch)
      if (!res) {
        const byPhone = await getOrdersByPhone(idToSearch)
        if (byPhone.length > 0) res = byPhone[0]
      }

      if (res) {
        setSearchedOrder(res)
        // Automatically expand the searched order
        setExpandedOrders((prev) => ({ ...prev, [res.order_number]: true }))
      } else {
        setSearchedOrder(null)
        setNotFound(true)
      }
    } catch (e) {
      setNotFound(true)
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderId) {
      setQuery(initialOrderId)
      fetchSingleOrder(initialOrderId)
    }
  }, [initialOrderId])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setSearchedOrder(null)
      setNotFound(false)
      setSearchParams({})
      return
    }
    setSearchParams({ orderId: query.trim() })
    fetchSingleOrder(query.trim())
  }

  const toggleExpand = (orderNumber) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNumber]: !prev[orderNumber],
    }))
  }

  const handleCopyAwb = (awb) => {
    if (!awb) return
    navigator.clipboard.writeText(awb)
    setCopiedAwb(awb)
    setTimeout(() => setCopiedAwb(null), 2000)
  }

  const handleAdvanceStatus = (orderNumber) => {
    const updated = advanceOrderStatus(orderNumber)
    if (updated) {
      // Update in searched order if applicable
      if (searchedOrder?.order_number === orderNumber) {
        setSearchedOrder({ ...updated })
      }
      // Update in user orders list
      setUserOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...updated } : o))
      )
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-cream-muted/60 mb-6">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-cream">Orders & Live Tracking</span>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold mb-3">
            <Truck className="h-3.5 w-3.5" /> Pan-India Live Logistics
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-cream tracking-tight">
            Orders & Live Tracking
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-cream-muted/80">
            Track your 3D-sculpted antique gold keychains in real-time from our Maharashtra studio to your doorstep.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cream-muted/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. OFL-2026-1049 or Mobile No."
                className="w-full rounded-full border border-gold/30 bg-charcoal/80 pl-10 pr-4 py-3 text-xs sm:text-sm text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 shadow-lg shadow-black/50"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="btn-gold rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/20 cursor-pointer disabled:opacity-50"
            >
              {searchLoading ? <RefreshCw className="h-4 w-4 animate-spin text-obsidian" /> : 'Track'}
            </button>
          </form>
        </div>

        {/* User Account Status Banner */}
        <div className="mb-8 rounded-2xl border border-gold/20 bg-charcoal/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-bold text-sm shrink-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              {currentUser ? (
                <>
                  <p className="text-sm font-bold text-cream truncate">
                    Orders for <span className="text-gold">{currentUser.name || currentUser.email}</span>
                  </p>
                  <p className="text-xs text-cream-muted/70 truncate">{currentUser.email}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-cream">Guest Collector</p>
                  <p className="text-xs text-cream-muted/70">
                    Sign in to automatically sync and access all your past and active orders forever.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <span className="text-xs font-bold text-gold px-3 py-1 rounded-full bg-gold/15 border border-gold/30">
                {userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'} Found
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-gold rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Sign In to View Orders
              </button>
            )}
          </div>
        </div>

        {/* Search Not Found State */}
        {notFound && !searchLoading && (
          <div className="mb-8 rounded-2xl border border-charcoal-light bg-charcoal/60 p-8 text-center max-w-md mx-auto">
            <Package className="h-12 w-12 text-cream-muted/30 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-cream">Order Not Found</h3>
            <p className="mt-1 text-xs text-cream-muted/70">
              We couldn't find an order matching "{query}". Please double-check your Order Number or phone number.
            </p>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            SEARCHED ORDER DEEP-DIVE (IF SPECIFIC ORDER SEARCHED)
        ═════════════════════════════════════════════════════════════ */}
        {searchedOrder && (
          <div className="mb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-gold flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Searched Order Result
              </h2>
              <button
                onClick={() => {
                  setSearchedOrder(null)
                  setQuery('')
                  setSearchParams({})
                }}
                className="text-xs text-cream-muted hover:text-cream underline cursor-pointer"
              >
                Clear Search & View All
              </button>
            </div>

            <OrderCard
              order={searchedOrder}
              isExpanded={Boolean(expandedOrders[searchedOrder.order_number])}
              onToggleExpand={() => toggleExpand(searchedOrder.order_number)}
              onCopyAwb={handleCopyAwb}
              copiedAwb={copiedAwb}
              onAdvanceStatus={() => handleAdvanceStatus(searchedOrder.order_number)}
              STAGES={STAGES}
              getStageIndex={getStageIndex}
            />
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            ALL USER ORDERS (LISTED ONE BELOW THE OTHER)
        ═════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-light/70">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <Package className="h-5 w-5 text-gold" />
              <span>All Your Orders</span>
            </h2>
            {userOrders.length > 0 && (
              <span className="text-xs text-cream-muted/70">
                Sorted by most recent
              </span>
            )}
          </div>

          {ordersLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="h-8 w-8 text-gold animate-spin mx-auto mb-3" />
              <p className="text-sm text-cream-muted">Loading your orders & live statuses...</p>
            </div>
          ) : userOrders.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-gold/20 bg-charcoal/60 p-10 text-center space-y-3">
              <ShoppingBag className="h-12 w-12 text-gold/60 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-cream">No orders placed yet</h3>
              <p className="text-xs text-cream-muted/70 max-w-sm mx-auto">
                Once you place an order for our antique gold outframed keychains, you can track every step of crafting, packing, and courier delivery here.
              </p>
              <Link
                to="/"
                className="btn-gold inline-flex items-center gap-2 mt-3 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                <span>Explore Drops</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* List of Orders One Below the Other */
            <div className="space-y-6">
              {userOrders.map((ord) => (
                <OrderCard
                  key={ord.order_number || ord.id}
                  order={ord}
                  isExpanded={Boolean(expandedOrders[ord.order_number])}
                  onToggleExpand={() => toggleExpand(ord.order_number)}
                  onCopyAwb={handleCopyAwb}
                  copiedAwb={copiedAwb}
                  onAdvanceStatus={() => handleAdvanceStatus(ord.order_number)}
                  STAGES={STAGES}
                  getStageIndex={getStageIndex}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

// ── COMPONENT: SINGLE ORDER CARD (One Below Other) ──
function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onCopyAwb,
  copiedAwb,
  onAdvanceStatus,
  STAGES,
  getStageIndex
}) {
  const currentStageIndex = getStageIndex(order.status)
  const items = order.items || order.order_items || []
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Order'

  // Map status to badge color & label
  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          label: 'Delivered',
        }
      case 'OUT_FOR_DELIVERY':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400',
          label: 'Out for Delivery',
        }
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return {
          bg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300',
          label: 'Shipped & In Transit',
        }
      case 'PACKED':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          label: 'Packed in Tin Box',
        }
      case 'CONFIRMED':
        return {
          bg: 'bg-gold/20 border-gold/50 text-gold',
          label: 'Confirmed & Handcrafting',
        }
      case 'PLACED':
      default:
        return {
          bg: 'bg-gold/15 border-gold/30 text-gold',
          label: 'Order Placed',
        }
    }
  }

  const badge = getStatusBadge(order.status)

  return (
    <div className="rounded-2xl border border-gold/25 bg-charcoal/80 shadow-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-gold/40">
      {/* ── 1. Top Order Summary Header ── */}
      <div className="border-b border-charcoal-light/70 bg-obsidian/80 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-heading text-base font-extrabold text-cream tracking-wide">
            {order.order_number}
          </span>
          <span className="text-cream-muted/60">·</span>
          <span className="text-cream-muted/70">Placed {formattedDate}</span>
          <span className="text-cream-muted/60">·</span>
          <span className="text-cream-muted/80">Recipient: <strong className="text-cream">{order.customer_name}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-heading text-base font-bold text-gold">
            ₹{order.total_amount}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-charcoal-light border border-charcoal-light text-cream-muted">
            {order.payment_method === 'PREPAID' ? 'Prepaid UPI' : 'COD'}
          </span>
        </div>
      </div>

      {/* ── 2. Main Product(s) Display (With Image, Name on Side, and Status Below) ── */}
      <div className="p-5 sm:p-6 space-y-6">
        {items.length === 0 ? (
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-charcoal-light border border-gold/20 flex items-center justify-center text-gold">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-cream">Outframed Keychain</h3>
              <p className="text-xs text-cream-muted">Antique Gold Finish</p>
            </div>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.product_id || item.id || idx}
              className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-charcoal-light/50"
            >
              {/* Main Product Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-gold/30 bg-obsidian shrink-0 shadow-md">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name || item.product_name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold bg-charcoal">
                    <Package className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Side: Full Name of Product & Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-cream tracking-tight truncate">
                    {item.name || item.product_name || 'Outframed Keychain'}
                  </h3>
                  <span className="font-heading text-sm font-bold text-gold shrink-0">
                    ₹{item.price * (item.quantity || 1)}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-cream-muted/70">
                  <span>Qty: <strong className="text-cream">{item.quantity || 1}</strong></span>
                  <span>·</span>
                  <span>₹{item.price} each</span>
                  <span>·</span>
                  <span className="text-gold font-medium">Antique Gold Finish</span>
                </div>

                {/* Below that: Status of the product */}
                <div className="mt-3 pt-3 border-t border-charcoal-light/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      {badge.label}
                    </span>
                    <span className="text-xs text-cream-muted/70">
                      {order.shipment?.estimated_delivery
                        ? `Est. Delivery: ${new Date(order.shipment.estimated_delivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
                        : 'Estimated Delivery: 3-4 Days'}
                    </span>
                  </div>

                  <span className="text-[11px] text-cream-muted/50 font-mono">
                    Courier: {order.shipment?.courier_partner || 'Delhivery Air'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* ── 3. Visual Progress Stepper ── */}
        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {STAGES.map((stg, i) => {
              const isDone = i <= currentStageIndex
              const isCurrent = i === currentStageIndex

              return (
                <div key={stg.key} className="flex flex-col items-center text-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-gold text-obsidian font-bold shadow-md shadow-gold/25'
                        : 'bg-charcoal border border-charcoal-light text-cream-muted/40'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <span className="text-[11px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-bold leading-tight ${
                      isCurrent ? 'text-gold' : isDone ? 'text-cream' : 'text-cream-muted/40'
                    }`}
                  >
                    {stg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 4. Toggle Detailed Courier Timeline Button ── */}
        <div className="pt-2 flex items-center justify-between border-t border-charcoal-light/70">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-2 text-xs font-bold text-gold hover:text-yellow-200 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Courier Details' : 'View Full Tracking Details'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Advance status for live demo */}
          <button
            type="button"
            onClick={onAdvanceStatus}
            className="inline-flex items-center gap-1.5 text-[11px] text-cream-muted/60 hover:text-gold transition-colors cursor-pointer"
            title="Simulate next tracking stage"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Simulate Step</span>
          </button>
        </div>

        {/* ── 5. Collapsible Live Courier Details & Checkpoints ── */}
        {isExpanded && (
          <div className="pt-4 border-t border-charcoal-light/70 space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Courier & AWB */}
              <div className="rounded-xl border border-charcoal-light bg-obsidian/70 p-4 space-y-2">
                <p className="font-bold text-gold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" /> Courier Logistics
                </p>
                <div className="flex justify-between">
                  <span className="text-cream-muted">Partner:</span>
                  <span className="font-bold text-cream">{order.shipment?.courier_partner || 'Delhivery Express'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cream-muted">AWB Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-gold font-bold">{order.shipment?.awb_code || 'DLV8492048'}</span>
                    <button
                      type="button"
                      onClick={() => onCopyAwb(order.shipment?.awb_code)}
                      className="text-cream-muted hover:text-cream cursor-pointer"
                      title="Copy AWB"
                    >
                      {copiedAwb === order.shipment?.awb_code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                {order.shipment?.awb_code && (
                  <div className="pt-1">
                    <a
                      href={`https://www.delhivery.com/track/package/${order.shipment.awb_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gold hover:underline font-semibold"
                    >
                      Track on Delhivery Portal <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Destination Address */}
              <div className="rounded-xl border border-charcoal-light bg-obsidian/70 p-4 space-y-1">
                <p className="font-bold text-gold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Delivery Address
                </p>
                <p className="font-bold text-cream">{order.shipping_address?.full_name || order.customer_name}</p>
                <p className="text-cream-muted">{order.shipping_address?.street_address}</p>
                <p className="text-cream-muted">
                  {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                </p>
                <p className="text-cream-muted/60 pt-1">Phone: {order.shipping_address?.phone || order.customer_phone}</p>
              </div>
            </div>

            {/* Checkpoint Milestones */}
            <div className="rounded-xl border border-charcoal-light bg-obsidian/70 p-4">
              <p className="font-bold text-gold uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Live Checkpoint Milestones
              </p>
              <div className="space-y-3">
                {(order.tracking_events || []).map((evt, idx) => (
                  <div key={evt.id || idx} className="flex items-start gap-3 text-xs">
                    <div className="h-5 w-5 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cream">{evt.activity}</span>
                        <span className="text-[10px] text-cream-muted/50 font-mono">
                          {new Date(evt.event_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[11px] text-cream-muted/60 block">{evt.location || 'Maharashtra Hub'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
