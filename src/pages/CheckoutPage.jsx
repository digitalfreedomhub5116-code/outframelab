import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  RefreshCw,
  ShoppingBag,
  FileText,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import {
  getCurrentCustomer,
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
  createOrder,
  initAuthListener,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logoutCustomer
} from '../lib/db'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const closeCart = useCartStore((s) => s.closeCart)

  // Stepper: 1: 'address', 2: 'payment', 3: 'confirm'
  const [currentStep, setCurrentStep] = useState(1)

  // Auth state
  const [currentUser, setCurrentUser] = useState(() => getCurrentCustomer())
  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Address state
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressLoading, setAddressLoading] = useState(true)
  const [instructionsOpenId, setInstructionsOpenId] = useState(null)
  const [instructionText, setInstructionText] = useState('')

  // Address Form State
  const [formFullName, setFormFullName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formStreet, setFormStreet] = useState('')
  const [formLandmark, setFormLandmark] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formState, setFormState] = useState('Maharashtra')
  const [formPincode, setFormPincode] = useState('')
  const [formIsDefault, setFormIsDefault] = useState(false)
  const [formInstructions, setFormInstructions] = useState('')
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)

  // Step 2 & 3 state
  const [paymentMethod, setPaymentMethod] = useState('COD') // 'COD' | 'PREPAID'
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')

  // Financial calculations
  const subtotal = typeof getTotal === 'function' ? getTotal() : 0
  const shippingFee = 60
  const totalAmount = subtotal + shippingFee

  // Auth listener
  useEffect(() => {
    const unsub = initAuthListener((user) => {
      setCurrentUser(user)
    })
    return () => unsub && unsub()
  }, [])

  // Load addresses when user changes
  const loadAddresses = async (user = currentUser) => {
    setAddressLoading(true)
    try {
      const addrs = await getUserAddresses(user?.id)
      setAddresses(addrs || [])

      if (addrs && addrs.length > 0) {
        // Select default address or first address
        const def = addrs.find((a) => a.is_default) || addrs[0]
        setSelectedAddressId((prev) => (prev && addrs.some((a) => a.id === prev) ? prev : def.id))
      } else {
        setSelectedAddressId(null)
      }
    } catch (e) {
      console.warn('Failed to load user addresses:', e)
    } finally {
      setAddressLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses(currentUser)
  }, [currentUser])

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Handle Google Auth
  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setAuthError('')
    try {
      const user = await signInWithGoogle()
      if (user) {
        setCurrentUser(user)
        setIsAuthFormOpen(false)
        await loadAddresses(user)
      }
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Handle Email Auth
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (!authEmail.trim()) {
      setAuthError('Please enter your email.')
      return
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.')
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
        setIsAuthFormOpen(false)
        await loadAddresses(user)
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Switch User / Sign Out
  const handleLogout = async () => {
    await logoutCustomer()
    setCurrentUser(null)
    await loadAddresses(null)
  }

  // Open Edit Address Form
  const handleStartEdit = (addr) => {
    setEditingAddressId(addr.id)
    setIsAddingNewAddress(true)
    setFormFullName(addr.full_name || '')
    setFormPhone(addr.phone || '')
    setFormStreet(addr.street_address || '')
    setFormLandmark(addr.landmark || '')
    setFormCity(addr.city || '')
    setFormState(addr.state || 'Maharashtra')
    setFormPincode(addr.pincode || '')
    setFormIsDefault(Boolean(addr.is_default))
    setFormInstructions(addr.delivery_instructions || '')
    setFormError('')
  }

  // Reset Address Form
  const handleResetForm = () => {
    setIsAddingNewAddress(false)
    setEditingAddressId(null)
    setFormFullName('')
    setFormPhone('')
    setFormStreet('')
    setFormLandmark('')
    setFormCity('')
    setFormState('Maharashtra')
    setFormPincode('')
    setFormIsDefault(addresses.length === 0)
    setFormInstructions('')
    setFormError('')
  }

  // Save Address (Create or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formFullName.trim()) {
      setFormError('Please enter the recipient full name.')
      return
    }
    const cleanPhone = formPhone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!formStreet.trim()) {
      setFormError('Please enter flat/house no. and street address.')
      return
    }
    if (!formCity.trim()) {
      setFormError('Please enter your city/town.')
      return
    }
    const cleanPincode = formPincode.replace(/[^0-9]/g, '')
    if (cleanPincode.length !== 6) {
      setFormError('Please enter a valid 6-digit Indian PIN code.')
      return
    }

    setFormSaving(true)
    try {
      const payload = {
        id: editingAddressId || undefined,
        full_name: formFullName.trim(),
        phone: cleanPhone,
        street_address: formStreet.trim(),
        landmark: formLandmark.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        pincode: cleanPincode,
        is_default: formIsDefault || addresses.length === 0,
        delivery_instructions: formInstructions.trim(),
      }

      const saved = await saveUserAddress(payload, currentUser?.id)
      await loadAddresses(currentUser)
      if (saved?.id) {
        setSelectedAddressId(saved.id)
      }
      handleResetForm()
      // Advance to payment step immediately
      setCurrentStep(2)
    } catch (err) {
      console.error('Save address error:', err)
      setFormError('Could not save address. Please try again.')
    } finally {
      setFormSaving(false)
    }
  }

  // Delete Address
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
      const updated = await deleteUserAddress(addressId, currentUser?.id)
      setAddresses(updated || [])
      if (selectedAddressId === addressId) {
        setSelectedAddressId(updated[0]?.id || null)
      }
    }
  }

  // Save Delivery Instructions inline
  const handleSaveInstruction = async (addressId) => {
    const target = addresses.find((a) => a.id === addressId)
    if (!target) return

    const updated = {
      ...target,
      delivery_instructions: instructionText.trim(),
    }
    await saveUserAddress(updated, currentUser?.id)
    await loadAddresses(currentUser)
    setInstructionsOpenId(null)
  }

  // Selected Address Object
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0]

  // Submit Final Order
  const handlePlaceOrder = async () => {
    setOrderError('')
    if (!selectedAddress) {
      setOrderError('Please select or add a delivery address first.')
      setCurrentStep(1)
      return
    }

    if (items.length === 0) {
      setOrderError('Your cart is empty.')
      return
    }

    setIsSubmittingOrder(true)
    try {
      const orderPayload = {
        user_id: currentUser?.id || null,
        customer_name: selectedAddress.full_name,
        customer_phone: selectedAddress.phone,
        customer_email: currentUser?.email || '',
        shipping_address: {
          full_name: selectedAddress.full_name,
          phone: selectedAddress.phone,
          street_address: selectedAddress.street_address,
          landmark: selectedAddress.landmark || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: 'India',
          delivery_instructions: selectedAddress.delivery_instructions || '',
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

      // Clear cart locally and from account
      useCartStore.getState().clearCart()
      closeCart()

      // Redirect to Order Confirmed
      navigate(`/order-confirmed?orderId=${order.order_number}&total=${totalAmount}&method=${paymentMethod}`)
    } catch (err) {
      console.error('Order placement failed:', err)
      setOrderError('Failed to place order. Please try again or choose another payment method.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  // If cart is completely empty, prompt with back button
  if (items.length === 0 && !isSubmittingOrder) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex flex-col justify-between">
        {/* Top Bar */}
        <div className="border-b border-gold/15 bg-charcoal/90 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gold hover:text-cream text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Store</span>
          </Link>
          <span className="font-heading text-base font-bold tracking-widest text-cream">OUTFRAME</span>
          <Link to="/" className="text-xs font-bold uppercase tracking-wider text-cream-muted hover:text-gold">
            CANCEL
          </Link>
        </div>

        <div className="mx-auto max-w-md text-center px-4 py-24">
          <div className="h-16 w-16 mx-auto rounded-full bg-charcoal flex items-center justify-center border border-gold/20 mb-4">
            <ShoppingBag className="h-8 w-8 text-gold/60" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-cream">Your Cart is Empty</h2>
          <p className="mt-2 text-sm text-cream-muted/70">
            Please add an outframed antique gold keychain to proceed with checkout.
          </p>
          <Link
            to="/"
            className="btn-gold inline-flex items-center gap-2 mt-6 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-widest"
          >
            Explore Drops
          </Link>
        </div>

        <div className="border-t border-charcoal-light py-4 text-center text-xs text-cream-muted/40">
          © 2026 Outframe Labs. All rights reserved.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian pb-24">
      {/* ═════════════════════════════════════════════════════════════
          TOP BAR: BACK ARROW + BRAND + "CANCEL"
      ═════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-obsidian/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Back button */}
            <button
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep((prev) => prev - 1)
                } else {
                  navigate(-1)
                }
              }}
              className="flex items-center gap-1.5 text-cream-muted hover:text-gold transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Brand Title */}
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-extrabold tracking-[0.2em] text-cream">
                OUTFRAME
              </span>
            </div>

            {/* CANCEL Button (Copied exactly from Image 2) */}
            <button
              onClick={() => navigate('/')}
              className="text-xs sm:text-sm font-bold tracking-wider text-cream-muted hover:text-gold uppercase transition-colors cursor-pointer"
            >
              CANCEL
            </button>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              STEPPER: ADDRESS  ──  PAYMENT  ──  CONFIRM ORDER
              (Faithfully replicated from Image 2 with our gold theme)
          ═════════════════════════════════════════════════════════════ */}
          <div className="py-3.5 border-t border-gold/10">
            <div className="flex items-center justify-between relative px-6 sm:px-10">
              {/* Connecting progress bar line */}
              <div className="absolute left-10 right-10 top-3 h-[2px] bg-charcoal-light -z-0">
                <div
                  className="h-full bg-gold transition-all duration-500 ease-out"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                  }}
                />
              </div>

              {/* Step 1: Address */}
              <button
                onClick={() => setCurrentStep(1)}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === 1
                      ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/20 shadow-md shadow-gold/30'
                      : currentStep > 1
                      ? 'bg-gold text-obsidian border-2 border-gold shadow-sm'
                      : 'bg-charcoal border-2 border-charcoal-light text-cream-muted/50'
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-3 w-3 stroke-[3]" /> : <div className="h-2 w-2 rounded-full bg-gold" />}
                </div>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold tracking-wide transition-colors ${
                    currentStep === 1 ? 'text-cream' : currentStep > 1 ? 'text-gold' : 'text-cream-muted/60'
                  }`}
                >
                  Address
                </span>
              </button>

              {/* Step 2: Payment */}
              <button
                onClick={() => {
                  if (addresses.length > 0) setCurrentStep(2)
                }}
                disabled={addresses.length === 0}
                className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === 2
                      ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/20 shadow-md shadow-gold/30'
                      : currentStep > 2
                      ? 'bg-gold text-obsidian border-2 border-gold shadow-sm'
                      : 'bg-charcoal border-2 border-charcoal-light text-cream-muted/50'
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-3 w-3 stroke-[3]" /> : <div className={`h-2 w-2 rounded-full ${currentStep === 2 ? 'bg-gold' : 'bg-transparent'}`} />}
                </div>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold tracking-wide transition-colors ${
                    currentStep === 2 ? 'text-cream' : currentStep > 2 ? 'text-gold' : 'text-cream-muted/60'
                  }`}
                >
                  Payment
                </span>
              </button>

              {/* Step 3: Confirm order */}
              <button
                onClick={() => {
                  if (addresses.length > 0 && selectedAddressId) setCurrentStep(3)
                }}
                disabled={!selectedAddressId}
                className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === 3
                      ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/20 shadow-md shadow-gold/30'
                      : 'bg-charcoal border-2 border-charcoal-light text-cream-muted/50'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${currentStep === 3 ? 'bg-gold' : 'bg-transparent'}`} />
                </div>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold tracking-wide transition-colors ${
                    currentStep === 3 ? 'text-cream' : 'text-cream-muted/60'
                  }`}
                >
                  Confirm order
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 pt-6">
        {/* User Status Bar */}
        <div className="mb-6 rounded-xl border border-gold/15 bg-charcoal/70 p-3 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs min-w-0">
              <p className="font-semibold text-cream truncate">
                {currentUser ? (
                  <>
                    Signed in as <span className="text-gold">{currentUser.name || currentUser.email}</span>
                  </>
                ) : (
                  'Guest Checkout (Addresses saved locally)'
                )}
              </p>
              {currentUser?.email && (
                <p className="text-[10px] text-cream-muted/60 truncate">{currentUser.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-[11px] text-cream-muted hover:text-gold underline cursor-pointer"
              >
                Switch
              </button>
            ) : (
              <button
                onClick={() => setIsAuthFormOpen(true)}
                className="text-[11px] font-semibold text-gold hover:text-cream border border-gold/30 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            STEP 1: SELECT A DELIVERY ADDRESS (Matched to Image 2)
        ═════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Inline Auth Form (shown when user clicks Sign In) */}
            {!currentUser && isAuthFormOpen && (
              <div className="rounded-2xl border border-gold/20 bg-charcoal/80 p-6 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between pb-3 border-b border-charcoal-light">
                  <h3 className="font-heading text-lg font-bold text-cream">
                    {authMode === 'signup' ? 'Create Outframe Account' : 'Sign in to Outframe Labs'}
                  </h3>
                  <button
                    onClick={() => setIsAuthFormOpen(false)}
                    className="text-xs text-cream-muted hover:text-cream"
                  >
                    ✕
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {authError}
                  </div>
                )}

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-charcoal-light bg-obsidian hover:border-gold/40 text-cream text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
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

                <div className="relative flex items-center justify-center my-1">
                  <div className="w-full border-t border-charcoal-light" />
                  <span className="bg-charcoal px-3 text-[10px] uppercase font-bold tracking-widest text-cream-muted/50 absolute">
                    Or with email
                  </span>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Pruthvi Patil"
                          className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn-gold w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wider mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? 'Signing in...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                      className="text-xs text-cream-muted/70 hover:text-gold"
                    >
                      {authMode === 'signup'
                        ? 'Already have an account? Sign In'
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Heading */}
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream tracking-tight">
                Select a delivery address
              </h1>
              {addresses.length > 0 && (
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gold">
                  All addresses ({addresses.length})
                </p>
              )}
            </div>

            {/* List of Saved Addresses */}
            {addressLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-cream-muted/60">
                <RefreshCw className="h-6 w-6 text-gold animate-spin" />
                <span className="text-xs tracking-wider uppercase">Loading saved addresses...</span>
              </div>
            ) : addresses.length === 0 && !isAddingNewAddress ? (
              /* No saved address: Direct prompt */
              <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-6 text-center space-y-3">
                <MapPin className="h-10 w-10 mx-auto text-gold/80" />
                <h3 className="font-heading text-lg font-bold text-cream">No saved addresses yet</h3>
                <p className="text-xs text-cream-muted/80 max-w-sm mx-auto">
                  Add your shipping address below. It will be saved permanently to your account for all future drops.
                </p>
                <button
                  onClick={() => {
                    handleResetForm()
                    setIsAddingNewAddress(true)
                  }}
                  className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id
                  const isInstructionsOpen = instructionsOpenId === addr.id

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative rounded-2xl border transition-all duration-300 p-4 sm:p-5 cursor-pointer ${
                        isSelected
                          ? 'border-gold/80 bg-charcoal shadow-xl shadow-gold/10'
                          : 'border-charcoal-light/80 bg-charcoal/50 hover:border-gold/30 hover:bg-charcoal/80'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Custom Styled Radio Button (Faithfully matched to Image 2) */}
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-gold bg-obsidian ring-2 ring-gold/40'
                                : 'border-cream-muted/40 bg-transparent'
                            }`}
                          >
                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="flex-1 min-w-0 text-left">
                          {/* Name */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-heading text-base sm:text-lg font-extrabold text-cream">
                              {addr.full_name}
                            </h3>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                                Default
                              </span>
                            )}
                          </div>

                          {/* Address lines */}
                          <p className="mt-1.5 text-xs sm:text-sm text-cream-muted/90 leading-relaxed font-sans">
                            {addr.street_address}
                            {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city.toUpperCase()},{' '}
                            {addr.state.toUpperCase()}, {addr.pincode}, India
                          </p>

                          {/* Phone number */}
                          <p className="mt-1 text-xs sm:text-sm font-medium text-cream-muted/80">
                            Phone number:{' '}
                            <span className="font-mono text-cream font-semibold">{addr.phone}</span>
                          </p>

                          {/* Saved Delivery Instructions if present */}
                          {addr.delivery_instructions && (
                            <div className="mt-2 rounded-lg bg-obsidian/70 border border-charcoal-light px-3 py-1.5 text-[11px] text-cream-muted/80 flex items-start gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-gold/80 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-gold">Instructions:</strong> {addr.delivery_instructions}
                              </span>
                            </div>
                          )}

                          {/* ══════════════════════════════════════════════════
                              ACTIONS DISPLAYED WHEN THIS ADDRESS IS SELECTED
                              (Deliver to this address + Edit address + Instructions)
                          ══════════════════════════════════════════════════ */}
                          {isSelected && (
                            <div
                              className="mt-5 pt-4 border-t border-charcoal-light/70 space-y-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Primary: Deliver to this address (Yellow / Gold button like in Image 2) */}
                              <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-gold/25 active:scale-98 cursor-pointer"
                              >
                                <span>Deliver to this address</span>
                              </button>

                              {/* Secondary: Edit address (White / bordered button like in Image 2) */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(addr)}
                                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gold/30 bg-obsidian/60 hover:bg-charcoal-light hover:border-gold py-2.5 text-xs font-bold text-cream transition-colors cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-gold" />
                                  <span>Edit address</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="rounded-xl border border-charcoal-light bg-obsidian/60 hover:bg-rose-500/20 hover:border-rose-500/40 p-2.5 text-cream-muted hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Delete address"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Auxiliary Link: Add delivery instructions */}
                              <div>
                                {!isInstructionsOpen ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInstructionsOpenId(addr.id)
                                      setInstructionText(addr.delivery_instructions || '')
                                    }}
                                    className="text-xs text-gold hover:text-yellow-200 underline tracking-wide font-medium cursor-pointer"
                                  >
                                    {addr.delivery_instructions
                                      ? 'Edit delivery instructions'
                                      : 'Add delivery instructions'}
                                  </button>
                                ) : (
                                  <div className="mt-2 p-3 rounded-xl bg-obsidian/90 border border-gold/20 space-y-2">
                                    <label className="block text-[11px] font-semibold text-cream-muted">
                                      Delivery Instructions (e.g. Leave with security / Call upon arrival)
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={instructionText}
                                      onChange={(e) => setInstructionText(e.target.value)}
                                      placeholder="Provide courier delivery guidance..."
                                      className="w-full rounded-lg border border-charcoal-light bg-charcoal px-3 py-2 text-xs text-cream focus:border-gold focus:outline-none"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setInstructionsOpenId(null)}
                                        className="text-[11px] text-cream-muted hover:text-cream px-2 py-1"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveInstruction(addr.id)}
                                        className="rounded-lg bg-gold px-3 py-1 text-[11px] font-bold text-obsidian hover:bg-gold-dark"
                                      >
                                        Save Note
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION: "Add delivery address" (Matched to Image 2)
            ═════════════════════════════════════════════════════════════ */}
            <div className="pt-6 border-t border-gold/15">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-cream mb-3">
                Add delivery address
              </h2>

              {!isAddingNewAddress ? (
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm()
                    setIsAddingNewAddress(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/30 bg-charcoal/40 hover:bg-charcoal hover:border-gold py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold transition-all duration-300 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add a new delivery address</span>
                </button>
              ) : (
                /* Interactive Address Form */
                <form
                  onSubmit={handleSaveAddress}
                  className="rounded-2xl border border-gold/30 bg-charcoal p-5 sm:p-6 space-y-4 animate-fade-in-up"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-light">
                    <h3 className="font-heading text-base font-bold text-cream">
                      {editingAddressId ? 'Edit Delivery Address' : 'New Delivery Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-xs text-cream-muted hover:text-gold"
                    >
                      Cancel
                    </button>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="e.g. 8530085116"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Flat, House no., Building, Company, Apartment *
                    </label>
                    <input
                      type="text"
                      required
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      placeholder="e.g. Jivanjyot hospital karad, Bheda Chowk"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Area, Street, Sector, Village / Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={formLandmark}
                      onChange={(e) => setFormLandmark(e.target.value)}
                      placeholder="e.g. Opposite Shivaji High School, Kival Road"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        Town / City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="e.g. Karad, Satara"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        State *
                      </label>
                      <select
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none cursor-pointer"
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Other">Other State</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        6-Digit PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formPincode}
                        onChange={(e) => setFormPincode(e.target.value)}
                        placeholder="e.g. 415110"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="makeDefaultCheckbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="accent-gold h-4 w-4 rounded cursor-pointer"
                    />
                    <label htmlFor="makeDefaultCheckbox" className="text-xs text-cream-muted cursor-pointer">
                      Use as my default delivery address
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex gap-3">
                    <button
                      type="submit"
                      disabled={formSaving}
                      className="btn-gold flex-1 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/25 active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {formSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-obsidian" />
                          <span>Saving Address...</span>
                        </>
                      ) : editingAddressId ? (
                        <span>Update & Deliver to this address</span>
                      ) : (
                        <>
                          <span>Use this address & Proceed</span>
                          <ChevronRight className="h-4 w-4 stroke-[3]" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="rounded-xl border border-charcoal-light px-5 py-3 text-xs font-bold uppercase tracking-wider text-cream-muted hover:text-cream cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════
                BOTTOM PROCEED TO PAYMENT BUTTON (Step 1)
            ═════════════════════════════════════════════════════════════ */}
            {addresses.length > 0 && !isAddingNewAddress && (
              <div className="pt-6 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAddressId) {
                      setCurrentStep(2)
                    } else if (addresses.length > 0) {
                      setSelectedAddressId(addresses[0].id)
                      setCurrentStep(2)
                    }
                  }}
                  className="btn-gold w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest shadow-2xl shadow-gold/30 cursor-pointer active:scale-98"
                >
                  <span>Proceed to Payment</span>
                  <ChevronRight className="h-4 w-4 stroke-[3]" />
                </button>
                <p className="text-center text-[11px] text-cream-muted/60 mt-2">
                  Next: Choose COD or Prepaid UPI on the next screen
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 2: PAYMENT METHOD
        ═════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Selected Address Summary Banner */}
            {selectedAddress && (
              <div className="rounded-2xl border border-gold/20 bg-charcoal/70 p-4 flex items-center justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-xs min-w-0">
                    <p className="text-cream-muted/70 text-[10px] uppercase tracking-wider font-semibold">
                      Delivering to:
                    </p>
                    <p className="font-bold text-cream truncate">{selectedAddress.full_name}</p>
                    <p className="text-cream-muted truncate">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-gold hover:text-yellow-200 underline uppercase tracking-wider shrink-0 ml-3 cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream tracking-tight">
                Select a payment method
              </h1>
              <p className="mt-1 text-xs text-cream-muted/70">
                Choose how you want to pay for your antique gold outframed keychains.
              </p>
            </div>

            {/* Payment Options Grid */}
            <div className="space-y-3">
              {/* Option 1: Cash on Delivery (COD) */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'COD'
                    ? 'border-gold bg-charcoal shadow-lg shadow-gold/10'
                    : 'border-charcoal-light/80 bg-charcoal/50 hover:border-gold/30'
                }`}
              >
                <div className="shrink-0">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'COD'
                        ? 'border-gold bg-obsidian ring-2 ring-gold/40'
                        : 'border-cream-muted/40'
                    }`}
                  >
                    {paymentMethod === 'COD' && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Banknote className="h-4 w-4 text-gold shrink-0" />
                    <span className="font-heading text-sm sm:text-base font-bold text-cream">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                </div>
              </label>

              {/* Option 2: UPI / QR / NetBanking */}
              <label
                onClick={() => setPaymentMethod('PREPAID')}
                className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'PREPAID'
                    ? 'border-gold bg-charcoal shadow-lg shadow-gold/10'
                    : 'border-charcoal-light/80 bg-charcoal/50 hover:border-gold/30'
                }`}
              >
                <div className="shrink-0">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'PREPAID'
                        ? 'border-gold bg-obsidian ring-2 ring-gold/40'
                        : 'border-cream-muted/40'
                    }`}
                  >
                    {paymentMethod === 'PREPAID' && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-heading text-sm sm:text-base font-bold text-cream">
                      UPI / Instant QR / NetBanking
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Price Preview Box */}
            <div className="rounded-2xl border border-charcoal-light bg-charcoal/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-cream-muted">
                <span>Items Total ({items.length} keychains):</span>
                <span className="font-mono text-cream font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-cream-muted">
                <span>Pan-India Courier Dispatch:</span>
                <span className="font-mono text-cream font-semibold">₹{shippingFee}</span>
              </div>
              <div className="border-t border-charcoal-light/70 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-cream">Total Payable Amount:</span>
                <span className="font-heading text-lg font-bold text-gold">₹{totalAmount}</span>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-gold/25 cursor-pointer active:scale-98"
              >
                <span>Continue to Confirm Order</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 3: CONFIRM ORDER
        ═════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream tracking-tight">
                Review & Confirm your order
              </h1>
              <p className="mt-1 text-xs text-cream-muted/70">
                Please verify your delivery address, items, and payment method before placing order.
              </p>
            </div>

            {orderError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Shipping Address Review Box */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal-light">
                <div className="flex items-center gap-2 text-gold">
                  <MapPin className="h-4 w-4" />
                  <h3 className="font-heading text-sm font-bold text-cream uppercase tracking-wide">
                    Shipping Address
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-gold hover:text-yellow-200 underline uppercase tracking-wider"
                >
                  Change
                </button>
              </div>

              {selectedAddress ? (
                <div className="mt-3 text-xs sm:text-sm space-y-1 text-cream-muted/90">
                  <p className="font-bold text-cream">{selectedAddress.full_name}</p>
                  <p>{selectedAddress.street_address}</p>
                  {selectedAddress.landmark && <p>{selectedAddress.landmark}</p>}
                  <p>
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  <p className="text-xs text-cream-muted/70 pt-1">
                    Phone: <span className="font-mono text-cream">{selectedAddress.phone}</span>
                  </p>
                  {selectedAddress.delivery_instructions && (
                    <p className="text-[11px] text-gold pt-1">
                      Note: {selectedAddress.delivery_instructions}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-rose-400">No address selected.</p>
              )}
            </div>

            {/* Payment Method Review Box */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal-light">
                <div className="flex items-center gap-2 text-gold">
                  <CreditCard className="h-4 w-4" />
                  <h3 className="font-heading text-sm font-bold text-cream uppercase tracking-wide">
                    Payment Method
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-gold hover:text-yellow-200 underline uppercase tracking-wider"
                >
                  Change
                </button>
              </div>
              <div className="mt-3 text-xs sm:text-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-cream">
                    {paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (UPI / NetBanking)'}
                  </p>
                  <p className="text-xs text-cream-muted/70">
                    {paymentMethod === 'COD'
                      ? 'Pay cash upon arrival'
                      : 'Priority dispatch from Maharashtra fulfillment hub'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-gold">₹{totalAmount}</span>
              </div>
            </div>

            {/* Items Summary Box */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal p-4 sm:p-5">
              <div className="flex items-center gap-2 text-gold pb-3 border-b border-charcoal-light">
                <ShoppingBag className="h-4 w-4" />
                <h3 className="font-heading text-sm font-bold text-cream uppercase tracking-wide">
                  Items in Order ({items.length})
                </h3>
              </div>

              <div className="divide-y divide-charcoal-light/60 mt-3">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 object-cover rounded-xl border border-gold/15 bg-obsidian shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-heading text-xs sm:text-sm font-bold text-cream truncate">
                        {item.name} Outframed Keychain
                      </p>
                      <p className="text-[11px] text-cream-muted/60">
                        Qty: <strong className="text-cream">{item.quantity}</strong> × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading text-xs sm:text-sm font-bold text-gold">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Order Price Breakdown */}
            <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-5 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-cream-muted">
                <span>Items Subtotal:</span>
                <span className="font-mono text-cream font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-cream-muted">
                <span>Standard Pan-India Shipping:</span>
                <span className="font-mono text-cream font-semibold">₹{shippingFee}</span>
              </div>
              <div className="border-t border-charcoal-light/80 pt-3 flex justify-between items-baseline">
                <span className="font-heading text-sm sm:text-base font-extrabold text-cream">
                  Total Payable Amount:
                </span>
                <span className="font-heading text-xl sm:text-2xl font-extrabold text-gold">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder}
                className="btn-gold w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest shadow-2xl shadow-gold/30 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmittingOrder ? (
                  <>
                    <RefreshCw className="h-5 w-5 text-obsidian animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 text-obsidian" />
                    <span>Confirm & Place Order · ₹{totalAmount}</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-cream-muted/50">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold/80" /> 100% Secure Checkout
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-gold/80" /> Dispatched in 24h
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
