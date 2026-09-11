/**
 * Image Optimizer Utility for Outframe Labs
 * 
 * Routes Supabase Storage image URLs through Supabase's image transformation CDN endpoint:
 *   /storage/v1/object/public/...  -->  /storage/v1/render/image/public/...?width=...&quality=...
 * 
 * Benefits:
 * 1. Reduces payload size by 65-85% (e.g. 266KB -> 25-60KB).
 * 2. Enables Cloudflare Edge Caching (Cache-Control: public, max-age=3600, cf-cache-status: HIT).
 * 3. Prevents re-downloading on every page visit or navigation.
 */

export const IMAGE_SIZES = {
  THUMBNAIL: { width: 160, quality: 75 },
  CARD: { width: 450, quality: 80 },
  HERO: { width: 800, quality: 85 },
  FULL: { width: 1200, quality: 85 },
}

/**
 * Returns an optimized CDN URL with specified width and compression quality.
 * 
 * @param {string} url - Original image URL
 * @param {Object} [options] - Options object
 * @param {number} [options.width] - Desired width in pixels
 * @param {number} [options.quality=80] - Image quality (1-100)
 * @returns {string} Optimized URL or original if transformation is not applicable
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url

  const { width, quality = 80 } = options

  // Handle Supabase Storage Public URLs
  if (url.includes('/storage/v1/object/public/')) {
    const baseUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    )
    const params = new URLSearchParams()
    if (width) params.set('width', String(Math.round(width)))
    if (quality) params.set('quality', String(quality))
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  // Already transformed Supabase URL (just update params if needed)
  if (url.includes('/storage/v1/render/image/public/')) {
    try {
      const u = new URL(url)
      if (width) u.searchParams.set('width', String(Math.round(width)))
      if (quality) u.searchParams.set('quality', String(quality))
      return u.toString()
    } catch {
      return url
    }
  }

  // Handle Unsplash Images
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url)
      if (width) u.searchParams.set('w', String(Math.round(width)))
      u.searchParams.set('q', String(quality))
      u.searchParams.set('auto', 'format')
      return u.toString()
    } catch {
      return url
    }
  }

  return url
}
