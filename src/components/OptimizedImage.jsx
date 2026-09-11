import { useState, useEffect, useRef } from 'react'
import { getOptimizedImageUrl } from '../lib/imageOptimizer'
import { DEFAULT_FALLBACK_IMAGE } from '../store/cartStore'

/**
 * High-Performance Image Component with:
 * 1. Automatic Supabase CDN edge-cache transformation & responsive sizing
 * 2. Elegant gold/charcoal shimmer skeleton while loading
 * 3. Buttery smooth 400ms CSS fade-in on decode (no jarring pop-in)
 * 4. Automatic resilient fallback on network failure
 * 5. Native async decoding and fetchpriority support
 */
export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  width,
  quality = 80,
  priority = false,
  fallback = DEFAULT_FALLBACK_IMAGE,
  draggable = false,
  onClick,
  onLoad,
  style = {},
  ...props
}) {
  const targetSrc = getOptimizedImageUrl(src, { width, quality })
  const [currentSrc, setCurrentSrc] = useState(targetSrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  // Reset when source URL or target width changes
  useEffect(() => {
    const nextSrc = getOptimizedImageUrl(src, { width, quality })
    setCurrentSrc(nextSrc)
    setHasError(false)

    // If image is already cached in browser memory, mark loaded immediately
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true)
    } else {
      setIsLoaded(false)
    }
  }, [src, width, quality])

  const handleImageLoad = (e) => {
    setIsLoaded(true)
    if (typeof onLoad === 'function') {
      onLoad(e)
    }
  }

  const handleImageError = () => {
    // If the transformed CDN URL failed, attempt the raw URL first
    if (currentSrc !== src && src) {
      setCurrentSrc(src)
      return
    }
    // If raw URL also failed, fallback to default safe placeholder
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback)
      setHasError(true)
      setIsLoaded(true)
    }
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Luxury Charcoal/Gold Shimmer Skeleton (shown until image is loaded) */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal-light/35 to-charcoal animate-pulse z-0"
          aria-hidden="true"
        />
      )}

      {/* Main Image with smooth fade-in */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={draggable}
        onClick={onClick}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={style}
        className={`transition-opacity duration-400 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </div>
  )
}
