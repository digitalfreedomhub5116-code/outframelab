import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShoppingBag, Star, Heart, Sparkles } from 'lucide-react'
import { GENRES, MOCK_PRODUCTS, useCartStore } from '../store/cartStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import ReviewsModal from '../components/ReviewsModal'
import WishlistDrawer from '../components/WishlistDrawer'

const GENRE_COMING_SOON_GIFS = {
  MARVEL: 'https://media.tenor.com/cUDKyJkDr6kAAAAM/iron-man-iron-man-hammer.gif',
  DC: 'https://media.tenor.com/AteWDUebhk4AAAAM/3dprint-3d-printing.gif',
  ANIME: 'https://media.tenor.com/A8rfrx1u11YAAAAM/forge-blacksmiths.gif',
  CARS: 'https://media.tenor.com/AteWDUebhk4AAAAM/3dprint-3d-printing.gif',
  VALORANT: 'https://media.tenor.com/AteWDUebhk4AAAAM/3dprint-3d-printing.gif',
  DEFAULT: 'https://media.tenor.com/AteWDUebhk4AAAAM/3dprint-3d-printing.gif',
}

function ProductCard({ product }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const openReviews = useCartStore((s) => s.openReviews)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const isWishlisted = useCartStore((s) => s.isWishlisted(product.id))
  const isOutOfStock = product.inStock === false

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    if (isOutOfStock) return
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
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
            isOutOfStock ? 'opacity-70 grayscale-[25%]' : ''
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-60" />

        {/* Out of Stock badge on image */}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-black/85 backdrop-blur-md text-rose-400 border border-rose-500/50 shadow-md">
              Out of Stock
            </span>
          </div>
        )}

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

        {/* 4. Compact Add to Cart / Out of Stock Button */}
        <div className="mt-2 pt-2 border-t border-charcoal-light/60">
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
              isOutOfStock
                ? 'bg-charcoal-light/60 text-cream-muted/50 border border-charcoal-light/80 cursor-not-allowed'
                : 'btn-gold shadow-sm shadow-gold/15 hover:shadow-gold/30 hover:scale-[1.01] active:scale-95'
            }`}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
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
  const products = genre ? allProducts.filter((p) => p.genre === genre.id && !p.isHidden) : []

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
              <span className="text-xs text-cream-muted/70 block">
                {products.length > 0 ? 'Total Artifacts' : 'Collection Status'}
              </span>
              <span className="font-heading text-lg font-bold text-gold flex items-center gap-1.5">
                {products.length > 0 ? (
                  `${products.length} Designs`
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-gold animate-pulse" />
                    <span>Coming Soon</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            /* Products Grid */
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Coming Soon Showcase with High-Quality GIF */
            <div className="my-4 mx-auto max-w-2xl rounded-3xl border border-gold/30 bg-charcoal/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-md relative overflow-hidden">
              {/* Background ambient gold glow */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

              {/* Glowing pill badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold mb-6 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-gold animate-spin" />
                <span>In The Workshop · Coming Soon</span>
              </div>

              {/* Animated GIF Container */}
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-gold/30 shadow-2xl shadow-black/90 bg-obsidian group">
                <img
                  src={GENRE_COMING_SOON_GIFS[genre.id] || GENRE_COMING_SOON_GIFS.DEFAULT}
                  alt={`${genre.label} designs crafting soon`}
                  className="w-full h-56 sm:h-64 object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[11px] text-cream-muted/90 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                  <span className="font-mono text-gold flex items-center gap-1.5 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
                    3D Printing in Progress
                  </span>
                  <span className="font-medium text-cream/80">Antique Gold Finish</span>
                </div>
              </div>

              {/* Heading & Subtitle */}
              <h2 className="mt-7 font-heading text-2xl sm:text-3xl font-bold text-cream">
                {genre.label} Artifacts Are Forging
              </h2>
              <p className="mt-3 max-w-lg mx-auto text-sm sm:text-base leading-relaxed text-cream-muted/80">
                Our 3D print lab is currently designing and prototyping brand new outframed keychains for the{' '}
                <strong className="text-gold font-semibold">{genre.label}</strong> universe. Check back soon for the next drop!
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/"
                  className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-lg shadow-gold/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Browse All Keychains</span>
                </Link>
                {otherGenres.length > 0 && (
                  <button
                    onClick={() => {
                      const el = document.getElementById('explore-other-genres')
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-charcoal px-6 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-obsidian"
                  >
                    <span>Explore Other Universes</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Other Universes Switcher */}
          <div id="explore-other-genres" className="mt-20 pt-10 border-t border-gold/15">
            <h3 className="font-heading text-xl font-bold text-cream mb-4">
              Explore More Universes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {otherGenres.map((og) => {
                const ogCount = allProducts.filter((p) => p.genre === og.id && !p.isHidden).length
                return (
                  <button
                    key={og.id}
                    onClick={() => {
                      navigate(`/${og.slug}`)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="group relative overflow-hidden rounded-xl border border-charcoal-light/70 bg-charcoal p-4 text-left transition-all duration-300 hover:border-gold/50 hover:bg-charcoal-light flex items-center justify-between"
                  >
                    <div>
                      <span className="font-heading text-base sm:text-lg font-bold text-cream group-hover:text-gold transition-colors block">
                        {og.label}
                      </span>
                      <span className="text-[11px] text-cream-muted/60">
                        {ogCount > 0 ? `${ogCount} Designs` : 'Coming Soon'}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-cream-muted/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })}
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
