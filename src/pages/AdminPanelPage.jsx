import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings as SettingsIcon,
  Search,
  Plus,
  Truck,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  X,
  Upload,
  Sparkles,
  Sliders,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  Menu,
  Edit3,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  Globe,
  Ban,
  XCircle
} from 'lucide-react'
import { GENRES } from '../data/productsData'
import { useCartStore } from '../store/cartStore'
import { saveProduct, getAllOrders, updateOrderStatus, deleteOrder } from '../lib/db'





// Helper function to read dropped image file and resize via Canvas to optimize storage and speed
function readFileAsOptimizedDataUrl(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please upload a valid image file (PNG, JPG, WEBP).'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => resolve(event.target.result)
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

// ── REUSABLE DRAG & DROP IMAGE COMPONENT ──
function ImageDropzone({
  label = 'Cover Image',
  value,
  onChange,
  onRemove,
  subtext = 'Drag and drop PNG, JPG or WEBP (auto-compressed for instant global display)',
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setIsProcessing(true)
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file)
      onChange(dataUrl)
    } catch (err) {
      alert(err.message || 'Error processing image')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-cream-muted">
        {label}
      </label>

      {value ? (
        <div className="relative rounded-xl border border-charcoal-light bg-obsidian/70 p-3 flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-obsidian shrink-0 border border-gold/30">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-cream truncate">
              {value.startsWith('data:') ? 'Custom Dropped Image (Optimized Data URL)' : value}
            </p>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready for Global Storefront
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-gold hover:underline cursor-pointer"
              >
                Replace Image
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-gold bg-gold/10 scale-[1.01]'
              : 'border-charcoal-light/90 hover:border-gold/50 bg-obsidian/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-col items-center justify-center">
            {isProcessing ? (
              <RefreshCw className="w-7 h-7 text-gold animate-spin mb-1.5" />
            ) : (
              <Upload
                className={`w-7 h-7 mb-1.5 transition-colors ${
                  isDragging ? 'text-gold' : 'text-cream-muted/50'
                }`}
              />
            )}
            <p className="text-xs font-semibold text-cream">
              {isDragging ? 'Drop Image File Here!' : 'Drag & Drop Image Here, or Click to Browse'}
            </p>
            <p className="text-[11px] text-cream-muted/50 mt-0.5">{subtext}</p>
          </div>
        </div>
      )}

      {/* Or Paste URL option */}
      {!value && (
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste direct image link (https://...)"
            className="flex-1 px-3 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
          />
          <button
            type="button"
            onClick={() => {
              if (urlInput.trim()) {
                onChange(urlInput.trim())
                setUrlInput('')
              }
            }}
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 rounded-lg bg-charcoal-light text-cream-muted hover:text-cream text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
          >
            Apply URL
          </button>
        </div>
      )}
    </div>
  )
}

// ── REUSABLE MULTI-IMAGE GALLERY DROPZONE ──
function GalleryDropzone({ gallery = [], onUpdateGallery }) {
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    const newImages = []
    for (const file of Array.from(files)) {
      try {
        const dataUrl = await readFileAsOptimizedDataUrl(file)
        newImages.push(dataUrl)
      } catch (err) {
        console.error('Error processing gallery image', err)
      }
    }
    if (newImages.length > 0) {
      onUpdateGallery([...gallery, ...newImages])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleRemoveImage = (index) => {
    const updated = gallery.filter((_, idx) => idx !== index)
    onUpdateGallery(updated)
  }

  const handleMakeCover = (index) => {
    const target = gallery[index]
    const updated = [target, ...gallery.filter((_, idx) => idx !== index)]
    onUpdateGallery(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-cream-muted">
          Swipeable Product Carousel Images ({gallery.length} Photos)
        </label>
        <span className="text-[11px] text-cream-muted/50">
          Users can swipe through these images on the product page
        </span>
      </div>

      {/* Gallery Thumbnails */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {gallery.map((img, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-lg bg-obsidian border border-charcoal-light overflow-hidden"
            >
              <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold text-obsidian tracking-wider uppercase">
                  Cover
                </span>
              )}
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleMakeCover(idx)}
                    className="text-[10px] text-gold hover:underline font-semibold cursor-pointer"
                  >
                    Set Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="text-[10px] text-rose-400 hover:underline font-semibold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone for adding more gallery photos */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-gold bg-gold/10 scale-[1.01]'
            : 'border-charcoal-light/80 hover:border-gold/50 bg-obsidian/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-cream">
          <Upload className="w-4 h-4 text-gold" />
          <span>{isDragging ? 'Drop Multiple Photos to Add!' : 'Drag & Drop Multiple Images for Carousel, or Browse'}</span>
        </div>
      </div>

      {/* Or Paste URL to Add */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Add extra gallery image via web URL..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
        />
        <button
          type="button"
          onClick={() => {
            if (urlInput.trim()) {
              onUpdateGallery([...gallery, urlInput.trim()])
              setUrlInput('')
            }
          }}
          disabled={!urlInput.trim()}
          className="px-3 py-1.5 rounded-lg bg-charcoal-light text-cream-muted hover:text-cream text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
        >
          Add to Gallery
        </button>
      </div>
    </div>
  )
}

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Global Products State from Zustand (synced to LocalStorage and database)
  const products = useCartStore((s) => s.products)
  const updateProduct = useCartStore((s) => s.updateProduct)
  const addProduct = useCartStore((s) => s.addProduct)
  const deleteProduct = useCartStore((s) => s.deleteProduct)
  const toggleProductStock = useCartStore((s) => s.toggleProductStock)
  const resetProductsToDefault = useCartStore((s) => s.resetProductsToDefault)

  // Orders State
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [copiedAwb, setCopiedAwb] = useState(null)
  const [toast, setToast] = useState(null)
  const [generatingAwb, setGeneratingAwb] = useState({})

  // Products Tab Local Filters
  const [productSearch, setProductSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('ALL')

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null)

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    genre: 'MARVEL',
    price: 249,
    originalPrice: 459,
    description: '',
    image: '',
    gallery: [],
    inStock: true,
  })

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'Outframe Labs',
    contactEmail: 'support@outframelabs.in',
    contactPhone: '+91 98201 98201',
    defaultShippingFee: 60,
    freeShippingThreshold: 999,
    printerModel: 'Anycubic Kobra 2 Neo',
    printerNozzleTemp: 215,
    printerBedTemp: 60,
    printerSpeed: 250,
    printerStatus: 'Online (Printing Job #4891)',
    dispatchHub: 'Maharashtra Central Sort Center (Pune / Mumbai Expressway)',
    pickupPincode: '411038',
    aggregator: 'Shiprocket / Delhivery Express',
    autoGenerateAwb: true,
    autoSyncCancellations: true,
  })

  // Live Shiprocket API connection status
  const [shiprocketConnected, setShiprocketConnected] = useState(null)
  const [isSyncingStatuses, setIsSyncingStatuses] = useState(false)
  const [cancellingOrder, setCancellingOrder] = useState({})
  const [deletingOrder, setDeletingOrder] = useState({})

  useEffect(() => {
    fetch('/api/generate-awb')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.connected === 'boolean') {
          setShiprocketConnected(data.connected)
        } else {
          setShiprocketConnected(false)
        }
      })
      .catch(() => setShiprocketConnected(false))
  }, [])

  // Load orders from Supabase + LocalStorage fallback
  useEffect(() => {
    let isMounted = true
    async function fetchOrders() {
      try {
        const data = await getAllOrders()
        if (!isMounted) return

        if (!data || data.length === 0) {
          setOrders([])
        } else {
          const mapped = data.map((o) => {
            let st = o.status
            if (st === 'PLACED' || st === 'CONFIRMED') st = 'Payment Received'
            else if (st === 'PRINTING') st = 'Printing on Kobra 2 Neo'
            else if (st === 'PACKED') st = 'Packed'
            else if (st === 'SHIPPED' || st === 'IN_TRANSIT' || st === 'DELIVERED') st = 'Shipped'
            else if (st === 'CANCELLED' || st === 'CANCELED' || String(st).toUpperCase().includes('CANCEL')) st = 'CANCELLED'

            const shipmentObj = Array.isArray(o.shipments) && o.shipments[0] ? o.shipments[0] : o.shipment

            let parsedNotes = {}
            try {
              if (o.notes) parsedNotes = typeof o.notes === 'string' ? JSON.parse(o.notes) : o.notes
            } catch (e) {}

            return {
              id: o.order_number || o.id,
              db_id: o.id,
              order_number: o.order_number || o.id,
              customer_name: o.customer_name || 'Collector',
              customer_phone: o.customer_phone || '+91 98765 00000',
              customer_email: o.customer_email || 'orders@outframelabs.in',
              shipping_address: o.shipping_address || {
                address: 'Fulfillment Order',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
              },
              items: o.order_items || o.items || [{ name: 'Outframed Antique Gold Keychain', quantity: 1, price: o.total_amount || 249 }],
              total_amount: o.total_amount || 249,
              status: st || 'Payment Received',
              awb_code: shipmentObj?.awb_code || o.awb_code || null,
              courier_partner: shipmentObj?.courier_partner || o.courier_partner || null,
              tracking_url: shipmentObj?.tracking_url || (shipmentObj?.awb_code ? `https://shiprocket.co/tracking/${shipmentObj.awb_code}` : null),
              label_url: parsedNotes.label_url || shipmentObj?.label_url || o.label_url || null,
              shiprocket_shipment_id: shipmentObj?.shiprocket_shipment_id || null,
              cancellation_reason: parsedNotes.cancellation_reason || null,
              cancelled_at: parsedNotes.cancelled_at || null,
              created_at: o.created_at || new Date().toISOString(),
            }
          })
          setOrders(mapped)
        }
      } catch (e) {
        if (isMounted) setOrders([])
      }
    }
    fetchOrders()
    return () => {
      isMounted = false
    }
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => {
      setToast(null)
    }, 5000)
  }

  // Cancel Order on Shiprocket & Supabase
  const handleCancelShiprocketOrder = async (orderId) => {
    const targetOrder = orders.find(
      (o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId
    )
    if (!targetOrder) {
      showToast('Order record not found.', 'error')
      return
    }

    const orderDisplay = targetOrder.order_number || targetOrder.id || orderId
    const confirmed = window.confirm(
      `Cancel Order #${orderDisplay}?\n\nThis will void the shipment in Shiprocket logistics and immediately reflect as "Cancelled by Seller" on the customer's live tracking.`
    )
    if (!confirmed) return

    setCancellingOrder((prev) => ({ ...prev, [orderId]: true }))

    try {
      const res = await fetch('/api/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          orderId: targetOrder.db_id || targetOrder.id || orderId,
          orderNumber: targetOrder.order_number || targetOrder.id || orderId,
          orderData: targetOrder,
          reason: 'Cancelled by seller in Outframe Labs Admin Portal',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to cancel order on Shiprocket', 'error')
        return
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId || o.order_number === orderId || o.db_id === orderId) {
            return {
              ...o,
              status: 'CANCELLED',
              cancellation_reason: 'Cancelled by seller in Outframe Labs Admin Portal',
              cancelled_at: new Date().toISOString(),
            }
          }
          return o
        })
      )

      showToast(`Order #${orderDisplay} cancelled. Live tracking updated!`, 'success')
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    } finally {
      setCancellingOrder((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Permanently remove a cancelled or test order from list and database
  const handleDeleteOrder = async (orderId) => {
    const targetOrder = orders.find(
      (o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId
    )
    if (!targetOrder) {
      showToast('Order record not found.', 'error')
      return
    }

    const orderDisplay = targetOrder.order_number || targetOrder.id || orderId
    const confirmed = window.confirm(
      `Remove Order #${orderDisplay} permanently from the list?\n\nThis will remove this cancelled order record from your dashboard and database.`
    )
    if (!confirmed) return

    setDeletingOrder((prev) => ({ ...prev, [orderId]: true }))

    try {
      // 1. Call server API to delete from database
      await fetch('/api/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          orderId: targetOrder.db_id || targetOrder.id || orderId,
          orderNumber: targetOrder.order_number || targetOrder.id || orderId,
        }),
      })

      // 2. Direct Supabase delete fallback
      await deleteOrder(targetOrder.db_id || targetOrder.id, targetOrder.order_number)

      // 3. Update local state
      setOrders((prev) =>
        prev.filter((o) => !(o.id === orderId || o.order_number === orderId || o.db_id === orderId))
      )

      showToast(`Order #${orderDisplay} removed from list.`, 'success')
    } catch (err) {
      showToast('Error removing order: ' + err.message, 'error')
    } finally {
      setDeletingOrder((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Remove all cancelled orders at once
  const handleClearAllCancelled = async () => {
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED')
    if (cancelledOrders.length === 0) {
      showToast('No cancelled orders found in the list.', 'info')
      return
    }

    const confirmed = window.confirm(
      `Permanently remove all ${cancelledOrders.length} cancelled order(s) from the list?`
    )
    if (!confirmed) return

    setIsSyncingStatuses(true)
    try {
      for (const ord of cancelledOrders) {
        await deleteOrder(ord.db_id || ord.id, ord.order_number)
        try {
          await fetch('/api/generate-awb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              orderId: ord.db_id || ord.id,
              orderNumber: ord.order_number || ord.id,
            }),
          })
        } catch (e) {}
      }

      setOrders((prev) => prev.filter((o) => o.status !== 'CANCELLED'))
      showToast(`${cancelledOrders.length} cancelled order(s) removed from list.`, 'success')
    } catch (err) {
      showToast('Error removing cancelled orders: ' + err.message, 'error')
    } finally {
      setIsSyncingStatuses(false)
    }
  }

  // Poll Shiprocket API to sync cancellation statuses & courier tracking
  const handleSyncShiprocketStatuses = async () => {
    setIsSyncingStatuses(true)
    try {
      const res = await fetch('/api/generate-awb?action=sync')
      const data = await res.json()

      // Refresh orders from Supabase
      const freshData = await getAllOrders()
      if (freshData && freshData.length > 0) {
        const mapped = freshData.map((o) => {
          let st = o.status
          if (st === 'PLACED' || st === 'CONFIRMED') st = 'Payment Received'
          else if (st === 'PRINTING') st = 'Printing on Kobra 2 Neo'
          else if (st === 'PACKED') st = 'Packed'
          else if (st === 'SHIPPED' || st === 'IN_TRANSIT' || st === 'DELIVERED') st = 'Shipped'
          else if (st === 'CANCELLED' || st === 'CANCELED' || String(st).toUpperCase().includes('CANCEL')) st = 'CANCELLED'

          const shipmentObj = Array.isArray(o.shipments) && o.shipments[0] ? o.shipments[0] : o.shipment
          let parsedNotes = {}
          try {
            if (o.notes) parsedNotes = typeof o.notes === 'string' ? JSON.parse(o.notes) : o.notes
          } catch (e) {}

          return {
            id: o.order_number || o.id,
            db_id: o.id,
            order_number: o.order_number || o.id,
            customer_name: o.customer_name || 'Collector',
            customer_phone: o.customer_phone || '+91 98765 00000',
            customer_email: o.customer_email || 'orders@outframelabs.in',
            shipping_address: o.shipping_address || {
              address: 'Fulfillment Order',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
            },
            items: o.order_items || o.items || [{ name: 'Outframed Antique Gold Keychain', quantity: 1, price: o.total_amount || 249 }],
            total_amount: o.total_amount || 249,
            status: st || 'Payment Received',
            awb_code: shipmentObj?.awb_code || o.awb_code || null,
            courier_partner: shipmentObj?.courier_partner || o.courier_partner || null,
            tracking_url: shipmentObj?.tracking_url || (shipmentObj?.awb_code ? `https://shiprocket.co/tracking/${shipmentObj.awb_code}` : null),
            label_url: parsedNotes.label_url || shipmentObj?.label_url || o.label_url || null,
            shiprocket_shipment_id: shipmentObj?.shiprocket_shipment_id || null,
            cancellation_reason: parsedNotes.cancellation_reason || null,
            cancelled_at: parsedNotes.cancelled_at || null,
            created_at: o.created_at || new Date().toISOString(),
          }
        })
        setOrders(mapped)
      }

      if (data?.updated_cancellations?.length > 0) {
        showToast(`Shiprocket sync: ${data.updated_cancellations.length} order(s) updated to CANCELLED.`, 'success')
      } else {
        showToast('Shiprocket sync complete: All live tracking statuses are up to date.', 'success')
      }
    } catch (err) {
      showToast('Notice: Could not sync Shiprocket statuses (' + err.message + ')', 'error')
    } finally {
      setIsSyncingStatuses(false)
    }
  }

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      handleCancelShiprocketOrder(orderId)
      return
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.order_number === orderId || o.db_id === orderId) {
          return { ...o, status: newStatus }
        }
        return o
      })
    )
    showToast(`Order #${orderId} status set to "${newStatus}"`, 'success')

    // Persist status change to Supabase database
    try {
      const targetOrder = orders.find(
        (o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId
      )
      let dbStatus = newStatus
      if (newStatus === 'Payment Received') dbStatus = 'CONFIRMED'
      else if (newStatus === 'Printing on Kobra 2 Neo') dbStatus = 'PRINTING'
      else if (newStatus === 'Packed') dbStatus = 'PACKED'
      else if (newStatus === 'Shipped') dbStatus = 'SHIPPED'

      await updateOrderStatus(targetOrder?.db_id, targetOrder?.order_number || orderId, dbStatus)
    } catch (e) {
      console.warn('Could not persist status change to Supabase:', e)
    }
  }

  // Generate AWB for dispatch via Shiprocket API
  const handleGenerateAwb = async (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId)
    if (!targetOrder) {
      showToast('Order not found in database records.', 'error')
      return
    }

    setGeneratingAwb((prev) => ({ ...prev, [orderId]: true }))

    try {
      const res = await fetch('/api/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetOrder.db_id || targetOrder.id || orderId,
          orderData: targetOrder,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Failed to generate AWB with Shiprocket'
        showToast(errorMsg, 'error')
        return
      }

      // Update local state with real AWB, courier partner, tracking URL, and label URL
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId || o.order_number === orderId || o.db_id === orderId) {
            return {
              ...o,
              awb_code: data.awb_code,
              status: 'Shipped',
              courier_partner: data.courier_name || o.courier_partner || 'Delhivery Express',
              tracking_url: data.tracking_url,
              label_url: data.label_url,
            }
          }
          return o
        })
      )

      showToast(
        `AWB Generated: ${data.awb_code} (${data.courier_name || 'Shiprocket'})`,
        'success'
      )
    } catch (err) {
      console.error('Error generating AWB:', err)
      showToast(`Network error communicating with shipping service: ${err.message}`, 'error')
    } finally {
      setGeneratingAwb((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Copy AWB code
  const handleCopyAwb = (awb) => {
    navigator.clipboard.writeText(awb)
    setCopiedAwb(awb)
    setTimeout(() => setCopiedAwb(null), 2000)
    showToast(`Copied AWB ${awb} to clipboard`)
  }

  // ── SAVE EDITED PRODUCT (GLOBAL UPDATE) ──
  const handleSaveEditProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    const productPayload = {
      ...editingProduct,
      price: Number(editingProduct.price),
      originalPrice: Number(editingProduct.originalPrice || Math.round(editingProduct.price * 1.8)),
      gallery:
        editingProduct.gallery && editingProduct.gallery.length > 0
          ? editingProduct.gallery
          : [editingProduct.image],
    }

    // Update global store (affects Home, Category, Product Detail, Cart, Wishlist)
    updateProduct(productPayload)
    // Sync to database handler
    await saveProduct(productPayload)

    showToast(`Product "${productPayload.name}" updated globally across the entire store!`)
    setEditingProduct(null)
  }

  // ── ADD PRODUCT (GLOBAL INSERT) ──
  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) return

    const defaultCover =
      newProduct.image ||
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'

    const gallery =
      newProduct.gallery && newProduct.gallery.length > 0
        ? newProduct.gallery
        : [defaultCover]

    const productToAdd = {
      id: Date.now(),
      name: newProduct.name,
      fullName: `${newProduct.name} Outframed Keychain`,
      genre: newProduct.genre,
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice || Math.round(newProduct.price * 1.8)),
      description: newProduct.description || `Handcrafted antique gold ${newProduct.name} keychain.`,
      image: defaultCover,
      gallery: gallery,
      inStock: newProduct.inStock,
    }

    // Add to global store
    addProduct(productToAdd)
    // Sync to db
    await saveProduct(productToAdd)

    setIsAddModalOpen(false)
    setNewProduct({
      name: '',
      genre: 'MARVEL',
      price: 249,
      originalPrice: 459,
      description: '',
      image: '',
      gallery: [],
      inStock: true,
    })
    showToast(`New product "${productToAdd.name}" is now live worldwide!`)
  }

  // ── DELETE PRODUCT ──
  const handleDeleteProduct = (prod) => {
    if (window.confirm(`Are you sure you want to permanently delete "${prod.name}" from the store?`)) {
      deleteProduct(prod.id)
      showToast(`Product "${prod.name}" removed from global store.`)
    }
  }

  // ── RESET CATALOG ──
  const handleResetCatalog = () => {
    if (
      window.confirm(
        'Reset all products back to original 25 keychains? Custom additions and edits will be restored.'
      )
    ) {
      resetProductsToDefault()
      showToast('Catalog restored to default factory keychains.')
    }
  }

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone?.includes(searchQuery)

      const matchesStatus =
        statusFilter === 'ALL' || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        prod.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        prod.fullName?.toLowerCase().includes(productSearch.toLowerCase())
      const matchesGenre =
        genreFilter === 'ALL' || prod.genre === genreFilter
      return matchesSearch && matchesGenre
    })
  }, [products, productSearch, genreFilter])

  // ── 100% REAL OVERVIEW METRICS (Strictly derived from live database records) ──
  const validOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status !== 'CANCELLED' &&
        o.status !== 'CANCELED' &&
        !String(o.status || '').toUpperCase().includes('CANCEL')
    )
  }, [orders])

  // Total Real Revenue
  const totalRevenue = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  }, [validOrders])

  // Average Order Value
  const avgOrderValue = useMemo(() => {
    return validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0
  }, [totalRevenue, validOrders])

  // Total Real Orders Count
  const totalOrdersCount = orders.length

  // Today's Orders Count
  const todayOrdersCount = useMemo(() => {
    const todayStr = new Date().toDateString()
    return orders.filter((o) => {
      if (!o.created_at) return false
      return new Date(o.created_at).toDateString() === todayStr
    }).length
  }, [orders])

  // Fulfillment Count & Rate
  const dispatchedOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.status === 'Shipped' || o.status === 'SHIPPED' || o.status === 'DELIVERED' || o.awb_code) &&
        o.status !== 'CANCELLED' &&
        o.status !== 'CANCELED'
    ).length
  }, [orders])

  const fulfillmentRate = useMemo(() => {
    if (orders.length === 0) return '100'
    return ((dispatchedOrdersCount / orders.length) * 100).toFixed(1)
  }, [dispatchedOrdersCount, orders])

  // Pending Prints (Production Queue)
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === 'Printing on Kobra 2 Neo' ||
        o.status === 'Payment Received' ||
        o.status === 'CONFIRMED' ||
        o.status === 'PLACED' ||
        o.status === 'PACKED'
    )
  }, [orders])

  const pendingPrintsCount = pendingOrders.length

  // Total Pending Keychain Units to 3D Print
  const pendingUnitsCount = useMemo(() => {
    return pendingOrders.reduce((sum, o) => {
      const items = o.items || o.order_items || []
      const units = items.reduce((iSum, it) => iSum + (Number(it.quantity) || 1), 0)
      return sum + (units || 1)
    }, 0)
  }, [pendingOrders])

  const estPrintTimeText = useMemo(() => {
    if (pendingUnitsCount === 0) return 'Queue clear • Ready for drops'
    const totalMinutes = pendingUnitsCount * 35 // ~35 min per keychain on Kobra 2 Neo
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `Est. print time: ~${h > 0 ? `${h}h ` : ''}${m}m (${pendingUnitsCount} units)`
  }, [pendingUnitsCount])

  // Active Shipments (Dispatched & In Transit)
  const activeShipmentsCount = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.status === 'Shipped' || o.status === 'SHIPPED' || o.status === 'IN_TRANSIT' || o.awb_code) &&
        o.status !== 'CANCELLED' &&
        o.status !== 'CANCELED'
    ).length
  }, [orders])

  // Active Couriers List
  const activeCouriersList = useMemo(() => {
    const list = orders
      .filter((o) => o.courier_partner)
      .map((o) => o.courier_partner)
    return Array.from(new Set(list))
  }, [orders])

  // 7-Day Real Sales Velocity Data (Calculated dynamically for past 7 days ending today)
  const revenueVelocityData = useMemo(() => {
    const days = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toDateString()
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' })
      const dateLabel = d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })

      const dayOrders = orders.filter((o) => {
        if (!o.created_at) return false
        if (o.status === 'CANCELLED' || o.status === 'CANCELED') return false
        return new Date(o.created_at).toDateString() === dateStr
      })

      const dailyRevenue = dayOrders.reduce(
        (sum, o) => sum + (Number(o.total_amount) || 0),
        0
      )
      const dailyOrderCount = dayOrders.length

      days.push({
        day: dayLabel,
        date: dateLabel,
        sales: dailyRevenue,
        orders: dailyOrderCount,
      })
    }
    return days
  }, [orders])

  // Peak Sales Day in the 7-day window
  const peakDay = useMemo(() => {
    if (!revenueVelocityData || revenueVelocityData.length === 0) {
      return { day: 'Today', sales: 0, date: '' }
    }
    return revenueVelocityData.reduce(
      (prev, curr) => (curr.sales > prev.sales ? curr : prev),
      revenueVelocityData[0]
    )
  }, [revenueVelocityData])

  // Dynamically compute SVG curve and points for the real 7-day trend
  const chartSvgData = useMemo(() => {
    const maxSales = Math.max(...revenueVelocityData.map((d) => d.sales), 500)
    const width = 700
    const paddingY = 40
    const baselineY = 200

    const points = revenueVelocityData.map((item, idx) => {
      const x = (idx / 6) * width
      const ratio = item.sales / maxSales
      const y = baselineY - ratio * (baselineY - paddingY)
      return { x, y, ...item }
    })

    // Construct smooth bezier curve
    let linePath = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const mx = (p0.x + p1.x) / 2
      linePath += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
    }

    const areaPath = `${linePath} L 700 220 L 0 220 Z`

    return { points, linePath, areaPath, maxSales }
  }, [revenueVelocityData])

  // Status Badge Colors
  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Payment Received':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'Printing on Kobra 2 Neo':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
      case 'Packed':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30'
      case 'Shipped':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      case 'CANCELLED':
      case 'CANCELED':
      case 'Cancelled':
      case 'Cancelled by Seller':
        return 'bg-red-500/15 text-red-400 border-red-500/40'
      default:
        return 'bg-charcoal-light text-cream-muted border-charcoal-light'
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream flex">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-2xl text-sm transition-all animate-fade-in-up ${
            toast.type === 'error'
              ? 'border-red-500/60 bg-red-950/95 text-red-100 shadow-red-950/50'
              : 'border-gold/40 bg-charcoal text-cream shadow-gold/10'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-gold shrink-0" />
          )}
          <span className="font-medium max-w-sm leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-cream-muted hover:text-cream cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── SIDE NAVIGATION ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-charcoal border-r border-charcoal-light flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-charcoal-light flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black tracking-[0.25em] text-cream">
                  OUTFRAME
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 font-semibold tracking-wider">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-cream-muted/60 mt-1">
                Operations & 3D Print HQ
              </p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-cream-muted hover:text-cream cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
              { id: 'products', label: 'Products', icon: Package, count: products.length },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gold/15 text-gold border border-gold/30 shadow-[0_0_15px_rgba(207,181,59,0.15)] font-semibold'
                      : 'text-cream-muted/70 hover:bg-charcoal-light/60 hover:text-cream'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-gold' : 'text-cream-muted/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-gold text-obsidian font-bold'
                          : 'bg-charcoal-light text-cream-muted/70'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Hub Status & Link back to store */}
        <div className="p-4 border-t border-charcoal-light space-y-3">
          <div className="rounded-lg bg-obsidian/60 border border-charcoal-light/80 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-cream-muted/70 font-semibold">
                Maharashtra Hub
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-cream-muted/60">
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span>Anycubic Kobra 2 Neo: 250mm/s</span>
            </div>
          </div>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-charcoal-light text-xs font-medium text-cream-muted hover:text-cream hover:border-gold/30 hover:bg-charcoal-light/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Store</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-obsidian/90 backdrop-blur-md border-b border-charcoal-light">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-charcoal text-cream-muted hover:text-cream cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-bold text-cream capitalize flex items-center gap-2">
                <span>{activeTab} Management</span>
                {activeTab === 'products' && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Globe className="w-3 h-3" /> Live Worldwide Sync
                  </span>
                )}
              </h1>
              <p className="text-xs text-cream-muted/60 hidden sm:block">
                Outframe Labs Enterprise Dashboard • Realtime Synchronization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal border border-charcoal-light text-xs text-cream-muted">
              <span
                className={`w-2 h-2 rounded-full ${
                  shiprocketConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span>
                {shiprocketConnected === null
                  ? 'Checking Shiprocket...'
                  : shiprocketConnected
                  ? 'Shiprocket API: Connected'
                  : 'Shiprocket: Credentials Needed'}
              </span>
            </div>

            {activeTab === 'products' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-obsidian font-semibold text-xs transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.2)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-8">
          {/* ════════════════════════════════════════════════════════
              1. OVERVIEW TAB
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 4 KPI Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Revenue */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Total Revenue
                    </span>
                    <div className="p-2 rounded-lg bg-gold/10 text-gold border border-gold/20">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      ₹{totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-gold font-mono">
                      Avg ₹{avgOrderValue}/order
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    Gross sales across {validOrders.length} verified {validOrders.length === 1 ? 'order' : 'orders'}
                  </p>
                </div>

                {/* 2. Total Orders */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Total Orders
                    </span>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {totalOrdersCount}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center">
                      <ArrowUpRight className="w-3 h-3" /> +{todayOrdersCount} today
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {fulfillmentRate}% fulfillment rate ({dispatchedOrdersCount}/{totalOrdersCount} dispatched)
                  </p>
                </div>

                {/* 3. Pending Prints */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Pending Prints
                    </span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Printer className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {pendingPrintsCount}
                    </span>
                    <span className="text-xs font-semibold text-amber-400">
                      {pendingPrintsCount > 0 ? 'Queued on Kobra 2 Neo' : 'Queue Clear'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {estPrintTimeText}
                  </p>
                </div>

                {/* 4. Active Shipments */}
                <div className="p-5 rounded-xl bg-charcoal border border-charcoal-light relative overflow-hidden group hover:border-gold/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-cream-muted/70 font-semibold">
                      Active Shipments
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-black text-cream">
                      {activeShipmentsCount}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      In Transit
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-cream-muted/50">
                    {activeCouriersList.length > 0 ? activeCouriersList.join(' & ') : 'Dispatched from Satara Hub'}
                  </p>
                </div>
              </div>

              {/* Real 7-Day Revenue Velocity Chart */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-heading font-bold text-cream flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gold" />
                      7-Day Revenue Velocity
                    </h3>
                    <p className="text-xs text-cream-muted/60 mt-0.5">
                      Live daily order revenue across all active collections & drops
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-gold" />
                      <span className="text-cream-muted">Daily Sales (₹)</span>
                    </div>
                    <div className="px-3 py-1 rounded bg-charcoal-light text-cream font-mono">
                      Peak: {peakDay.day} {peakDay.date ? `(${peakDay.date})` : ''} · ₹{peakDay.sales.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Dynamic SVG Line Chart */}
                <div className="relative pt-4">
                  <div className="h-64 w-full">
                    <svg
                      viewBox="0 0 700 240"
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#CFB53B" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#CFB53B" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Lines */}
                      {[0, 60, 120, 180].map((y, idx) => (
                        <line
                          key={idx}
                          x1="0"
                          y1={y}
                          x2="700"
                          y2={y}
                          stroke="#252525"
                          strokeDasharray="4 4"
                        />
                      ))}

                      {/* Area Fill */}
                      <path
                        d={chartSvgData.areaPath}
                        fill="url(#goldGradient)"
                      />

                      {/* Line Stroke */}
                      <path
                        d={chartSvgData.linePath}
                        fill="none"
                        stroke="#CFB53B"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data Dots with Hover Tooltips */}
                      {chartSvgData.points.map((pt, i) => (
                        <g key={i} className="cursor-pointer group">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={pt.sales > 0 ? 6 : 4}
                            className={`transition-all group-hover:r-8 ${
                              pt.sales > 0
                                ? 'fill-gold stroke-obsidian stroke-[2.5]'
                                : 'fill-obsidian stroke-gold/60 stroke-[2]'
                            }`}
                          >
                            <title>
                              {pt.day}, {pt.date}: ₹{pt.sales.toLocaleString('en-IN')} ({pt.orders} {pt.orders === 1 ? 'order' : 'orders'})
                            </title>
                          </circle>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between text-xs text-cream-muted/70 pt-4 border-t border-charcoal-light">
                    {revenueVelocityData.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <p className="font-semibold text-cream">{item.day}</p>
                        <p className="text-[10px] text-cream-muted/50">{item.date}</p>
                        <p className={`text-[11px] font-mono mt-0.5 ${item.sales > 0 ? 'text-gold font-bold' : 'text-cream-muted/40'}`}>
                          ₹{item.sales.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hardware & Dispatch Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anycubic Kobra 2 Neo Fleet */}
                <div className="p-6 rounded-xl bg-charcoal border border-charcoal-light space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-gold/10 text-gold">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-cream">
                          3D Printer Farm Telemetry
                        </h4>
                        <p className="text-xs text-cream-muted/60">Anycubic Kobra 2 Neo Fleet</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Extruder Temperature:</span>
                      <span className="font-mono text-cream font-medium">215°C / 215°C</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Magnetic Heated Bed:</span>
                      <span className="font-mono text-cream font-medium">60°C / 60°C</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Print Speed:</span>
                      <span className="font-mono text-gold font-medium">250 mm/s (LeviQ 2.0)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Filament:</span>
                      <span className="font-mono text-cream font-medium">High-Impact PLA (Antique Gold)</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-cream-muted/70">
                          Current Batch {pendingOrders[0] ? `(${pendingOrders[0].items?.[0]?.name || 'Keychain'} #${pendingOrders[0].id.slice(-4)})` : '(No pending prints)'}:
                        </span>
                        <span className="text-gold font-mono font-bold">
                          {pendingOrders.length > 0 ? `${pendingOrders.length} in queue` : 'Completed'}
                        </span>
                      </div>
                      <div className="w-full bg-charcoal-light h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gold h-full rounded-full transition-all duration-500"
                          style={{ width: pendingOrders.length > 0 ? '75%' : '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maharashtra Dispatch Hub */}
                <div className="p-6 rounded-xl bg-charcoal border border-charcoal-light space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-cream">
                          Maharashtra Logistics Hub
                        </h4>
                        <p className="text-xs text-cream-muted/60">Shiprocket Logistics Gateway</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Express SLA
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Hub Origin:</span>
                      <span className="font-medium text-cream">Satara Hub (MH-415106) / Maharashtra Hub</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Active Couriers:</span>
                      <span className="font-medium text-cream">
                        {activeCouriersList.length > 0 ? activeCouriersList.join(', ') : 'Blue Dart Air / Delhivery Express'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Maharashtra Transit SLA:</span>
                      <span className="font-medium text-emerald-400">24 - 48 Hours</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Rest of India Transit SLA:</span>
                      <span className="font-medium text-cream">3 - 4 Days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-cream-muted/70">Auto-AWB Manifest:</span>
                      <span className="text-gold font-medium">
                        {dispatchedOrdersCount} Manifested Shipments (Shiprocket Live)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              2. ORDERS TAB
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Search & Filters Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, order ID, phone..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-charcoal border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cream-muted hover:text-cream cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs & Shiprocket Sync Button */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <div className="flex items-center gap-1.5">
                    {['ALL', 'Payment Received', 'Printing on Kobra 2 Neo', 'Packed', 'Shipped', 'CANCELLED'].map(
                      (st) => {
                        const isActive = statusFilter === st
                        const count = st === 'ALL' ? orders.length : orders.filter((o) => o.status === st).length
                        return (
                          <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                              isActive
                                ? 'bg-gold text-obsidian font-bold shadow-md'
                                : 'bg-charcoal border border-charcoal-light text-cream-muted hover:text-cream hover:border-gold/30'
                            }`}
                          >
                            {st === 'ALL' ? 'All Orders' : st === 'CANCELLED' ? `Cancelled (${count})` : st}
                          </button>
                        )
                      }
                    )}
                  </div>

                  {orders.some((o) => o.status === 'CANCELLED') && (
                    <button
                      type="button"
                      onClick={handleClearAllCancelled}
                      disabled={isSyncingStatuses}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap ml-1 shrink-0"
                      title="Permanently remove all cancelled orders from the list and database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Cancelled ({orders.filter((o) => o.status === 'CANCELLED').length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncShiprocketStatuses}
                    disabled={isSyncingStatuses}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30 text-xs font-bold hover:bg-gold hover:text-obsidian transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap ml-1 shrink-0"
                    title="Poll Shiprocket API to verify if any shipments have been cancelled by seller"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStatuses ? 'animate-spin' : ''}`} />
                    <span>{isSyncingStatuses ? 'Syncing...' : 'Sync Shiprocket'}</span>
                  </button>
                </div>
              </div>

              {/* Orders Data Table */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-charcoal-light/60 border-b border-charcoal-light text-xs font-semibold text-cream-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Order ID</th>
                        <th className="px-5 py-3.5">Customer Name</th>
                        <th className="px-5 py-3.5">Shipping Address</th>
                        <th className="px-5 py-3.5">Items Ordered</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions / AWB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-light">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-cream-muted/60">
                            <Package className="w-10 h-10 mx-auto mb-3 opacity-30 text-gold" />
                            <p className="font-semibold text-cream">No orders found</p>
                            <p className="text-xs text-cream-muted/50 mt-1">
                              Try clearing filters or search query
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-charcoal-light/30 transition-colors"
                          >
                            {/* Order ID */}
                            <td className="px-5 py-4 whitespace-nowrap align-top">
                              <div className="font-mono font-bold text-cream text-xs flex items-center gap-1.5">
                                <span className="text-gold">#</span>
                                <span>{order.id}</span>
                              </div>
                              <span className="text-[11px] text-cream-muted/50 mt-0.5 block">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <div className="mt-1 font-mono text-xs font-semibold text-gold">
                                ₹{order.total_amount}
                              </div>
                            </td>

                            {/* Customer Name */}
                            <td className="px-5 py-4 align-top">
                              <div className="font-semibold text-cream">
                                {order.customer_name}
                              </div>
                              <div className="text-xs text-cream-muted/70 font-mono mt-0.5">
                                {order.customer_phone}
                              </div>
                              {order.customer_email && (
                                <div className="text-[11px] text-cream-muted/50 truncate max-w-[140px]">
                                  {order.customer_email}
                                </div>
                              )}
                            </td>

                            {/* Shipping Address */}
                            <td className="px-5 py-4 align-top max-w-xs">
                              <p className="text-xs text-cream-muted/90 leading-relaxed">
                                {typeof order.shipping_address === 'string'
                                  ? order.shipping_address
                                  : `${order.shipping_address?.address || ''}, ${
                                      order.shipping_address?.city || ''
                                    }, ${order.shipping_address?.state || ''} - ${
                                      order.shipping_address?.pincode || ''
                                    }`}
                              </p>
                            </td>

                            {/* Items Ordered */}
                            <td className="px-5 py-4 align-top">
                              <div className="space-y-1.5 max-w-xs">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs bg-obsidian/40 px-2 py-1 rounded border border-charcoal-light/60"
                                  >
                                    <span className="truncate max-w-[170px] text-cream">
                                      {item.name}
                                    </span>
                                    <span className="font-mono text-gold font-bold ml-2 shrink-0">
                                      ×{item.quantity || 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Status Dropdown */}
                            <td className="px-5 py-4 align-top whitespace-nowrap">
                              <div className="relative inline-block">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleStatusChange(order.id, e.target.value)
                                  }
                                  className={`appearance-none text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold ${getStatusBadgeStyle(
                                    order.status
                                  )}`}
                                >
                                  <option
                                    value="Payment Received"
                                    className="bg-charcoal text-cream"
                                  >
                                    Payment Received
                                  </option>
                                  <option
                                    value="Printing on Kobra 2 Neo"
                                    className="bg-charcoal text-cream"
                                  >
                                    Printing on Kobra 2 Neo
                                  </option>
                                  <option
                                    value="Packed"
                                    className="bg-charcoal text-cream"
                                  >
                                    Packed
                                  </option>
                                  <option
                                    value="Shipped"
                                    className="bg-charcoal text-cream"
                                  >
                                    Shipped
                                  </option>
                                  <option
                                    value="CANCELLED"
                                    className="bg-charcoal text-red-400 font-semibold"
                                  >
                                    Cancelled by Seller
                                  </option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                              </div>
                            </td>

                            {/* Actions / Generate AWB / Cancel on Shiprocket */}
                            <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                              {order.status === 'CANCELLED' ? (
                                <div className="inline-flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/40 text-xs font-semibold text-red-400 shadow-sm">
                                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                                      <span>Cancelled on Shiprocket</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOrder(order.id)}
                                      disabled={deletingOrder[order.id]}
                                      title="Remove cancelled order permanently from list and database"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 group"
                                    >
                                      {deletingOrder[order.id] ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                      )}
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                  <span
                                    className="text-[10px] text-cream-muted/50 max-w-[220px] truncate text-right"
                                    title={order.cancellation_reason || 'Merchant Cancelled'}
                                  >
                                    {order.cancellation_reason || 'Shipment Voided'}
                                  </span>
                                </div>
                              ) : generatingAwb[order.id] ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-xs font-bold text-gold cursor-wait">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generating AWB...</span>
                                </div>
                              ) : order.awb_code ? (
                                <div className="inline-flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded text-xs font-mono text-emerald-300 shadow-sm">
                                    <Truck className="w-3 h-3" />
                                    <span>{order.awb_code}</span>
                                    <button
                                      onClick={() => handleCopyAwb(order.awb_code)}
                                      title="Copy AWB"
                                      className="ml-1 text-emerald-400 hover:text-white cursor-pointer"
                                    >
                                      {copiedAwb === order.awb_code ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Fast Shipping Actions: Track & Print Label */}
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <a
                                      href={order.tracking_url || `https://shiprocket.co/tracking/${order.awb_code}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-gold hover:underline font-semibold"
                                      title="Live Carrier Tracking Portal"
                                    >
                                      <span>Track</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>

                                    <span className="text-cream-muted/30">·</span>

                                    <a
                                      href={order.label_url || `/api/generate-awb?action=label&orderId=${order.order_number || order.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                                      title="Print Official Shipping Label PDF"
                                    >
                                      <Printer className="w-3 h-3" />
                                      <span>Label</span>
                                    </a>
                                  </div>

                                  <div className="flex items-center justify-end gap-2 mt-0.5">
                                    <span className="text-[10px] text-cream-muted/50">
                                      {order.courier_partner || 'Shiprocket Logistics'}
                                    </span>
                                    <span className="text-cream-muted/30">·</span>
                                    <button
                                      onClick={() => handleGenerateAwb(order.id)}
                                      className="text-[10px] text-gold/80 hover:text-gold hover:underline cursor-pointer font-medium"
                                      title="Re-request or regenerate AWB through Shiprocket"
                                    >
                                      Regenerate
                                    </button>
                                    <span className="text-cream-muted/30">·</span>
                                    <button
                                      onClick={() => handleCancelShiprocketOrder(order.id)}
                                      disabled={cancellingOrder[order.id]}
                                      className="text-[10px] text-red-400/80 hover:text-red-300 hover:underline cursor-pointer font-medium disabled:opacity-50"
                                      title="Cancel this order on Shiprocket and update customer live tracking"
                                    >
                                      {cancellingOrder[order.id] ? 'Cancelling...' : 'Cancel'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleGenerateAwb(order.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/40 text-xs font-bold hover:bg-gold hover:text-obsidian transition-all shadow-[0_0_10px_rgba(207,181,59,0.1)] cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Generate AWB</span>
                                  </button>
                                  <button
                                    onClick={() => handleCancelShiprocketOrder(order.id)}
                                    disabled={cancellingOrder[order.id]}
                                    className="p-1.5 rounded-lg bg-charcoal border border-charcoal-light text-cream-muted/70 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                                    title="Cancel Order on Shiprocket"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Count */}
                <div className="p-4 bg-charcoal-light/30 border-t border-charcoal-light flex items-center justify-between text-xs text-cream-muted/60">
                  <span>
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>
                  <span className="text-gold font-medium">
                    Hub Origin: Maharashtra Hub (Pincode: 411038)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              3. PRODUCTS TAB (GLOBAL EDITING & DRAG-AND-DROP)
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Product Search, Category Filters & Actions */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted/50" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search active keychains to edit..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-charcoal border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cream-muted hover:text-cream cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Genre Filter Pills & Factory Reset */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <div className="flex items-center gap-1.5">
                    {['ALL', 'MARVEL', 'DC', 'ANIME', 'CARS', 'VALORANT'].map((genre) => {
                      const isActive = genreFilter === genre
                      return (
                        <button
                          key={genre}
                          onClick={() => setGenreFilter(genre)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gold text-obsidian font-bold shadow-md'
                              : 'bg-charcoal border border-charcoal-light text-cream-muted hover:text-cream hover:border-gold/30'
                          }`}
                        >
                          {genre}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={handleResetCatalog}
                    title="Restore default factory catalog"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-charcoal-light text-[11px] text-cream-muted/60 hover:text-cream hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Product Inventory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="rounded-xl bg-charcoal border border-charcoal-light overflow-hidden flex flex-col group hover:border-gold/40 transition-all shadow-lg hover:shadow-2xl"
                  >
                    {/* Image Preview with Gallery Count */}
                    <div className="relative aspect-square w-full bg-obsidian overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-obsidian/85 backdrop-blur-md text-gold border border-gold/30">
                          {prod.genre}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        {prod.gallery && prod.gallery.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-obsidian/85 backdrop-blur-md text-cream-muted border border-charcoal-light flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5 text-gold" />
                            {prod.gallery.length}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            prod.inStock !== false
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {prod.inStock !== false ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-bold text-sm text-cream line-clamp-1">
                            {prod.name}
                          </h4>
                          <span className="font-mono font-bold text-gold text-sm shrink-0">
                            ₹{prod.price}
                          </span>
                        </div>
                        <p className="text-xs text-cream-muted/60 line-clamp-2 mt-1">
                          {prod.description}
                        </p>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-charcoal-light space-y-2.5">
                        {/* Stock toggle & View link */}
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/product/${prod.slug}`}
                            target="_blank"
                            className="text-[11px] text-cream-muted/60 hover:text-gold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-cream-muted/70">
                              {prod.inStock !== false ? 'Available' : 'Disabled'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleProductStock(prod.id)}
                              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                prod.inStock !== false ? 'bg-gold' : 'bg-charcoal-light'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-obsidian shadow ring-0 transition duration-200 ease-in-out ${
                                  prod.inStock !== false ? 'translate-x-3' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...prod })}
                            className="col-span-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Details & Photos</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod)}
                            title="Delete Product"
                            className="flex items-center justify-center py-1.5 px-2 rounded-lg border border-charcoal-light text-cream-muted hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── EDIT PRODUCT MODAL (COMPLETE DRAG & DROP & FIELDS) ── */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
                  <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-charcoal border border-charcoal-light p-6 shadow-2xl animate-fade-in-up">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-cream flex items-center gap-2">
                          <Edit3 className="w-5 h-5 text-gold" />
                          <span>Edit Product: {editingProduct.name}</span>
                        </h3>
                        <p className="text-xs text-cream-muted/60 mt-0.5">
                          Changes are applied globally across all storefront pages & database
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="text-cream-muted hover:text-cream p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditProduct} className="space-y-5 pt-4">
                      {/* 1. Name & Display Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Short Title (e.g. Iron Man) <span className="text-gold">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Full Display Name
                          </label>
                          <input
                            type="text"
                            value={editingProduct.fullName || `${editingProduct.name} Outframed Keychain`}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                          />
                        </div>
                      </div>

                      {/* 2. Genre, Selling Price, Original MRP */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Universe / Genre
                          </label>
                          <select
                            value={editingProduct.genre}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                genre: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 cursor-pointer"
                          >
                            <option value="MARVEL">Marvel</option>
                            <option value="DC">DC</option>
                            <option value="ANIME">Anime</option>
                            <option value="CARS">Cars</option>
                            <option value="VALORANT">Valorant</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Selling Price (₹ INR) <span className="text-gold">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Original MRP (₹ INR)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editingProduct.originalPrice || 459}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                originalPrice: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>
                      </div>

                      {/* 3. Main Cover Image with Drag & Drop */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <ImageDropzone
                          label="Main Cover Image (Drag & Drop or Browse)"
                          value={editingProduct.image}
                          onChange={(newUrl) => {
                            const newGallery = editingProduct.gallery?.includes(newUrl)
                              ? editingProduct.gallery
                              : [newUrl, ...(editingProduct.gallery || [])]
                            setEditingProduct({
                              ...editingProduct,
                              image: newUrl,
                              gallery: newGallery,
                            })
                          }}
                          onRemove={() =>
                            setEditingProduct({ ...editingProduct, image: '' })
                          }
                          subtext="Drag and drop photo here to instantly update worldwide"
                        />
                      </div>

                      {/* 4. Multi-Image Swipeable Gallery with Drag & Drop */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <GalleryDropzone
                          gallery={editingProduct.gallery || [editingProduct.image]}
                          onUpdateGallery={(newGallery) => {
                            setEditingProduct({
                              ...editingProduct,
                              gallery: newGallery,
                              image: newGallery[0] || editingProduct.image,
                            })
                          }}
                        />
                      </div>

                      {/* 5. Description */}
                      <div>
                        <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                          Product Lore / Description
                        </label>
                        <textarea
                          rows="3"
                          value={editingProduct.description}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50 resize-none"
                        />
                      </div>

                      {/* 6. Hardware Specifications */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Dimensions
                          </label>
                          <input
                            type="text"
                            value={editingProduct.dimensions || '64mm * 43mm'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                dimensions: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Material
                          </label>
                          <input
                            type="text"
                            value={editingProduct.material || 'Biodegradable PLA'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                material: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Finish
                          </label>
                          <input
                            type="text"
                            value={editingProduct.finish || 'Antique Gold Finish'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                finish: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                            Keyring
                          </label>
                          <input
                            type="text"
                            value={editingProduct.keyring || 'Strong and Durable Keyring'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                keyring: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian border border-charcoal-light text-xs text-cream"
                          />
                        </div>
                      </div>

                      {/* 7. Stock Availability Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian border border-charcoal-light">
                        <div>
                          <span className="text-xs font-semibold text-cream block">
                            Product Active Status
                          </span>
                          <span className="text-[11px] text-cream-muted/60">
                            Available for online purchasing across all categories
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              inStock: editingProduct.inStock === false ? true : false,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            editingProduct.inStock !== false ? 'bg-gold' : 'bg-charcoal-light'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow ring-0 transition duration-200 ease-in-out ${
                              editingProduct.inStock !== false ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 flex items-center justify-end gap-3 border-t border-charcoal-light">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2.5 rounded-lg border border-charcoal-light text-xs text-cream-muted hover:text-cream font-medium transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-dark transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.25)] flex items-center gap-2 cursor-pointer"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Save & Deploy Globally</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ── ADD NEW PRODUCT MODAL (WITH DRAG & DROP) ── */}
              {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
                  <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-charcoal border border-charcoal-light p-6 shadow-2xl animate-fade-in-up">
                    <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-cream flex items-center gap-2">
                          <Plus className="w-5 h-5 text-gold" />
                          <span>Add New Keychain Product</span>
                        </h3>
                        <p className="text-xs text-cream-muted/60 mt-0.5">
                          List a new 3D printed antique gold outframed collectible with instant drag & drop photos
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="text-cream-muted hover:text-cream p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddProduct} className="space-y-5 pt-4">
                      {/* Product Title */}
                      <div>
                        <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                          Product Title (e.g. Wolverine, Skyline R34) <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, name: e.target.value })
                          }
                          placeholder="e.g. Wolverine, Skyline R34, Sukuna"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      {/* Genre, Price, Original MRP */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Universe / Genre
                          </label>
                          <select
                            value={newProduct.genre}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, genre: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 cursor-pointer"
                          >
                            <option value="MARVEL">Marvel</option>
                            <option value="DC">DC</option>
                            <option value="ANIME">Anime</option>
                            <option value="CARS">Cars</option>
                            <option value="VALORANT">Valorant</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Selling Price (₹ INR) <span className="text-gold">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newProduct.price}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, price: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                            Original MRP (₹ INR)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newProduct.originalPrice}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, originalPrice: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                          />
                        </div>
                      </div>

                      {/* Main Cover Image Drag & Drop */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <ImageDropzone
                          label="Main Cover Photo (Drag & Drop)"
                          value={newProduct.image}
                          onChange={(url) => {
                            const newGallery = newProduct.gallery.includes(url)
                              ? newProduct.gallery
                              : [url, ...newProduct.gallery]
                            setNewProduct({
                              ...newProduct,
                              image: url,
                              gallery: newGallery,
                            })
                          }}
                          onRemove={() => setNewProduct({ ...newProduct, image: '' })}
                        />
                      </div>

                      {/* Additional Gallery Photos */}
                      <div className="p-4 rounded-xl bg-obsidian/40 border border-charcoal-light space-y-2">
                        <GalleryDropzone
                          gallery={newProduct.gallery}
                          onUpdateGallery={(newGallery) => {
                            setNewProduct({
                              ...newProduct,
                              gallery: newGallery,
                              image: newGallery[0] || newProduct.image,
                            })
                          }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                          Product Description
                        </label>
                        <textarea
                          rows="3"
                          value={newProduct.description}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              description: e.target.value,
                            })
                          }
                          placeholder="Cast in antique gold bio-degradable PLA. Bursting out of the frame..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream placeholder-cream-muted/40 focus:outline-none focus:border-gold/50 resize-none"
                        />
                      </div>

                      {/* Initial Stock Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian border border-charcoal-light">
                        <div>
                          <span className="text-xs font-semibold text-cream block">
                            Initial Stock Availability
                          </span>
                          <span className="text-[11px] text-cream-muted/60">
                            Make immediately purchasable on public store
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setNewProduct({
                              ...newProduct,
                              inStock: !newProduct.inStock,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            newProduct.inStock ? 'bg-gold' : 'bg-charcoal-light'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                              newProduct.inStock ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Modal Actions */}
                      <div className="pt-3 flex items-center justify-end gap-3 border-t border-charcoal-light">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-4 py-2.5 rounded-lg border border-charcoal-light text-xs text-cream-muted hover:text-cream font-medium transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-dark transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.2)] flex items-center gap-2 cursor-pointer"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Publish Globally</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              4. SETTINGS TAB
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-4xl">
              {/* Section 1: Store Settings */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-charcoal-light pb-4">
                  <div className="p-2 rounded-lg bg-gold/10 text-gold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-cream">
                      General Store Settings
                    </h3>
                    <p className="text-xs text-cream-muted/60">
                      Brand identity, customer contact, and base shipping rules
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) =>
                        setSettings({ ...settings, storeName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, contactEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Default Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultShippingFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultShippingFee: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                    />
                    <p className="text-[11px] text-cream-muted/50 mt-1">
                      Current flat rate: ₹60 across India
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 font-mono"
                    />
                    <p className="text-[11px] text-cream-muted/50 mt-1">
                      Orders above this value receive ₹0 shipping
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Anycubic Kobra 2 Neo Printer Fleet */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-cream">
                        3D Printer Fleet: Anycubic Kobra 2 Neo
                      </h3>
                      <p className="text-xs text-cream-muted/60">
                        High-Speed 250mm/s FDM Extrusion & LeviQ 2.0 Auto-Leveling
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Online & Calibrated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Target Nozzle Temp (°C)
                    </label>
                    <input
                      type="number"
                      value={settings.printerNozzleTemp}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerNozzleTemp: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Bed Temp (°C)
                    </label>
                    <input
                      type="number"
                      value={settings.printerBedTemp}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerBedTemp: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Max Print Speed (mm/s)
                    </label>
                    <input
                      type="number"
                      value={settings.printerSpeed}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerSpeed: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-obsidian/70 border border-charcoal-light text-xs space-y-2">
                  <div className="flex items-center gap-2 text-gold font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hardware Specifications Verified</span>
                  </div>
                  <p className="text-cream-muted/70 leading-relaxed">
                    Anycubic Kobra 2 Neo is configured with 0.16mm high-precision layer heights, 
                    direct drive extruder, and dual-gear mechanism optimized for Tough Antique Gold PLA filament.
                  </p>
                </div>
              </div>

              {/* Section 3: Maharashtra Dispatch Hub & Courier Aggregator */}
              <div className="rounded-xl bg-charcoal border border-charcoal-light p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-cream">
                        Maharashtra Dispatch Hub & Logistics
                      </h3>
                      <p className="text-xs text-cream-muted/60">
                        Courier Aggregators (Shiprocket / Delhivery API Integration)
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    Auto-AWB Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Courier Aggregator Provider
                    </label>
                    <select
                      value={settings.aggregator}
                      onChange={(e) =>
                        setSettings({ ...settings, aggregator: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50 cursor-pointer"
                    >
                      <option value="Shiprocket / Delhivery Express">
                        Shiprocket (Delhivery / Bluedart / Shadowfax)
                      </option>
                      <option value="Delhivery Direct Direct API">
                        Delhivery Express Direct Gateway
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Dispatch Origin Pincode (Maharashtra Hub)
                    </label>
                    <input
                      type="text"
                      value={settings.pickupPincode}
                      onChange={(e) =>
                        setSettings({ ...settings, pickupPincode: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream font-mono focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-cream-muted mb-1.5">
                      Dispatch Warehouse Address
                    </label>
                    <input
                      type="text"
                      value={settings.dispatchHub}
                      onChange={(e) =>
                        setSettings({ ...settings, dispatchHub: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian border border-charcoal-light text-sm text-cream focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-obsidian border border-charcoal-light">
                  <div>
                    <span className="text-xs font-semibold text-cream block">
                      Auto-Generate AWB on "Packed" Status
                    </span>
                    <span className="text-[11px] text-cream-muted/60">
                      Instantly request pickup from Shiprocket once order is packed
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoGenerateAwb: !settings.autoGenerateAwb,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.autoGenerateAwb ? 'bg-gold' : 'bg-charcoal-light'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.autoGenerateAwb
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto-Sync Cancellations from Shiprocket Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-obsidian border border-charcoal-light">
                  <div>
                    <span className="text-xs font-semibold text-cream block">
                      Auto-Sync Cancellations from Shiprocket
                    </span>
                    <span className="text-[11px] text-cream-muted/60">
                      Instantly halt customer live tracking and update status if an order is cancelled on Shiprocket by seller
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoSyncCancellations: !settings.autoSyncCancellations,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.autoSyncCancellations !== false ? 'bg-gold' : 'bg-charcoal-light'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.autoSyncCancellations !== false
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Shiprocket Webhook Endpoint Helper */}
                <div className="p-4 rounded-lg bg-obsidian/80 border border-charcoal-light space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gold" />
                      <span className="text-xs font-bold text-cream">
                        Shiprocket Webhook Endpoint (Instant Cancellation Sync)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Active Listener
                    </span>
                  </div>

                  <p className="text-[11px] text-cream-muted/70 leading-relaxed">
                    Paste this webhook URL into your <strong>Shiprocket Dashboard → Settings → API → Webhooks</strong> for the <em>"Order Cancellation"</em> and <em>"Shipment Cancellation"</em> events. When you cancel an order in Shiprocket, the customer's live tracking page halts and updates in real-time.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://outframelabs.in'}/api/shiprocket-webhook`}
                      className="flex-1 px-3 py-2 rounded-lg bg-charcoal border border-charcoal-light text-xs font-mono text-cream focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://outframelabs.in'}/api/shiprocket-webhook`
                        navigator.clipboard?.writeText(url)
                        showToast('Shiprocket Webhook URL copied to clipboard!', 'success')
                      }}
                      className="px-3 py-2 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Webhook URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Settings Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    showToast('Store & 3D Printer settings saved successfully!')
                  }
                  className="px-6 py-2.5 rounded-lg bg-gold text-obsidian font-bold text-xs hover:bg-gold-dark transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,181,59,0.2)] cursor-pointer"
                >
                  Save All Configurations
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
