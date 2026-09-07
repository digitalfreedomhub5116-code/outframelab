import { Star, X, CheckCircle2, ChevronDown } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useState, useEffect } from 'react'

export default function ReviewsModal() {
  const activeProduct = useCartStore((s) => s.activeReviewProduct)
  const closeReviews = useCartStore((s) => s.closeReviews)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setShowAll(false)
  }, [activeProduct])

  useEffect(() => {
    if (activeProduct) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeProduct])

  if (!activeProduct) return null

  const reviews = activeProduct.reviews || []
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeReviews}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-gold/30 bg-charcoal shadow-2xl shadow-black overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/15 px-6 py-4 bg-obsidian/70">
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-cream">
              {activeProduct.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(activeProduct.rating)
                        ? 'fill-gold text-gold'
                        : i < activeProduct.rating
                        ? 'fill-gold/50 text-gold'
                        : 'text-charcoal-light fill-charcoal-light'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gold">
                {activeProduct.rating}
              </span>
              <span className="text-xs text-cream-muted/70">
                ({activeProduct.reviewCount} customer reviews)
              </span>
            </div>
          </div>

          <button
            onClick={closeReviews}
            className="rounded-full p-2 text-cream-muted/60 transition-colors hover:bg-charcoal hover:text-cream"
            aria-label="Close reviews"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {visibleReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-charcoal-light/70 bg-obsidian/50 p-4 transition-all hover:border-gold/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-cream">
                    {rev.name}
                  </span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-cream-muted/40">
                  {rev.date}
                </span>
              </div>

              {/* Review Stars */}
              <div className="flex items-center gap-1 mt-1.5 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < rev.rating
                        ? 'fill-gold text-gold'
                        : 'text-charcoal-light fill-charcoal-light'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text: Casual Indian English with NO hyphens, commas, periods */}
              <p className="mt-2 text-xs sm:text-sm text-cream-muted/90 leading-relaxed font-sans">
                {rev.text}
              </p>
            </div>
          ))}

          {/* View More Button */}
          {reviews.length > 3 && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-obsidian px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-obsidian active:scale-95"
              >
                <span>{showAll ? 'Show Less' : 'View More'}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                    showAll ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gold/10 px-6 py-3 bg-obsidian/40 text-center">
          <p className="text-[11px] text-cream-muted/50">
            {showAll
              ? `Showing all ${reviews.length} verified buyer ratings`
              : `Showing 3 of ${reviews.length} verified buyer ratings`}
          </p>
        </div>
      </div>
    </div>
  )
}
