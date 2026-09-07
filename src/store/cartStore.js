import { create } from 'zustand'
import { MOCK_PRODUCTS, GENRES } from '../data/productsData'
import { getLocalCart, saveCartToAccount } from '../lib/db'

const LOCAL_STORAGE_PRODUCTS_KEY = 'outframe_labs_products'

// Helper to load products from localStorage with fallback to default catalog
const loadInitialProducts = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to load stored products', e)
  }
  return MOCK_PRODUCTS.map((p) => ({
    ...p,
    inStock: p.inStock !== false,
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

  updateProduct: (updatedProduct) => {
    const current = get().products
    const nextProducts = current.map((p) => {
      if (p.id === updatedProduct.id) {
        const slug =
          updatedProduct.slug ||
          `${(updatedProduct.name || p.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}-outframed-keychain`
        const fullName =
          updatedProduct.fullName ||
          `${updatedProduct.name || p.name} Outframed Keychain`

        return {
          ...p,
          ...updatedProduct,
          slug,
          fullName,
        }
      }
      return p
    })

    set({ products: nextProducts })
    persistProducts(nextProducts)

    // Also update matching items currently in the cart
    const updatedItems = get().items.map((it) => {
      if (it.id === updatedProduct.id) {
        return {
          ...it,
          name: updatedProduct.name || it.name,
          fullName: updatedProduct.fullName || it.fullName,
          price: updatedProduct.price !== undefined ? Number(updatedProduct.price) : it.price,
          image: updatedProduct.image || it.image,
        }
      }
      return it
    })
    set({ items: updatedItems })

    // Also update matching items in wishlist
    const updatedWishlist = get().wishlist.map((it) => {
      if (it.id === updatedProduct.id) {
        return {
          ...it,
          name: updatedProduct.name || it.name,
          fullName: updatedProduct.fullName || it.fullName,
          price: updatedProduct.price !== undefined ? Number(updatedProduct.price) : it.price,
          image: updatedProduct.image || it.image,
        }
      }
      return it
    })
    set({ wishlist: updatedWishlist })
  },

  addProduct: (newProduct) => {
    const slug =
      newProduct.slug ||
      `${newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-outframed-keychain`
    const fullName = `${newProduct.name} Outframed Keychain`
    const productWithDefaults = {
      id: newProduct.id || Date.now(),
      slug,
      fullName,
      originalPrice: newProduct.originalPrice || Math.round(newProduct.price * 1.8),
      reviewCount: 7,
      rating: 4.8,
      inStock: newProduct.inStock !== false,
      gallery: newProduct.gallery && newProduct.gallery.length > 0 ? newProduct.gallery : [newProduct.image],
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
      reviews: [],
      ...newProduct,
    }

    const nextProducts = [productWithDefaults, ...get().products]
    set({ products: nextProducts })
    persistProducts(nextProducts)
    return productWithDefaults
  },

  deleteProduct: (productId) => {
    const nextProducts = get().products.filter((p) => p.id !== productId)
    set({
      products: nextProducts,
      items: get().items.filter((it) => it.id !== productId),
      wishlist: get().wishlist.filter((it) => it.id !== productId),
    })
    persistProducts(nextProducts)
  },

  toggleProductStock: (productId) => {
    const nextProducts = get().products.map((p) =>
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    )
    set({ products: nextProducts })
    persistProducts(nextProducts)
  },

  resetProductsToDefault: () => {
    const defaults = MOCK_PRODUCTS.map((p) => ({
      ...p,
      inStock: true,
    }))
    set({ products: defaults })
    persistProducts(defaults)
  },

  items: getLocalCart(),
  setItems: (newItems) => {
    set({ items: newItems })
    saveCartToAccount(newItems)
  },
  clearCart: () => {
    set({ items: [] })
    saveCartToAccount([])
  },
  isOpen: false,
  isCheckoutOpen: false,
  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
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
      // Add product & trigger glowing highlight animation on navbar heart!
      set({
        wishlist: [...get().wishlist, product],
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
    const existing = get().items.find((item) => item.id === product.id)
    let nextItems
    if (existing) {
      nextItems = get().items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      nextItems = [...get().items, { ...product, quantity: 1 }]
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
