import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Lock,
  User,
  Mail,
  Phone,
  ArrowRight,
  RefreshCw,
  LogOut,
  UserCheck
} from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import {
  createOrder,
  getCurrentCustomer,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logoutCustomer,
  initAuthListener
} from '../lib/db'
import { useNavigate } from 'react-router-dom'

export default function CheckoutModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const closeCart = useCartStore((s) => s.closeCart)

  // Auth state
  const [currentUser, setCurrentUser] = useState(null)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Checkout address state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Maharashtra')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  // Check auth on open and pre-fill customer details (email & phone only; recipient name is not auto-filled)
  useEffect(() => {
    if (isOpen) {
      const user = getCurrentCustomer()
      if (user && typeof user === 'object') {
        setCurrentUser(user)
        setEmail((prev) => prev || user.email || '')
        setPhone((prev) => prev || user.phone || '')
      } else {
        setCurrentUser(null)
      }
      setAuthError('')
      setCheckoutError('')
    }
  }, [isOpen])

  // Subscribe to auth state
  useEffect(() => {
    const unsub = initAuthListener((user) => {
      if (user && typeof user === 'object') {
        setCurrentUser(user)
        setEmail((prev) => prev || user.email || '')
        setPhone((prev) => prev || user.phone || '')
      } else {
        setCurrentUser(null)
      }
    })
    return () => unsub && unsub()
  }, [])

  if (!isOpen) return null

  const subtotal = typeof getTotal === 'function' ? getTotal() : 0
  const shippingFee = 60
  const totalAmount = subtotal + shippingFee

  // Google Login at checkout - opens authentic native Google popup
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setAuthError('')
    try {
      const user = await signInWithGoogle()
      if (user) {
        setCurrentUser(user)
        // Recipient name varies, so do NOT auto-fill fullName from Google profile
        setEmail(user.email || '')
        setPhone(user.phone || '')
      }
    } catch (err) {
      console.warn('Native Google sign-in failed at checkout:', err)
      setAuthError(err.message || 'Google sign-in could not be completed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Email login/signup at checkout
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (!authEmail.trim()) {
      setAuthError('Please enter your email address.')
      return
    }

    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.')
      return
    }

    if (authMode === 'signup' && !authName.trim()) {
      setAuthError('Please enter your full name.')
      return
    }

    setAuthLoading(true)
    try {
      let user
      if (authMode === 'signup') {
        user = await signUpWithEmail(authEmail, authPassword, authName, authPhone)
      } else {
        user = await signInWithEmail(authEmail, authPassword)
      }

      if (user) {
        setCurrentUser(user)
        // If user explicitly typed a full name during sign-up, use it; otherwise leave blank
        if (authName.trim()) {
          setFullName((prev) => prev || authName.trim())
        }
        setEmail(user.email || authEmail.trim() || '')
        setPhone(user.phone || authPhone.trim() || '')
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Switch / Sign out account
  const handleSwitchAccount = async () => {
    await logoutCustomer()
    setCurrentUser(null)
    setFullName('')
    setEmail('')
    setPhone('')
  }

  // Place final order
  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    setCheckoutError('')

    if (!currentUser) {
      setCheckoutError('Please sign in or create an account to place your order.')
      return
    }

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      setCheckoutError('Please fill in all required delivery details.')
      return
    }

    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setCheckoutError('Please enter a valid 10-digit mobile number.')
      return
    }

    if (pincode.replace(/[^0-9]/g, '').length !== 6) {
      setCheckoutError('Please enter a valid 6-digit Indian PIN code.')
      return
    }

    setIsSubmitting(true)

    try {
      const orderPayload = {
        user_id: currentUser.id || null,
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || currentUser.email || '',
        shipping_address: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          street_address: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        items: items.map((i) => ({
          product_id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
        })),
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        payment_method: paymentMethod,
      }

      const order = await createOrder(orderPayload)

      // Clear cart
      useCartStore.setState({ items: [] })
      closeCart()
      onClose()

      // Route to live tracking
      navigate(`/track-order?orderId=${order.order_number}`)
    } catch (err) {
      setCheckoutError('Could not place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl my-auto rounded-2xl border border-gold/30 bg-charcoal shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[88dvh] animate-fade-in-up">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-gold/15 px-5 sm:px-6 py-4 bg-obsidian/90">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-gold" />
            <h3 className="font-heading text-lg font-bold text-cream">
              {!currentUser ? 'Sign In to Place Order' : 'Secure Delivery & Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-cream-muted/70 hover:bg-charcoal-light hover:text-cream cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════
            STEP 1: MANDATORY LOGIN / SIGNUP GATE (IF NOT LOGGED IN)
        ════════════════════════════════════════════════════════ */}
        {!currentUser ? (
          <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-left custom-scrollbar">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {authError}
              </div>
            )}

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-charcoal-light bg-obsidian hover:bg-charcoal-light/70 hover:border-gold/40 text-cream text-xs font-semibold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <RefreshCw className="w-4 h-4 text-gold animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="w-full border-t border-charcoal-light" />
              <span className="bg-charcoal px-3 text-[10px] uppercase font-bold tracking-widest text-cream-muted/50 absolute">
                Or Continue with Email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-cream-muted/80 mb-1">
                    Your Full Name <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream-muted/40" />
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 pl-9 pr-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-cream-muted/80 mb-1">
                  Email Address <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream-muted/40" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 pl-9 pr-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-cream-muted/80 mb-1">
                    Mobile Number (For Courier Updates)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream-muted/40" />
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 pl-9 pr-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-cream-muted/80 mb-1">
                  Password <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream-muted/40" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 pl-9 pr-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-gold w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/25 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 text-obsidian animate-spin" />
                ) : (
                  <span>{authMode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'}</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signup' ? 'login' : 'signup')
                    setAuthError('')
                  }}
                  className="text-xs text-cream-muted/70 hover:text-gold transition-colors cursor-pointer"
                >
                  {authMode === 'signup'
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Create one"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════
              STEP 2: SHIPPING ADDRESS & PAYMENT (USER IS AUTHENTICATED)
          ════════════════════════════════════════════════════════ */
          <form onSubmit={handleOrderSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 text-left custom-scrollbar">
            {/* Authenticated User Badge */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-xs min-w-0">
                  <p className="font-semibold text-cream truncate">
                    Signed in as <span className="text-emerald-300">{currentUser?.name || currentUser?.email || 'Collector'}</span>
                  </p>
                  <p className="text-[11px] text-cream-muted/60 truncate">{currentUser?.email || ''}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="text-[11px] text-cream-muted hover:text-gold underline shrink-0 cursor-pointer ml-2"
              >
                Switch
              </button>
            </div>

            {checkoutError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {checkoutError}
              </div>
            )}

            {/* 1. Contact Information */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-3 flex items-center gap-1.5">
                <span>1. Contact Details</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-cream-muted/70 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-cream-muted/70 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div className="mt-2.5">
                <label className="block text-[11px] text-cream-muted/70 mb-1">Email Address (For Invoices)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="border-t border-charcoal-light/70 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">
                2. Shipping Address (Pan-India Dispatch)
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-cream-muted/70 mb-1">
                    Flat / House No. / Building / Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Flat 302, Green Valley Apartments, FC Road"
                    className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-cream-muted/70 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune, Mumbai"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-cream-muted/70 mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none cursor-pointer"
                    >
                      <option value="Maharashtra">Maharashtra (Express 24h-48h)</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-cream-muted/70 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6-digit PIN"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/70 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="border-t border-charcoal-light/70 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">
                3. Payment Method
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-gold bg-gold/10 text-cream font-medium'
                      : 'border-charcoal-light bg-obsidian/50 text-cream-muted hover:border-gold/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-gold"
                  />
                  <div className="text-xs">
                    <span className="font-semibold block text-cream">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-cream-muted/60">Pay cash upon delivery</span>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('PREPAID')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'PREPAID'
                      ? 'border-gold bg-gold/10 text-cream font-medium'
                      : 'border-charcoal-light bg-obsidian/50 text-cream-muted hover:border-gold/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'PREPAID'}
                    onChange={() => setPaymentMethod('PREPAID')}
                    className="accent-gold"
                  />
                  <div className="text-xs">
                    <span className="font-semibold block text-cream">UPI / QR / NetBanking</span>
                    <span className="text-[10px] text-emerald-400">Instant Dispatch Priority</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary Breakdown */}
            <div className="rounded-xl border border-charcoal-light bg-obsidian/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-cream-muted">
                <span>Items Subtotal ({items.length} items):</span>
                <span className="font-mono text-cream font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-cream-muted">
                <span>Pan-India Shipping Fee:</span>
                <span className="font-mono text-cream font-semibold">₹{shippingFee}</span>
              </div>
              <div className="border-t border-charcoal-light/70 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-cream">Total Payable Amount:</span>
                <span className="font-heading text-lg font-bold text-gold">₹{totalAmount}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest shadow-xl shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 text-obsidian animate-spin" />
                  <span>Transmitting to Maharashtra Hub...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-obsidian" />
                  <span>Confirm & Place Order</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
