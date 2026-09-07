import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Star, Heart } from 'lucide-react'
import { GENRES, MOCK_PRODUCTS, useCartStore } from '../store/cartStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import ReviewsModal from '../components/ReviewsModal'
import WishlistDrawer from '../components/WishlistDrawer'

function ProductCard({ product }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const openReviews = useCartStore((s) => s.openReviews)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const isWishlisted = useCartStore((s) => s.isWishlisted(product.id))

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    addItem(product)
    openCart()
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <div
      onClick={handleCardClick}
      className="product-card group relative cursor-pointer overflow-hidden rounded-xl border border-charcoal-light/70 bg-charcoal transition-all duration-500 hover:border-gold/50 hover:shadow-xl hover:shadow-black/70 flex flex-col"
    >
      {/* Product Background Image & Wishlist Button */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-obsidian">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-60" />

        {/* Top-Right Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isWishlisted
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-md shadow-rose-500/20'
              : 'bg-obsidian/65 text-cream-muted/70 hover:text-rose-400 hover:bg-obsidian/90 border border-white/10'
          }`}
          aria-label={`Wishlist ${product.name}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-all duration-300 ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110 animate-heart-burst' : 'hover:scale-110'
            }`}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Compact Product Details: Name, Star Rating, Offer Price, and Add to Cart Button */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between bg-charcoal">
        <div>
          {/* 1. Product Name Title */}
          <h3 className="font-heading text-sm sm:text-base font-bold text-cream transition-colors group-hover:text-gold line-clamp-1">
            {product.name}
          </h3>

          {/* 2. Star Rating (Odd review count between 7-15) */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              openReviews(product)
            }}
            className="mt-0.5 flex items-center gap-1 cursor-pointer group/rating hover:opacity-90 transition-opacity"
            title="Click to view verified customer reviews"
          >
            <div className="flex items-center text-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-gold text-gold'
                      : i < product.rating
                      ? 'fill-gold/50 text-gold'
                      : 'text-charcoal-light fill-charcoal-light'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-gold">
              {product.rating}
            </span>
            <span className="text-[10px] sm:text-[11px] text-cream-muted/70 group-hover/rating:text-gold transition-colors">
              ({product.reviewCount})
            </span>
          </div>

          {/* 3. Offer Price & Original Cut MRP Side by Side */}
          <div className="mt-1.5 flex items-baseline gap-1.5 flex-nowrap overflow-hidden">
            <span className="font-heading text-sm sm:text-base font-bold text-gold shrink-0">
              ₹{product.price}
            </span>
            <span className="text-[10px] sm:text-[11px] text-cream-muted/50 line-through shrink-0">
              ₹{product.originalPrice || 459}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 shrink-0">
              {product.discountBadge || `-${product.discountPercent}%`}
            </span>
          </div>
        </div>

        {/* 4. Compact Add to Cart Button */}
        <div className="mt-2 pt-2 border-t border-charcoal-light/60">
          <button
            onClick={handleAdd}
            className="btn-gold flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide shadow-sm shadow-gold/15 transition-all duration-300 hover:shadow-gold/30 hover:scale-[1.01] active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CategoryPage() {
  const { genreSlug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [genreSlug])

  const genre = GENRES.find((g) => g.slug === genreSlug)
  const allProducts = useCartStore((s) => s.products)
  const products = genre ? allProducts.filter((p) => p.genre === genre.id) : []

  if (!genre) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-xl text-center px-4 py-32">
          <h1 className="font-heading text-4xl font-bold text-cream">Universe Not Found</h1>
          <p className="mt-3 text-cream-muted">The requested keychain category does not exist.</p>
          <Link
            to="/"
            className="btn-gold inline-flex items-center gap-2 mt-6 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
        <Footer />
        <CartDrawer />
      </div>
    )
  }

  const otherGenres = GENRES.filter((g) => g.id !== genre.id)

  return (
    <div className="min-h-screen bg-obsidian text-cream">
      <Navbar />

      {/* Category Hero Banner */}
      <section className="relative min-h-[360px] sm:min-h-[420px] flex items-end overflow-hidden pt-24 pb-12 sm:pb-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={genre.image}
            alt={genre.label}
            className="h-full w-full object-cover filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/75 to-obsidian/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/70 to-transparent" />
        </div>

        {/* Content (Eyebrow tags removed) */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="group mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-obsidian/80 px-4 py-2 text-xs font-semibold text-cream backdrop-blur-md transition-all hover:border-gold hover:bg-gold hover:text-obsidian"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>All Universes</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-cream sm:text-5xl lg:text-6xl">
                {genre.label} Outframed Keychains
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-muted sm:text-base">
                Explore hand-finished antique gold keychains breaking boundaries across the {genre.label} universe.
              </p>
            </div>

            <div className="rounded-xl border border-gold/20 bg-charcoal/80 px-4 py-2.5 backdrop-blur-sm self-start sm:self-end">
              <span className="text-xs text-cream-muted/70 block">Total Artifacts</span>
              <span className="font-heading text-lg font-bold text-gold">
                {products.length} Designs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Other Universes Switcher */}
          <div className="mt-20 pt-10 border-t border-gold/15">
            <h3 className="font-heading text-xl font-bold text-cream mb-4">
              Explore More Universes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {otherGenres.map((og) => (
                <button
                  key={og.id}
                  onClick={() => {
                    navigate(`/${og.slug}`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="group relative overflow-hidden rounded-xl border border-charcoal-light/70 bg-charcoal p-4 text-left transition-all duration-300 hover:border-gold/50 hover:bg-charcoal-light"
                >
                  <span className="font-heading text-base sm:text-lg font-bold text-cream group-hover:text-gold transition-colors">
                    {og.label} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CartDrawer />
      <ReviewsModal />
      <WishlistDrawer />
    </div>
  )
}
