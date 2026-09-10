import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Share2,
  Heart,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from 'lucide-react'
import { MOCK_PRODUCTS, useCartStore, GENRES } from '../store/cartStore'
import { buildProductReviews } from '../data/productsData'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'

export default function ProductPage() {
  const { productIdOrSlug } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)

  const allProducts = useCartStore((s) => s.products)

  // Find product by id or slug from store
  const storeProduct = (allProducts || []).find(
    (p) => String(p.id) === String(productIdOrSlug) || p.slug === productIdOrSlug
  )

  // Find fallback from default MOCK_PRODUCTS
  const mockFallback = MOCK_PRODUCTS.find(
    (m) => String(m.id) === String(productIdOrSlug) || m.slug === productIdOrSlug ||
           (storeProduct && (String(m.id) === String(storeProduct.id) || m.slug === storeProduct.slug))
  )

  const raw = storeProduct || mockFallback

  const product = raw
    ? {
        ...mockFallback,
        ...raw,
        name: raw.name || mockFallback?.name || 'Outframed Keychain',
        fullName: raw.fullName || mockFallback?.fullName || `${raw.name || 'Outframed'} Keychain`,
        genre: raw.genre || mockFallback?.genre || 'MARVEL',
        price: Number(raw.price) || mockFallback?.price || 299,
        originalPrice: Number(raw.originalPrice) || mockFallback?.originalPrice || 599,
        discountBadge: raw.discountBadge || mockFallback?.discountBadge || '-46%',
        discountPercent: raw.discountPercent || mockFallback?.discountPercent || 46,
        description: raw.description || mockFallback?.description || `Handcrafted antique gold ${raw.name} outframed keychain.`,
        features: Array.isArray(raw.features) && raw.features.length > 0 ? raw.features : (mockFallback?.features || []),
        rating: Number(raw.rating) || mockFallback?.rating || 4.8,
        reviewCount: Number(raw.reviewCount) || mockFallback?.reviewCount || 12,
        reviews: Array.isArray(raw.reviews) && raw.reviews.length > 0
          ? raw.reviews
          : (mockFallback?.reviews || buildProductReviews(raw)),
        gallery: Array.isArray(raw.gallery) && raw.gallery.length > 0
          ? raw.gallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
          : (mockFallback?.gallery || (raw.image && !raw.image.includes('photo-1618354691373-d851c5c3a990') ? [raw.image] : [mockFallback?.image || 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg'])),
        inStock: raw.inStock !== false,
        isHidden: raw.isHidden === true,
      }
    : null

  const reviews = Array.isArray(product?.reviews) ? product.reviews : []
  const rawGallery = Array.isArray(product?.gallery) && product.gallery.length > 0 ? product.gallery : []
  const cleanProductGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
  const gallery = cleanProductGallery.length > 0
    ? cleanProductGallery
    : (product?.image && !product.image.includes('photo-1618354691373-d851c5c3a990') ? [product.image] : [mockFallback?.image || 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg'])

  const isWishlisted = useCartStore((s) => (product ? s.isWishlisted(product.id) : false))

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('image')
  const [isCopied, setIsCopied] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)

  const imageSectionRef = useRef(null)
  const descSectionRef = useRef(null)
  const reviewsSectionRef = useRef(null)
  const lastScrollY = useRef(0)

  // Slider Ref & Interaction State
  const sliderRef = useRef(null)
  const isMouseDown = useRef(false)
  const mouseStartX = useRef(0)
  const scrollLeftStart = useRef(0)
  const hasMovedMouse = useRef(false)
  const isProgrammaticScroll = useRef(false)
  const programmaticScrollTimer = useRef(null)

  // Smoothly scroll to a specific image index
  const scrollToIndex = (index) => {
    const el = sliderRef.current
    if (!el) return
    const bounded = Math.max(0, Math.min(gallery.length - 1, index))
    setActiveImageIndex(bounded)
    isProgrammaticScroll.current = true
    if (programmaticScrollTimer.current) {
      clearTimeout(programmaticScrollTimer.current)
    }
    el.scrollTo({
      left: bounded * el.clientWidth,
      behavior: 'smooth',
    })
    programmaticScrollTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false
    }, 450)
  }

  const handleNextImage = () => {
    if (!gallery.length) return
    const nextIndex = (activeImageIndex + 1) % gallery.length
    scrollToIndex(nextIndex)
  }

  const handlePrevImage = () => {
    if (!gallery.length) return
    const prevIndex = (activeImageIndex - 1 + gallery.length) % gallery.length
    scrollToIndex(prevIndex)
  }

  // Native scroll listener: updates active indicator and thumbnails as user swipes
  const handleSliderScroll = () => {
    if (isProgrammaticScroll.current) return
    const el = sliderRef.current
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (index !== activeImageIndex && index >= 0 && index < gallery.length) {
      setActiveImageIndex(index)
    }
  }

  // Desktop mouse dragging support
  const handleMouseDown = (e) => {
    const el = sliderRef.current
    if (!el) return
    isMouseDown.current = true
    hasMovedMouse.current = false
    mouseStartX.current = e.pageX - el.offsetLeft
    scrollLeftStart.current = el.scrollLeft
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'
  }

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return
    const el = sliderRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = x - mouseStartX.current
    if (Math.abs(walk) > 4) {
      hasMovedMouse.current = true
    }
    el.scrollLeft = scrollLeftStart.current - walk
  }

  const handleMouseUpOrLeave = () => {
    if (!isMouseDown.current) return
    isMouseDown.current = false
    const el = sliderRef.current
    if (!el) return
    el.style.scrollSnapType = 'x mandatory'
    el.style.scrollBehavior = 'smooth'
    if (hasMovedMouse.current) {
      const index = Math.round(el.scrollLeft / el.clientWidth)
      const bounded = Math.max(0, Math.min(gallery.length - 1, index))
      scrollToIndex(bounded)
    }
  }

  // Keep carousel aligned on screen resize
  useEffect(() => {
    const handleResize = () => {
      const el = sliderRef.current
      if (!el || el.clientWidth === 0) return
      el.scrollTo({
        left: activeImageIndex * el.clientWidth,
        behavior: 'instant',
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeImageIndex])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setActiveImageIndex(0)
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'instant' })
    }
    setShowAllReviews(false)
    setShowNavbar(true)
    lastScrollY.current = 0
  }, [productIdOrSlug])

  // Combined scroll handler: Scroll-spy + Smart auto-hide top Navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY)

      // 1. Auto-hide Navbar on scroll down, reappear on scroll up
      if (currentScrollY <= 30) {
        setShowNavbar(true)
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling DOWN -> hide top bar
        setShowNavbar(false)
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling UP -> reveal top bar
        setShowNavbar(true)
      }
      lastScrollY.current = currentScrollY

      // 2. Active sticky tab Scroll-Spy
      const scrollPos = currentScrollY + 140
      const revTop = reviewsSectionRef.current?.offsetTop || Infinity
      const descTop = descSectionRef.current?.offsetTop || Infinity

      if (scrollPos >= revTop) {
        setActiveTab('reviews')
      } else if (scrollPos >= descTop) {
        setActiveTab('description')
      } else {
        setActiveTab('image')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!product || product.isHidden) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-xl text-center px-4 py-36">
          <h1 className="font-heading text-4xl font-bold text-cream">Product Unavailable</h1>
          <p className="mt-3 text-cream-muted">
            {product?.isHidden
              ? 'This product is currently hidden from the public catalog.'
              : 'This outframed keychain could not be located.'}
          </p>
          <Link
            to="/"
            className="btn-gold inline-flex items-center gap-2 mt-6 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>
        <Footer />
        <CartDrawer />
        <WishlistDrawer />
      </div>
    )
  }

  const isOutOfStock = product.inStock === false

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product)
    openCart()
  }

  const scrollToSection = (section) => {
    setActiveTab(section)
    if (section === 'image') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (section === 'description') {
      descSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (section === 'reviews') {
      reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.fullName,
        text: `Check out the ${product.fullName} on Outframe Labs`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const relatedProducts = (allProducts || []).filter(
    (p) => p.genre && product?.genre && p.genre === product.genre && String(p.id) !== String(product.id) && !p.isHidden
  ).slice(0, 4)

  const genreData = GENRES.find((g) => g.id === product?.genre)

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian pb-20 sm:pb-0">
      <Navbar visible={showNavbar} />

      {/* Amazon-style Sticky Sub-Header Tabs (Image, Description, Reviews) */}
      <div
        className={`sticky z-40 border-b border-gold/15 bg-obsidian/95 backdrop-blur-md transition-all duration-300 ease-out ${
          showNavbar ? 'top-16 sm:top-18' : 'top-0 shadow-lg shadow-black/40'
        }`}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1 sm:gap-4 py-2 flex-shrink-0">
              {[
                { id: 'image', label: 'Image' },
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${reviews.length || product.reviewCount || 12})` },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`relative px-2.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'text-gold'
                        : 'text-cream-muted/70 hover:text-cream'
                    }`}
                  >
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {isActive && (
                      <span className="absolute inset-x-2 bottom-0 h-0.5 bg-gold shadow-sm shadow-gold" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Back link */}
            <Link
              to={genreData ? `/${genreData.slug}` : '/'}
              className="text-xs text-cream-muted/60 hover:text-gold transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 pl-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to</span> {genreData ? genreData.label : 'Store'}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-cream-muted/60 mb-6">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          {genreData && (
            <>
              <Link to={`/${genreData.slug}`} className="hover:text-gold transition-colors">
                {genreData.label}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-cream truncate max-w-[200px] sm:max-w-none">{product.fullName}</span>
        </div>

        {/* Top Product Section: Image Gallery (Left) + Purchase Details (Right) */}
        <div ref={imageSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Image Gallery (Amazon Display Style) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Vertical Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none">
              {gallery.map((imgUrl, index) => {
                const isSelected = activeImageIndex === index
                return (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-charcoal ${
                      isSelected
                        ? 'border-gold shadow-md shadow-gold/30 scale-105 ring-2 ring-gold/40'
                        : 'border-charcoal-light/70 hover:border-gold/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                )
              })}
            </div>

            {/* Main Image Display Carousel */}
            <div
              className="relative flex-1 aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden border border-charcoal-light/80 bg-charcoal shadow-2xl shadow-black/80 group select-none"
            >
              {/* Native Snap Scrollable Track (Fluid swipe, 100% immune to getting stuck in between) */}
              <div
                ref={sliderRef}
                onScroll={handleSliderScroll}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none overscroll-x-contain cursor-grab active:cursor-grabbing"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="w-full min-w-full h-full flex-shrink-0 snap-start snap-always relative"
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.fullName} view ${index + 1}`}
                      className="h-full w-full object-cover select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Prev / Next Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevImage()
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-gold hover:bg-obsidian backdrop-blur-md transition-all shadow-md active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextImage()
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-gold hover:bg-obsidian backdrop-blur-md transition-all shadow-md active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Floating Actions (Share & Wishlist) */}
              <div
                className="absolute top-4 right-4 flex flex-col gap-2 z-10"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
                  }}
                  className="p-2.5 rounded-full bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-gold hover:bg-obsidian backdrop-blur-md transition-all"
                  title="Share product"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleWishlist(product)
                  }}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                    isWishlisted
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/25'
                      : 'bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-rose-400 hover:bg-obsidian'
                  }`}
                  title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isWishlisted ? 'fill-rose-500 text-rose-500 scale-115 animate-heart-burst' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Share confirmation toast */}
              {isCopied && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-obsidian shadow-lg z-20">
                  Link copied to clipboard!
                </div>
              )}

              {/* Gallery Image Indicator Dots */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-gold/20 z-10"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      scrollToIndex(i)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImageIndex === i ? 'w-5 bg-gold' : 'w-1.5 bg-cream-muted/40 hover:bg-cream'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Box */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Product Full Name Title */}
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-cream leading-tight">
                {product.fullName}
              </h1>

              {/* Ratings and Reviews Bar (Amazon-style) */}
              <div
                onClick={() => scrollToSection('reviews')}
                className="mt-3 inline-flex items-center gap-2.5 cursor-pointer group/rate"
              >
                <div className="flex items-center text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 4.8)
                          ? 'fill-gold text-gold'
                          : i < (product.rating || 4.8)
                          ? 'fill-gold/50 text-gold'
                          : 'text-charcoal-light fill-charcoal-light'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gold">
                  {product.rating || 4.8}
                </span>
                <span className="text-xs text-cream-muted/80 underline decoration-gold/40 group-hover/rate:text-gold transition-colors">
                  {reviews.length || product.reviewCount || 12} verified customer ratings
                </span>
              </div>

              {/* Pricing Section (Side by side with clean -X% text, no green border) */}
              <div className="mt-6 p-4 rounded-2xl border border-gold/20 bg-charcoal/60 backdrop-blur-sm">
                <div className="flex items-baseline gap-2.5 sm:gap-3 flex-nowrap">
                  <span className="font-heading text-3xl sm:text-4xl font-extrabold text-gold">
                    ₹{product.price}
                  </span>
                  <span className="text-sm sm:text-base text-cream-muted/50 line-through">
                    M.R.P.: ₹{product.originalPrice}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400">
                    {product.discountBadge || `-${product.discountPercent}%`}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-cream-muted/60">
                  Inclusive of all taxes. Standard Pan-India Shipping: ₹60.
                </p>

                {/* Stock status */}
                {!isOutOfStock ? (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>In Stock · Dispatched in 24 Hours</span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Currently Out of Stock · Check back soon</span>
                  </div>
                )}
              </div>

              {/* Key Features Bullet List (Requested by user) */}
              <div className="mt-6 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold">
                  Key Specifications
                </h4>
                <ul className="space-y-2 text-sm text-cream-muted">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>Each keychain is made from bio degradable PLA material.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>Strong and durable keyring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>Antique gold finish</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>Durable impact-resistant outframed body</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>Dimensions: <strong className="text-cream">64mm * 43mm</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Desktop Add to Cart Button */}
            <div className="mt-8 pt-6 border-t border-charcoal-light/80">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                  isOutOfStock
                    ? 'bg-charcoal-light/60 text-cream-muted/50 border border-charcoal-light/80 cursor-not-allowed'
                    : 'btn-gold shadow-xl shadow-gold/25 hover:shadow-gold/45 active:scale-98'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              {/* Assurance Trust Badges */}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-charcoal/40 border border-charcoal-light/50">
                  <Truck className="h-4 w-4 mx-auto text-gold mb-1" />
                  <span className="text-[10px] text-cream-muted/70 block">Fast Pan-India Delivery</span>
                </div>
                <div className="p-2 rounded-xl bg-charcoal/40 border border-charcoal-light/50">
                  <ShieldCheck className="h-4 w-4 mx-auto text-gold mb-1" />
                  <span className="text-[10px] text-cream-muted/70 block">Solid Quality Guarantee</span>
                </div>
                <div className="p-2 rounded-xl bg-charcoal/40 border border-charcoal-light/50">
                  <RotateCcw className="h-4 w-4 mx-auto text-gold mb-1" />
                  <span className="text-[10px] text-cream-muted/70 block">Easy Replacement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Dedicated Description Tab / Content */}
        <div ref={descSectionRef} className="mt-20 pt-10 border-t border-gold/15 scroll-mt-14 sm:scroll-mt-16">
          <div className="max-w-4xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
              Product Description
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream-muted/90">
              {product.description}
            </p>

            {/* Full Specifications Table */}
            <div className="mt-8 rounded-2xl border border-charcoal-light bg-charcoal/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal-light bg-obsidian/60">
                <h3 className="font-heading text-base font-bold text-cream">
                  Technical Specifications
                </h3>
              </div>
              <div className="divide-y divide-charcoal-light/70 text-sm">
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Dimensions</span>
                  <span className="col-span-2 font-semibold text-cream">64mm * 43mm</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Material</span>
                  <span className="col-span-2 font-semibold text-cream">Biodegradable PLA Material</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Color & Finish</span>
                  <span className="col-span-2 font-semibold text-cream">Antique Gold Finish with Protective Patina</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Keyring Type</span>
                  <span className="col-span-2 font-semibold text-cream">Strong and Durable Keyring (Split Ring + Chain)</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Durability</span>
                  <span className="col-span-2 font-semibold text-cream">Impact resistant daily carry</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Universe / Genre</span>
                  <span className="col-span-2 font-semibold text-cream">{genreData ? genreData.label : product.genre}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Customer Reviews (Amazon Style with Indian English Reviews) */}
        <div ref={reviewsSectionRef} className="mt-20 pt-10 border-t border-gold/15 scroll-mt-14 sm:scroll-mt-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
                Customer Reviews
              </h2>
              <p className="mt-1 text-sm text-cream-muted/70">
                Verified buyer feedback on the {product.fullName}
              </p>
            </div>

            {/* Overall Rating Box */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gold/20 bg-charcoal/80">
              <div className="text-center">
                <span className="font-heading text-4xl font-extrabold text-gold block">
                  {product.rating || 4.8}
                </span>
                <span className="text-[11px] text-cream-muted/60">out of 5</span>
              </div>
              <div className="border-l border-charcoal-light pl-4">
                <div className="flex items-center text-gold mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 4.8)
                          ? 'fill-gold text-gold'
                          : i < (product.rating || 4.8)
                          ? 'fill-gold/50 text-gold'
                          : 'text-charcoal-light fill-charcoal-light'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-cream">
                  {reviews.length || product.reviewCount || 12} customer ratings
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-charcoal-light/70 bg-charcoal/60 p-5 transition-all hover:border-gold/30 hover:bg-charcoal"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-bold text-xs">
                      {(rev.name || 'C').charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-cream block leading-snug">
                        {rev.name}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-cream-muted/40">
                    {rev.date}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-3 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < (rev.rating || 5)
                          ? 'fill-gold text-gold'
                          : 'text-charcoal-light fill-charcoal-light'
                      }`}
                    />
                  ))}
                </div>

                {/* Casual Indian English Review text (zero hyphens, commas, periods) */}
                <p className="mt-2.5 text-sm text-cream-muted/90 leading-relaxed font-sans">
                  {rev.text}
                </p>
              </div>
            ))}
          </div>

          {/* View More Button */}
          {reviews.length > 3 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAllReviews((prev) => !prev)}
                className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-charcoal/80 px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold shadow-lg shadow-black/40 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-obsidian hover:shadow-xl hover:shadow-gold/25 active:scale-95"
              >
                <span>{showAllReviews ? 'Show Less' : 'View More'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    showAllReviews ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Customers Also Bought / Related Keychains */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-10 border-t border-gold/15">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-cream mb-6">
              More from {genreData ? genreData.label : 'Universe'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/product/${rel.slug}`)}
                  className="product-card group relative cursor-pointer overflow-hidden rounded-2xl border border-charcoal-light/70 bg-charcoal p-3 transition-all hover:border-gold/50"
                >
                  <div className="aspect-[4/5] rounded-xl overflow-hidden bg-obsidian mb-3">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-cream group-hover:text-gold transition-colors line-clamp-1">
                    {rel.name}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1.5 flex-nowrap">
                    <span className="font-heading text-sm font-bold text-gold shrink-0">
                      ₹{rel.price}
                    </span>
                    <span className="text-[11px] text-cream-muted/50 line-through shrink-0">
                      ₹{rel.originalPrice}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                      {rel.discountBadge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom "Add to Cart" Bar for Mobile (Inspired by Amazon screenshot) */}
      <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t border-gold/20 bg-obsidian/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5 flex-nowrap">
              <span className="font-heading text-xl font-extrabold text-gold">
                ₹{product.price}
              </span>
              <span className="text-xs text-cream-muted/50 line-through">
                ₹{product.originalPrice}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {product.discountBadge}
              </span>
            </div>
            <span className={`text-[10px] font-semibold block ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOutOfStock ? 'Currently Out of Stock' : 'In Stock · ₹60 Shipping'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider ${
              isOutOfStock
                ? 'bg-charcoal-light/60 text-cream-muted/50 border border-charcoal-light/80 cursor-not-allowed'
                : 'btn-gold shadow-lg shadow-gold/20'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  )
}
