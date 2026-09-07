-- ==============================================================================
-- OUTFRAME LABS — PRODUCTION DATABASE SETUP & SEED SCRIPT (PostgreSQL / Supabase)
-- ==============================================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Click on your project -> Click "SQL Editor" in the left sidebar
-- 3. Paste this entire script and click "Run"
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. PROFILES (Extends Supabase Auth users) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. ADDRESSES (Customer Delivery Addresses) ──
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

-- ── 3. CATEGORIES / UNIVERSES ──
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. PRODUCTS (Antique Gold Outframed Keychains) ──
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

-- ── 5. PRODUCT REVIEWS ──
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

-- ── 6. ORDERS (Checkout & Live Tracking) ──
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
  status TEXT DEFAULT 'Payment Received',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 7. ORDER ITEMS ──
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  image TEXT
);

-- ── 8. SHIPMENTS (Shiprocket & Courier Tracking) ──
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  courier_partner TEXT DEFAULT 'Delhivery Air (Express)',
  awb_code TEXT,
  tracking_url TEXT,
  status TEXT DEFAULT 'Payment Received',
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 9. TRACKING EVENTS ──
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id SERIAL PRIMARY KEY,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  activity TEXT NOT NULL,
  location TEXT,
  event_time TIMESTAMPTZ DEFAULT now()
);

-- ── 10. WISHLISTS ──
CREATE TABLE IF NOT EXISTS public.wishlists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ── 11. CART ITEMS ──
CREATE TABLE IF NOT EXISTS public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ── ROW LEVEL SECURITY (RLS) POLICIES ──
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

-- Allow public read access to catalog, reviews, orders tracking, profiles, addresses
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Public addresses read" ON public.addresses FOR SELECT USING (true);
CREATE POLICY "Public addresses insert" ON public.addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public addresses update" ON public.addresses FOR UPDATE USING (true);

CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public products write" ON public.products FOR ALL USING (true);
CREATE POLICY "Public reviews read" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Public orders tracking read" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public orders update" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Public order items read" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public order items insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public shipments read" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Public shipments insert" ON public.shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public shipments update" ON public.shipments FOR UPDATE USING (true);
CREATE POLICY "Public tracking events read" ON public.tracking_events FOR SELECT USING (true);
CREATE POLICY "Public tracking events insert" ON public.tracking_events FOR INSERT WITH CHECK (true);

-- Realtime Publication for Live Tracking & Admin sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;

-- ── SEED INITIAL CATEGORIES ──
INSERT INTO public.categories (id, name, slug, image_url) VALUES
('MARVEL', 'Marvel', 'marvel-outframed-keychains', 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=900&q=80'),
('DC', 'DC', 'dc-outframed-keychains', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=900&q=80'),
('ANIME', 'Anime', 'anime-outframed-keychains', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&q=80'),
('CARS', 'Cars', 'cars-outframed-keychains', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80'),
('VALORANT', 'Valorant', 'valorant-outframed-keychains', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80')
ON CONFLICT (id) DO NOTHING;

-- ── SEED INITIAL PRODUCTS ──
INSERT INTO public.products (id, name, full_name, slug, genre, price, original_price, image, gallery, description) VALUES
(1, 'Iron Man', 'Iron Man Outframed Keychain', 'iron-man-outframed-keychain', 'MARVEL', 249.00, 459.00, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'], 'Bring the genius billionaire Avenger everywhere with the Iron Man Outframed Keychain. Featuring the iconic Mark LXXXV helmet and arc core bursting outward beyond a solid antique gold frame.'),
(2, 'Spider-Man', 'Spider-Man Outframed Keychain', 'spider-man-outframed-keychain', 'MARVEL', 249.00, 459.00, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'], 'Swing through the city with the Spider-Man Outframed Keychain. Capturing Peter Parker dynamic web-slinging pose protruding past the frame in warm antique gold patina.'),
(3, 'Thor', 'Thor Outframed Keychain', 'thor-outframed-keychain', 'MARVEL', 189.00, 459.00, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'], 'Channel the power of thunder with the Thor Outframed Keychain. Forged with Mjolnir and Asgardian lightning runes breaking over the gold frame border.'),
(4, 'Batman', 'Batman Outframed Keychain', 'batman-outframed-keychain', 'DC', 249.00, 459.00, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'], 'Embrace Gotham nocturnal vigilante with the Dark Knight Batman Outframed Keychain. Precision-contoured with the bat cowl piercing through the metallic border in shadowed antique gold.'),
(5, 'Porsche', 'Porsche Outframed Keychain', 'porsche-outframed-keychain', 'CARS', 249.00, 459.00, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'], 'Engineered for motorsport purists, the Porsche Outframed Keychain captures the aerodynamic swan-neck GT3 wing and widebody rear track breaking out of frame in timeless antique gold.'),
(6, 'Jett', 'Jett Outframed Keychain', 'jett-outframed-keychain', 'VALORANT', 249.00, 459.00, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'], 'Unleash the wind storm with the Jett Outframed Keychain. Designed with Jett signature aerodynamic kunai blade extending past the frame in antique gold.'),
(7, 'Gojo', 'Gojo Outframed Keychain', 'gojo-outframed-keychain', 'ANIME', 189.00, 459.00, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'], 'Command the limitless with the Satoru Gojo Outframed Keychain. Features the six-eyes blindfold emblem and infinite domain seals breaking beyond bounds in antique gold.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description;

-- Restart sequence counter for products
SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products));
