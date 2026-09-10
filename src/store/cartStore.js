import { create } from 'zustand'
import { MOCK_PRODUCTS, GENRES, buildProductReviews } from '../data/productsData'
import { getLocalCart, saveCartToAccount, saveProduct, deleteProductFromDb } from '../lib/db'

const LOCAL_STORAGE_PRODUCTS_KEY = 'outframe_labs_products'

export const DEFAULT_FALLBACK_IMAGE = 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg'

export const resolveProductImage = (item, catalog = []) => {
  if (!item) return DEFAULT_FALLBACK_IMAGE
  const isShirt = (url) => typeof url === 'string' && url.includes('photo-1618354691373-d851c5c3a990')
  const clean = (url) => (url && !isShirt(url) ? url : null)

  const match = catalog?.find(
    (p) =>
      String(p.id) === String(item.id || item.product_id) ||
      (item.name && p.name && p.name.toLowerCase() === item.name.toLowerCase())
  ) || MOCK_PRODUCTS.find(
    (p) =>
      String(p.id) === String(item.id || item.product_id) ||
      (item.name && p.name && p.name.toLowerCase() === item.name.toLowerCase())
  )

  return (
    clean(match?.image) ||
    clean(match?.gallery?.[0]) ||
    clean(Array.isArray(item.gallery) && item.gallery.find((g) => !isShirt(g))) ||
    clean(item.image) ||
    DEFAULT_FALLBACK_IMAGE
  )
}

// Helper to load products from localStorage with fallback to default catalog
const loadInitialProducts = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => {
          const mock = MOCK_PRODUCTS.find((m) => String(m.id) === String(p.id) || m.slug === p.slug)
          const fallbackReviews = mock?.reviews || buildProductReviews(p)
          const rawGallery = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : []
          const cleanGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
          const defaultFallback = mock?.image || DEFAULT_FALLBACK_IMAGE
          const fallbackGallery = cleanGallery.length > 0
            ? cleanGallery
            : (mock?.gallery || (mock?.image ? [mock.image] : [defaultFallback]))

          const coverImage = (p.image && !p.image.includes('photo-1618354691373-d851c5c3a990'))
            ? p.image
            : fallbackGallery[0] || defaultFallback

          return {
            ...mock,
            ...p,
            image: coverImage,
            gallery: fallbackGallery,
            reviews: Array.isArray(p.reviews) && p.reviews.length > 0 ? p.reviews : fallbackReviews,
            description: p.description || mock?.description || `Handcrafted antique gold ${p.name} outframed keychain.`,
            features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (mock?.features || [
              'Each keychain is made from bio degradable PLA material.',
              'Strong and durable keyring',
              'Antique gold finish',
              'Durable.',
              'Dimensions: 64mm * 43mm',
            ]),
            rating: Number(p.rating) || mock?.rating || 4.8,
            reviewCount: Number(p.reviewCount) || mock?.reviewCount || fallbackReviews.length || 12,
            discountBadge: p.discountBadge || mock?.discountBadge || (Number(p.price) === 189 ? '-58%' : '-46%'),
            discountPercent: p.discountPercent || mock?.discountPercent || (Number(p.price) === 189 ? 58 : 46),
            inStock: p.inStock !== false,
            isHidden: p.isHidden === true,
          }
        })
      }
    }
  } catch (e) {
    console.warn('Failed to load stored products', e)
  }
  return MOCK_PRODUCTS.map((p) => ({
    ...p,
    inStock: p.inStock !== false,
    isHidden: false,
  }))
}

const persistProducts = (products) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products))
  } catch (e) {
    console.error('Failed to persist products to localStorage', e)
  }
}

export const useCartStore = create((set, get) => ({
  // ── Global Products State ──
  products: loadInitialProducts(),

  setProducts: (products) => {
    if (!Array.isArray(products) || products.length === 0) return
    const normalized = products.map((p) => {
      const mock = MOCK_PRODUCTS.find((m) => String(m.id) === String(p.id) || m.slug === p.slug)
      const fallbackReviews = mock?.reviews || buildProductReviews(p)
      const rawGallery = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : []
      const cleanGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
      const defaultFallback = mock?.image || DEFAULT_FALLBACK_IMAGE
      const fallbackGallery = cleanGallery.length > 0
        ? cleanGallery
        : (mock?.gallery || (mock?.image ? [mock.image] : [defaultFallback]))

      const coverImage = (p.image && !p.image.includes('photo-1618354691373-d851c5c3a990'))
        ? p.image
        : fallbackGallery[0] || defaultFallback

      return {
        ...mock,
        ...p,
        image: coverImage,
        gallery: fallbackGallery,
        reviews: Array.isArray(p.reviews) && p.reviews.length > 0 ? p.reviews : fallbackReviews,
        description: p.description || mock?.description || `Handcrafted antique gold ${p.name} outframed keychain.`,
        features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (mock?.features || [
          'Each keychain is made from bio degradable PLA material.',
          'Strong and durable keyring',
          'Antique gold finish',
          'Durable.',
          'Dimensions: 64mm * 43mm',
        ]),
        rating: Number(p.rating) || mock?.rating || 4.8,
        reviewCount: Number(p.reviewCount) || mock?.reviewCount || fallbackReviews.length || 12,
        discountBadge: p.discountBadge || mock?.discountBadge || (Number(p.price) === 189 ? '-58%' : '-46%'),
        discountPercent: p.discountPercent || mock?.discountPercent || (Number(p.price) === 189 ? 58 : 46),
        inStock: p.inStock !== false,
        isHidden: p.isHidden === true,
      }
    })

    // Also update current items and wishlist so they immediately adopt the authentic images
    const currentItems = get().items || []
    const updatedItems = currentItems.map((item) => {
      const match = normalized.find((p) => String(p.id) === String(item.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(item.id))
      const cleanImg = resolveProductImage(item, normalized)
      return {
        ...item,
        image: cleanImg,
        gallery: (match?.gallery && match.gallery.length > 0) ? match.gallery : [cleanImg],
        fullName: match?.fullName || item.fullName || `${item.name} Outframed Keychain`,
      }
    })

    const currentWishlist = get().wishlist || []
    const updatedWishlist = currentWishlist.map((item) => {
      const match = normalized.find((p) => String(p.id) === String(item.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(item.id))
      const cleanImg = resolveProductImage(item, normalized)
      return {
        ...item,
        image: cleanImg,
        gallery: (match?.gallery && match.gallery.length > 0) ? match.gallery : [cleanImg],
        fullName: match?.fullName || item.fullName || `${item.name} Outframed Keychain`,
      }
    })

    set({ products: normalized, items: updatedItems, wishlist: updatedWishlist })
    persistProducts(normalized)
    if (updatedItems.length > 0) {
      saveCartToAccount(updatedItems)
    }
  },

  updateProduct: (updatedProduct) => {
    const current = get().products
    let saved = null
    const nextProducts = current.map((p) => {
      if (String(p.id) === String(updatedProduct.id)) {
        const mock = MOCK_PRODUCTS.find((m) => String(m.id) === String(p.id) || m.slug === p.slug)
        const slug =
          updatedProduct.slug ||
          p.slug ||
          `${(updatedProduct.name || p.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}-outframed-keychain`
        const fullName =
          updatedProduct.fullName ||
          p.fullName ||
          `${updatedProduct.name || p.name} Outframed Keychain`

        const fallbackReviews = p.reviews || mock?.reviews || buildProductReviews(p)
        const fallbackGallery = Array.isArray(updatedProduct.gallery) && updatedProduct.gallery.length > 0
          ? updatedProduct.gallery
          : (p.gallery || mock?.gallery || (updatedProduct.image ? [updatedProduct.image] : [p.image]))

        const finalCover = (Array.isArray(updatedProduct.gallery) && updatedProduct.gallery[0]) || updatedProduct.image || fallbackGallery[0] || p.image

        saved = {
          ...mock,
          ...p,
          ...updatedProduct,
          slug,
          fullName,
          image: finalCover,
          gallery: fallbackGallery,
          reviews: Array.isArray(updatedProduct.reviews) && updatedProduct.reviews.length > 0 ? updatedProduct.reviews : fallbackReviews,
          inStock: updatedProduct.inStock !== undefined ? updatedProduct.inStock : p.inStock !== false,
          isHidden: updatedProduct.isHidden !== undefined ? updatedProduct.isHidden : p.isHidden === true,
        }
        return saved
      }
      return p
    })

    set({ products: nextProducts })
    persistProducts(nextProducts)
    if (saved) {
      saveProduct(saved).catch((e) => console.warn('Update product in db failed', e))
    }

    // Also update matching items currently in the cart
    const updatedItems = get().items.map((it) => {
      if (String(it.id) === String(updatedProduct.id)) {
        const cover = (Array.isArray(updatedProduct.gallery) && updatedProduct.gallery[0]) || updatedProduct.image || it.image
        return {
          ...it,
          name: updatedProduct.name || it.name,
          fullName: updatedProduct.fullName || it.fullName,
          price: updatedProduct.price !== undefined ? Number(updatedProduct.price) : it.price,
          image: cover,
        }
      }
      return it
    })
    set({ items: updatedItems })

    // Also update matching items in wishlist
    const updatedWishlist = get().wishlist.map((it) => {
      if (String(it.id) === String(updatedProduct.id)) {
        const cover = (Array.isArray(updatedProduct.gallery) && updatedProduct.gallery[0]) || updatedProduct.image || it.image
        return {
          ...it,
          name: updatedProduct.name || it.name,
          fullName: updatedProduct.fullName || it.fullName,
          price: updatedProduct.price !== undefined ? Number(updatedProduct.price) : it.price,
          image: cover,
        }
      }
      return it
    })
    set({ wishlist: updatedWishlist })
  },

  addProduct: (newProduct) => {
    const existing = get().products
    const maxId = Math.max(0, ...existing.map((p) => Number(p.id) || 0))
    const generatedId = newProduct.id ? Number(newProduct.id) : (maxId > 0 ? maxId + 1 : 26)

    const cleanName = newProduct.name || 'Outframed Keychain'
    const slug =
      newProduct.slug ||
      `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-outframed-keychain`
    const fullName = newProduct.fullName || `${cleanName} Outframed Keychain`
    const defaultCover =
      (newProduct.image && !newProduct.image.includes('photo-1618354691373-d851c5c3a990') ? newProduct.image : null) ||
      (newProduct.gallery && newProduct.gallery.find((g) => !g.includes('photo-1618354691373-d851c5c3a990'))) ||
      DEFAULT_FALLBACK_IMAGE

    const gallery =
      newProduct.gallery && newProduct.gallery.length > 0
        ? newProduct.gallery.filter((g) => !g.includes('photo-1618354691373-d851c5c3a990'))
        : [defaultCover]
    const productCover = gallery[0] || defaultCover

    const productWithDefaults = {
      id: generatedId,
      name: cleanName,
      slug,
      fullName,
      genre: newProduct.genre || 'MARVEL',
      price: Number(newProduct.price) || 249,
      originalPrice: Number(newProduct.originalPrice || Math.round(Number(newProduct.price || 249) * 1.8)),
      description: newProduct.description || `Handcrafted antique gold ${cleanName} keychain.`,
      image: productCover,
      gallery: gallery,
      reviewCount: 7,
      rating: 4.8,
      inStock: newProduct.inStock !== false,
      isHidden: newProduct.isHidden === true,
      dimensions: newProduct.dimensions || '64mm * 43mm',
      material: newProduct.material || 'Biodegradable PLA',
      finish: newProduct.finish || 'Antique Gold Finish',
      keyring: newProduct.keyring || 'Strong and Durable Keyring',
      durability: newProduct.durability || 'Durable Impact Resistant Structure',
      features: [
        'Each keychain is made from bio degradable PLA material.',
        'Strong and durable keyring',
        'Antique gold finish',
        'Durable.',
        'Dimensions: 64mm * 43mm',
      ],
      reviews: buildProductReviews({
        id: generatedId,
        name: cleanName,
        genre: newProduct.genre || 'MARVEL',
        reviewCount: 7,
        badCount: 1,
      }),
    }

    const nextProducts = [productWithDefaults, ...existing]
    set({ products: nextProducts })
    persistProducts(nextProducts)

    // Persist globally to Supabase + visibility and availability tables
    saveProduct(productWithDefaults).catch((err) => console.warn('Sync new product to db failed:', err))

    return productWithDefaults
  },

  deleteProduct: (productId) => {
    const nextProducts = get().products.filter((p) => String(p.id) !== String(productId))
    set({
      products: nextProducts,
      items: get().items.filter((it) => String(it.id) !== String(productId)),
      wishlist: get().wishlist.filter((it) => String(it.id) !== String(productId)),
    })
    persistProducts(nextProducts)

    // Delete from Supabase
    deleteProductFromDb(productId).catch((err) => console.warn('Sync delete to db failed:', err))
  },

  toggleProductStock: (productId) => {
    let updated = null
    const nextProducts = get().products.map((p) => {
      if (String(p.id) === String(productId)) {
        updated = { ...p, inStock: !p.inStock }
        return updated
      }
      return p
    })
    set({ products: nextProducts })
    persistProducts(nextProducts)
    if (updated) {
      saveProduct(updated).catch((e) => console.warn('Sync stock to db failed', e))
    }
  },

  toggleProductVisibility: (productId) => {
    let updated = null
    const nextProducts = get().products.map((p) => {
      if (String(p.id) === String(productId)) {
        updated = { ...p, isHidden: !p.isHidden }
        return updated
      }
      return p
    })
    set({ products: nextProducts })
    persistProducts(nextProducts)
    if (updated) {
      saveProduct(updated).catch((e) => console.warn('Sync visibility to db failed', e))
    }
  },

  resetProductsToDefault: () => {
    const defaults = MOCK_PRODUCTS.map((p) => ({
      ...p,
      inStock: true,
      isHidden: false,
    }))
    set({ products: defaults })
    persistProducts(defaults)
  },

  items: getLocalCart(),
  setItems: (newItems) => {
    if (!Array.isArray(newItems)) return
    const catalog = get().products.length > 0 ? get().products : MOCK_PRODUCTS
    const sanitized = newItems.map((item) => {
      const match = catalog.find((p) => String(p.id) === String(item.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(item.id))
      const cleanImg = resolveProductImage(item, catalog)
      return {
        ...item,
        image: cleanImg,
        gallery: (match?.gallery && match.gallery.length > 0) ? match.gallery : (item.gallery || [cleanImg]),
        fullName: item.fullName || match?.fullName || `${item.name} Outframed Keychain`,
      }
    })
    set({ items: sanitized })
    saveCartToAccount(sanitized)
  },
  clearCart: () => {
    set({ items: [] })
    saveCartToAccount([])
  },
  isOpen: false,
  activeReviewProduct: null, // Product whose reviews modal is currently open

  // ── Wishlist State ──
  wishlist: [],
  isWishlistOpen: false,
  wishlistPing: false,

  openWishlist: () => set({ isWishlistOpen: true }),
  closeWishlist: () => set({ isWishlistOpen: false }),
  toggleWishlistDrawer: () => set((state) => ({ isWishlistOpen: !state.isWishlistOpen })),

  toggleWishlist: (product) => {
    const exists = get().wishlist.some((item) => item.id === product.id)
    if (exists) {
      set({ wishlist: get().wishlist.filter((item) => item.id !== product.id) })
    } else {
      const catalog = get().products.length > 0 ? get().products : MOCK_PRODUCTS
      const cleanImg = resolveProductImage(product, catalog)
      const match = catalog.find((p) => String(p.id) === String(product.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(product.id))
      const cleanGallery = (match?.gallery && match.gallery.length > 0) ? match.gallery : (product.gallery || [cleanImg])
      const cleanProduct = {
        ...product,
        image: cleanImg,
        gallery: cleanGallery,
        fullName: product.fullName || match?.fullName || `${product.name} Outframed Keychain`,
      }

      // Add product & trigger glowing highlight animation on navbar heart!
      set({
        wishlist: [...get().wishlist, cleanProduct],
        wishlistPing: true,
      })
      setTimeout(() => {
        set({ wishlistPing: false })
      }, 1400)
    }
  },

  isWishlisted: (productId) => {
    return get().wishlist.some((item) => item.id === productId)
  },

  getWishlistCount: () => {
    return get().wishlist.length
  },

  // ── Reviews Modal State ──
  openReviews: (product) => set({ activeReviewProduct: product }),
  closeReviews: () => set({ activeReviewProduct: null }),

  // ── Cart Drawer State ──
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (product) => {
    if (product.inStock === false) return
    const catalog = get().products.length > 0 ? get().products : MOCK_PRODUCTS
    const cleanImg = resolveProductImage(product, catalog)
    const match = catalog.find((p) => String(p.id) === String(product.id)) || MOCK_PRODUCTS.find((p) => String(p.id) === String(product.id))
    const cleanGallery = (match?.gallery && match.gallery.length > 0) ? match.gallery : (product.gallery || [cleanImg])
    const cleanProduct = {
      ...product,
      image: cleanImg,
      gallery: cleanGallery,
      fullName: product.fullName || match?.fullName || `${product.name} Outframed Keychain`,
    }

    const existing = get().items.find((item) => item.id === product.id)
    let nextItems
    if (existing) {
      nextItems = get().items.map((item) =>
        item.id === product.id
          ? { ...item, ...cleanProduct, quantity: item.quantity + 1 }
          : item
      )
    } else {
      nextItems = [...get().items, { ...cleanProduct, quantity: 1 }]
    }
    set({ items: nextItems })
    saveCartToAccount(nextItems)
  },

  removeItem: (id) => {
    const nextItems = get().items.filter((item) => item.id !== id)
    set({ items: nextItems })
    saveCartToAccount(nextItems)
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    const nextItems = get().items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    )
    set({ items: nextItems })
    saveCartToAccount(nextItems)
  },

  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))

export { MOCK_PRODUCTS, GENRES }
