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
  initAuthListener
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

  // Search State
  const [query, setQuery] = useState(initialOrderId)
  const [searchedOrder, setSearchedOrder] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Expanded Order Cards (for viewing full courier tracking details)
  const [expandedOrders, setExpandedOrders] = useState({})
  const [copiedAwb, setCopiedAwb] = useState(null)

  // 6 Checkpoints matching Outframe Labs fulfillment pipeline
  const STAGES = [
    {
      key: 'PLACED',
      step: '01',
      label: 'Order Placed',
      desc: 'Order verified and securely registered in system',
      icon: CheckCircle2,
    },
    {
      key: 'CONFIRMED',
      step: '02',
      label: 'Confirmed & Crafted',
      desc: 'Keychain 3D sculpted with authentic Antique Gold Patina finish',
      icon: Sparkles,
    },
    {
      key: 'PACKED',
      step: '03',
      label: 'Packed in Collector Tin',
      desc: 'Carefully inspected and sealed in signature Outframe collector tin box',
      icon: Package,
    },
    {
      key: 'SHIPPED',
      step: '04',
      label: 'Shipped & In Transit',
      desc: 'Handed over to courier partner (Delhivery Express) for express air transit',
      icon: Truck,
    },
    {
      key: 'OUT_FOR_DELIVERY',
      step: '05',
      label: 'Out for Delivery',
      desc: 'Package is out with courier delivery executive for doorstep handover',
      icon: MapPin,
    },
    {
      key: 'DELIVERED',
      step: '06',
      label: 'Delivered',
      desc: 'Safely delivered to customer address with signature verification',
      icon: Check,
    },
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

  // Search Single Order (for guest or specific ID lookup)
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

  // Unified list of orders to display (NEVER duplicate sections)
  const displayedOrders = (() => {
    const cleanQ = query.trim().toUpperCase()
    if (cleanQ) {
      const matched = userOrders.filter(
        (o) =>
          o.order_number?.toUpperCase().includes(cleanQ) ||
          (o.customer_phone && o.customer_phone.replace(/[^0-9]/g, '').includes(cleanQ))
      )
      if (matched.length > 0) return matched
      if (searchedOrder) return [searchedOrder]
      return []
    }
    // If no active search query, return all user orders
    return userOrders
  })()

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 pt-24 pb-20">
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
            Track your 3D-sculpted antique gold keychains step-by-step from studio crafting to doorstep delivery.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cream-muted/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Order ID or Mobile No."
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
                    Sign in to automatically access and track all your past and active orders forever.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <span className="text-xs font-bold text-gold px-3 py-1 rounded-full bg-gold/15 border border-gold/30">
                {displayedOrders.length} {displayedOrders.length === 1 ? 'Order' : 'Orders'}
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
              We couldn't find an order matching "{query}". Please check your Order ID or phone number.
            </p>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            ALL YOUR ORDERS (SINGLE UNIFIED SECTION — ONE BELOW THE OTHER)
        ═════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-light/70">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <Package className="h-5 w-5 text-gold" />
              <span>All Your Orders</span>
            </h2>
            {query.trim() && (
              <button
                onClick={() => {
                  setQuery('')
                  setSearchedOrder(null)
                  setNotFound(false)
                  setSearchParams({})
                }}
                className="text-xs text-gold hover:underline cursor-pointer"
              >
                Clear Search & Show All
              </button>
            )}
          </div>

          {ordersLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="h-8 w-8 text-gold animate-spin mx-auto mb-3" />
              <p className="text-sm text-cream-muted">Loading your orders & live statuses...</p>
            </div>
          ) : displayedOrders.length === 0 && !notFound ? (
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
            <div className="space-y-8">
              {displayedOrders.map((ord) => (
                <OrderCard
                  key={ord.order_number || ord.id}
                  order={ord}
                  isExpanded={Boolean(expandedOrders[ord.order_number])}
                  onToggleExpand={() => toggleExpand(ord.order_number)}
                  onCopyAwb={handleCopyAwb}
                  copiedAwb={copiedAwb}
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

// ── COMPONENT: SINGLE ORDER CARD (One Below Other with Vertical Checkpoints) ──
function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onCopyAwb,
  copiedAwb,
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
    <div className="rounded-2xl border border-gold/25 bg-charcoal/80 shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-gold/45">
      {/* ── 1. Top Order Summary Header ── */}
      <div className="border-b border-charcoal-light/70 bg-obsidian/85 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-heading text-base font-extrabold text-cream tracking-wide">
            {order.order_number}
          </span>
          <span className="text-cream-muted/50">·</span>
          <span className="text-cream-muted/70">Placed {formattedDate}</span>
          <span className="text-cream-muted/50">·</span>
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

      <div className="p-5 sm:p-6 space-y-6">
        {/* ── 2. Product Items (Main Image, Full Name on Side, Status Below) ── */}
        <div className="space-y-4">
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
                      Carrier: {order.shipment?.courier_partner || 'Delhivery Air'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── 3. Vertical Checkpoints (Each Down of Each Other — Matched to Image 2) ── */}
        <div className="pt-4 border-t border-charcoal-light/70">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cream-muted/70 mb-5 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gold" />
            <span>Fulfillment Pipeline</span>
          </h4>

          <div className="relative pl-3 sm:pl-4 space-y-6 sm:space-y-7">
            {/* Connected Vertical Progress Line */}
            <div className="absolute left-[23px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-charcoal-light">
              <div
                className="w-full bg-gradient-to-b from-gold via-yellow-300 to-gold transition-all duration-700"
                style={{
                  height: `${Math.min(100, (currentStageIndex / (STAGES.length - 1)) * 100)}%`,
                }}
              />
            </div>

            {STAGES.map((stage, idx) => {
              const isDone = idx <= currentStageIndex
              const isCurrent = idx === currentStageIndex
              const StageIcon = stage.icon || Check

              return (
                <div key={stage.key} className="relative flex items-start gap-4 sm:gap-5 group">
                  {/* Glowing Node on Vertical Line */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className={`h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCurrent
                          ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/35 shadow-xl shadow-gold/50 scale-105'
                          : isDone
                          ? 'bg-gold text-obsidian font-bold shadow-md shadow-gold/25'
                          : 'bg-charcoal border border-charcoal-light text-cream-muted/30'
                      }`}
                    >
                      {isDone && !isCurrent ? (
                        <Check className="h-5 w-5 stroke-[2.5]" />
                      ) : (
                        <StageIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                  </div>

                  {/* Side Checkpoint Details: Step Number, Title, and Description */}
                  <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-mono text-xs sm:text-sm font-extrabold italic tracking-wider ${
                          isCurrent ? 'text-gold' : isDone ? 'text-gold/80' : 'text-cream-muted/30'
                        }`}
                      >
                        {stage.step}
                      </span>
                      <h5
                        className={`font-heading text-sm sm:text-base font-bold tracking-tight ${
                          isCurrent ? 'text-gold' : isDone ? 'text-cream' : 'text-cream-muted/50'
                        }`}
                      >
                        {stage.label}
                      </h5>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 shrink-0">
                          Active Stage
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cream-muted/70 mt-1 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
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
            <span>{isExpanded ? 'Hide Courier Details' : 'View Full Courier Details'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
