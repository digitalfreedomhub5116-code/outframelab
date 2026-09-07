-- ==========================================================
-- OUT FRAME LABS DATABASE SCHEMA & SEED DATA (Supabase / Postgres)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ADDRESSES (Customer Delivery Addresses)
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CATEGORIES / GENRES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PRODUCTS (Antique Gold Outframed Keychains)
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  genre TEXT REFERENCES public.categories(id),
  price NUMERIC(10,2) NOT NULL DEFAULT 189.00,
  original_price NUMERIC(10,2) NOT NULL DEFAULT 459.00,
  stock INTEGER DEFAULT 50,
  rating NUMERIC(3,2) DEFAULT 4.8,
  review_count INTEGER DEFAULT 11,
  bad_count INTEGER DEFAULT 1,
  description TEXT,
  material TEXT DEFAULT 'Biodegradable PLA Material',
  dimensions TEXT DEFAULT '64mm * 43mm',
  finish TEXT DEFAULT 'Antique Gold Finish with Protective Patina',
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  key_features TEXT[] DEFAULT '{
    "Each keychain is made from bio degradable PLA material.",
    "Strong and durable keyring",
    "Antique gold finish",
    "Durable impact-resistant outframed body",
    "Dimensions: 64mm * 43mm"
  }',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PRODUCT REVIEWS (Indian Customer Feedback)
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  date TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ORDERS (Customer Checkout & Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_fee NUMERIC(10,2) DEFAULT 60.00,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'PENDING',
  status TEXT DEFAULT 'PLACED',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  image TEXT
);

-- 8. SHIPMENTS (Shiprocket & Courier Integration)
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  courier_partner TEXT DEFAULT 'Delhivery Surface',
  awb_code TEXT,
  tracking_url TEXT,
  status TEXT DEFAULT 'MANIFESTED',
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. TRACKING EVENTS (Real-Time Timeline Logs)
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id SERIAL PRIMARY KEY,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  activity TEXT NOT NULL,
  location TEXT,
  event_time TIMESTAMPTZ DEFAULT now()
);

-- 10. WISHLISTS (Saved Products)
CREATE TABLE IF NOT EXISTS public.wishlists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 11. CART ITEMS (Persistent User Carts)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- POLICIES (Public read for catalog & reviews)
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public reviews read" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Public orders tracking read" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public order items read" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public shipments read" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Public tracking events read" ON public.tracking_events FOR SELECT USING (true);

-- REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;
