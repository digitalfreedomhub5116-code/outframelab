import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore, GENRES } from '../store/cartStore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentCustomer, initAuthListener } from '../lib/db'
import AuthModal from './AuthModal'

function CartItem({ item }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const genreData = GENRES.find((g) => g.id === item.genre)

  return (
    <div className="flex gap-3.5 rounded-xl border border-charcoal-light/60 bg-charcoal/80 p-3">
      {/* Thumbnail */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gold/15 bg-obsidian">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <div>
              {genreData && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-gold">
                  {genreData.label}
                </span>
              )}
              <h4 className="font-heading text-sm font-semibold text-cream leading-snug">
                {item.name}
              </h4>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="ml-2 rounded-full p-1 text-cream-muted/40 transition-colors hover:bg-charcoal-light hover:text-cream"
              aria-label="Remove item"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 rounded-full border border-charcoal-light bg-obsidian px-1.5 py-0.5">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="rounded-full p-1 text-cream-muted transition-colors hover:text-gold"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[1.25rem] text-center text-xs font-semibold text-cream">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="rounded-full p-1 text-cream-muted transition-colors hover:text-gold"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-sm font-bold text-gold">
              ₹{item.price * item.quantity}
            </span>
            <span className="text-[11px] text-cream-muted/40 line-through">
              ₹{(item.originalPrice || 459) * item.quantity}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const navigate = useNavigate()
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => getCurrentCustomer())
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // Listen for auth changes
  useEffect(() => {
    const unsub = initAuthListener((user) => {
      setCurrentUser(user)
      // If user just signed in while auth modal is open, auto-proceed to checkout
      if (user && isAuthOpen) {
        setIsAuthOpen(false)
        closeCart()
        navigate('/checkout')
      }
    })
    return () => unsub && unsub()
  }, [isAuthOpen])

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      requestAnimationFrame(() => setAnimating(true))
      document.body.style.overflow = 'hidden'
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 350)
      document.body.style.overflow = ''
      return () => clearTimeout(timer)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!visible) return null

  const total = getTotal()
  const count = getItemCount()
  const originalTotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || 459) * item.quantity,
    0
  )
  const totalSavings = originalTotal - total

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-charcoal shadow-2xl shadow-black/80 border-l border-gold/15 transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-heading text-lg font-semibold text-cream">Your Cart</h2>
            {count > 0 && (
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold border border-gold/20">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-cream-muted transition-colors hover:bg-charcoal-light hover:text-cream"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-16 w-16 text-charcoal-light" strokeWidth={1} />
              <p className="font-heading text-lg font-semibold text-cream-muted/60">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-cream-muted/40">
                Grab an antique gold keychain at ₹189 offer.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 rounded-full border border-gold/30 px-6 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold/10"
              >
                Explore Drops
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gold/10 px-5 py-5 bg-obsidian/40">
            {/* Subtotal & Savings */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-cream-muted">Subtotal</span>
              <div className="text-right">
                <span className="font-heading text-lg font-bold text-cream">₹{total}</span>
                <span className="ml-2 text-xs text-cream-muted/50 line-through">₹{originalTotal}</span>
              </div>
            </div>

            {/* Shipping */}
            <div className="mb-2 flex items-center justify-between text-xs text-cream-muted">
              <span>Standard Shipping</span>
              <span className="font-semibold text-cream">₹60</span>
            </div>

            {totalSavings > 0 && (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                <span className="text-xs font-semibold text-emerald-400">Total Savings</span>
                <span className="text-xs font-bold text-emerald-400">Save ₹{totalSavings}</span>
              </div>
            )}

            {/* Total */}
            <div className="mb-3 pt-2 border-t border-charcoal-light/70 flex items-center justify-between">
              <span className="text-sm font-semibold text-cream">Estimated Total</span>
              <span className="font-heading text-xl font-bold text-gold">₹{total + 60}</span>
            </div>

            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthOpen(true)
                  return
                }
                closeCart()
                navigate('/checkout')
              }}
              className="btn-gold w-full rounded-full py-3.5 text-sm font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-gold/20 active:scale-98"
            >
              {currentUser ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </button>
            <button
              onClick={closeCart}
              className="mt-3 w-full rounded-full py-2.5 text-center text-xs font-medium text-cream-muted transition-colors hover:text-gold cursor-pointer"
            >
              ← Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal — shown when guest tries to checkout */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user)
          setIsAuthOpen(false)
          closeCart()
          navigate('/checkout')
        }}
      />
    </div>
  )
}
