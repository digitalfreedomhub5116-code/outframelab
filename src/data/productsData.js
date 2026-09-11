import { REVIEWS_POOL } from './reviewsData'

const DUMMY_GALLERY = [
  'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg',
  'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/iron-man-1-cover.jpg',
  'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/spider-man-2-cover.jpg',
  'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/captain-america-5-cover.jpg',
]

export const GENRES = [
  {
    id: 'MARVEL',
    label: 'Marvel',
    slug: 'marvel-outframed-keychains',
    image: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=900&q=80',
  },
  {
    id: 'DC',
    label: 'DC',
    slug: 'dc-outframed-keychains',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=900&q=80',
  },
  {
    id: 'ANIME',
    label: 'Anime',
    slug: 'anime-outframed-keychains',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&q=80',
  },
  {
    id: 'CARS',
    label: 'Cars',
    slug: 'cars-outframed-keychains',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80',
  },
  {
    id: 'VALORANT',
    label: 'Valorant',
    slug: 'valorant-outframed-keychains',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80',
  },
]

const CHARACTER_DESCRIPTIONS = {
  'Iron Man': 'Bring the genius billionaire Avenger everywhere with the Iron Man Outframed Keychain. Featuring the iconic Mark LXXXV helmet and arc core bursting outward beyond a solid antique gold frame, this handcrafted piece turns everyday keys into a wearable Marvel collectible.',
  'Spider-Man': 'Swing through the city with the Spider-Man Outframed Keychain. Capturing Peter Parker dynamic web-slinging pose protruding past the frame in warm antique gold patina, it brings the ultimate neighborhood superhero to your daily carry.',
  'Thor': 'Channel the power of thunder with the Thor Outframed Keychain. Forged with Mjolnir and Asgardian lightning runes breaking over the gold frame border, this piece carries true mythical weight.',
  'Hulk': 'Unleash raw strength with the Hulk Outframed Keychain. Sculpted with the colossal fists and raging silhouette smashing through the antique gold boundary, built to withstand daily drops.',
  'Captain America': 'Carry the First Avenger legacy with the Captain America Outframed Keychain. Showcasing the star-spangled vibranium shield bursting past the frame in antique gold finish.',
  'Batman': 'Embrace Gotham nocturnal vigilante with the Dark Knight Batman Outframed Keychain. Precision-contoured with the bat cowl and cowl ears piercing through the metallic border in shadowed antique gold.',
  'Superman': 'Display the Kryptonian House of El hope crest with the Superman Outframed Keychain. 3D embossed with the iconic S-shield soaring past the frame in rich gold alloy tone.',
  'Porsche': 'Engineered for motorsport purists, the Porsche Outframed Keychain captures the aerodynamic swan-neck GT3 wing and widebody rear track breaking out of frame in timeless antique gold.',
  'Mustang': 'Capture pure American muscle with the Mustang Outframed Keychain. Sculpted with the galloping pony and aggressive front hood vents roaring past the outer frame.',
  'BMW': 'Celebrate Bavarian performance heritage with the BMW M Outframed Keychain. Features the aggressive twin-kidney grille and M-power silhouette breaking through the antique gold border.',
  'Ferrari': 'Italian passion meets artisan craft in the Ferrari Outframed Keychain. Showcasing the prancing stallion aerodynamic curves leaping out from the antique gold frame.',
  'Jett': 'Unleash the wind storm with the Jett Outframed Keychain. Designed with Jett signature aerodynamic kunai blade extending past the frame, this piece is built for Valorant clutch players.',
  'Reyna': 'Embrace Radiant dominance with the Reyna Empress Outframed Keychain. Detailed with the terrifying soul orb eye and dark gold tendrils stretching beyond the boundary.',
  'Sage': 'Provide balance and protection with the Sage Outframed Keychain. Sculpted with the crystalline healing orb motif breaking through the antique gold frame.',
  'Chamber': 'Dine in luxury with the Chamber Outframed Keychain. Inspired by the French weapons designer bespoke gold card silhouette and Tour de Force sniper motif.',
  'Clove': 'Defy mortality with the Clove Outframed Keychain. Featuring immortal butterfly wings and mischievous controller energy fluttering past the gold frame border.',
  'Naruto': 'Channel the yellow flash of the Hidden Leaf with the Naruto Outframed Keychain. Detailed with the Flying Raijin teleportation kunai blade protruding through the antique gold frame.',
  'Luffy': 'Set sail for the Grand Line with the Luffy Outframed Keychain. Features the iconic straw hat and Gear silhouette stretching outward beyond the antique gold frame.',
  'Ichigo': 'Awaken your inner soul reaper with the Ichigo Outframed Keychain. Features the Tensa Zangetsu sword guard and hollow mask horn protruding past the border.',
  'Goku': 'Go beyond your limits with the Goku Outframed Keychain. Capturing Super Saiyan flowing hair and Kamehameha stance bursting past the antique gold frame.',
  'Aizen': 'Rule the Espada with the Aizen Outframed Keychain. Crafted with the Hogyoku emblem and calm sinister silhouette breaking beyond normal limits in antique gold.',
  'Madara': 'Witness true power with the Madara Uchiha Outframed Keychain. Featuring the eternal Mangekyo Sharingan and gunbai fan bursting through the antique gold boundary.',
  'Doflamingo': 'Rule Dressrosa with the Doflamingo Outframed Keychain. Designed with the feathered coat texture and razor thread strings slicing right through the frame.',
  'Gojo': 'Command the limitless with the Satoru Gojo Outframed Keychain. Features the six-eyes blindfold emblem and infinite void domain seals breaking beyond bounds in antique gold.',
  'Sukuna': 'Embrace the King of Curses with the Ryomen Sukuna Outframed Keychain. Features malevolent shrine markings and cleaved demonic claws bursting outward in antique gold.',
}

const RAW_PRODUCTS = [
  // ── MARVEL ── (₹299)
  {
    id: 1,
    name: 'Iron Man',
    genre: 'MARVEL',
    price: 299,
    originalPrice: 599,
    reviewCount: 11,
    rating: 4.7,
    badCount: 2,
    image: 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/gallery-1789010822520-6i1jc9.jpg',
    gallery: [
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/gallery-1789010822520-6i1jc9.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/gallery-1789010913395-igqx67.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/iron-man-1-gallery-3.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/gallery-1789010815984-z7nf0u.jpg',
    ],
  },
  {
    id: 2,
    name: 'Spider-Man',
    genre: 'MARVEL',
    price: 299,
    originalPrice: 599,
    reviewCount: 13,
    rating: 4.8,
    badCount: 2,
    image: 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/spider-man-2-cover.jpg',
    gallery: [
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/spider-man-2-cover.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/spider-man-2-gallery-1.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/spider-man-2-gallery-2.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/spider-man-2-gallery-3.jpg',
    ],
  },
  {
    id: 3,
    name: 'Thor',
    genre: 'MARVEL',
    price: 299,
    originalPrice: 599,
    reviewCount: 9,
    rating: 4.6,
    badCount: 2,
    image: 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/thor-3-cover.jpg',
    gallery: [
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/thor-3-cover.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/thor-3-gallery-1.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/thor-3-gallery-2.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/thor-3-gallery-3.jpg',
    ],
  },
  {
    id: 4,
    name: 'Hulk',
    genre: 'MARVEL',
    price: 299,
    originalPrice: 599,
    reviewCount: 7,
    rating: 4.7,
    badCount: 1,
    image: 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/hulk-4-cover.jpg',
    gallery: [
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/hulk-4-cover.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/hulk-4-gallery-1.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/hulk-4-gallery-2.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/hulk-4-gallery-3.jpg',
    ],
  },
  {
    id: 5,
    name: 'Captain America',
    genre: 'MARVEL',
    price: 299,
    originalPrice: 599,
    reviewCount: 15,
    rating: 4.8,
    badCount: 2,
    image: 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/captain-america-5-cover.jpg',
    gallery: [
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/captain-america-5-cover.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/captain-america-5-gallery-1.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/captain-america-5-gallery-2.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/captain-america-5-gallery-3.jpg',
    ],
  },

  // ── DC ── (₹299)
  {
    id: 6,
    name: 'Batman',
    genre: 'DC',
    price: 299,
    originalPrice: 599,
    reviewCount: 13,
    rating: 4.9,
    badCount: 2,
    image: 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg',
    gallery: [
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-cover.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-gallery-1.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-gallery-2.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/batman-6-gallery-3.jpg',
    ],
  },
  {
    id: 7,
    name: 'Superman',
    genre: 'DC',
    price: 299,
    originalPrice: 599,
    reviewCount: 9,
    rating: 4.8,
    badCount: 1,
    image: 'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/superman-7-cover.jpg',
    gallery: [
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/superman-7-cover.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/superman-7-gallery-1.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/superman-7-gallery-2.jpg',
      'https://sooedjbqgrdjtwiobjpr.supabase.co/storage/v1/object/public/product-images/superman-7-gallery-3.jpg',
    ],
  },

  // ── CARS ── (₹299)
  {
    id: 8,
    name: 'Porsche',
    genre: 'CARS',
    price: 299,
    originalPrice: 599,
    reviewCount: 15,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'],
  },
  {
    id: 9,
    name: 'Mustang',
    genre: 'CARS',
    price: 299,
    originalPrice: 599,
    reviewCount: 11,
    rating: 4.7,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&q=80'],
  },
  {
    id: 10,
    name: 'BMW',
    genre: 'CARS',
    price: 299,
    originalPrice: 599,
    reviewCount: 13,
    rating: 4.8,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'],
  },
  {
    id: 11,
    name: 'Ferrari',
    genre: 'CARS',
    price: 299,
    originalPrice: 599,
    reviewCount: 9,
    rating: 4.8,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80'],
  },

  // ── VALORANT ── (₹299)
  {
    id: 12,
    name: 'Jett',
    genre: 'VALORANT',
    price: 299,
    originalPrice: 599,
    reviewCount: 15,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80'],
  },
  {
    id: 13,
    name: 'Reyna',
    genre: 'VALORANT',
    price: 299,
    originalPrice: 599,
    reviewCount: 11,
    rating: 4.7,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80'],
  },
  {
    id: 14,
    name: 'Sage',
    genre: 'VALORANT',
    price: 299,
    originalPrice: 599,
    reviewCount: 7,
    rating: 4.8,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80'],
  },
  {
    id: 15,
    name: 'Chamber',
    genre: 'VALORANT',
    price: 299,
    originalPrice: 599,
    reviewCount: 9,
    rating: 4.8,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'],
  },
  {
    id: 16,
    name: 'Clove',
    genre: 'VALORANT',
    price: 299,
    originalPrice: 599,
    reviewCount: 7,
    rating: 4.6,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80'],
  },

  // ── ANIME ── (₹299)
  {
    id: 17,
    name: 'Naruto',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 15,
    rating: 4.9,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80'],
  },
  {
    id: 18,
    name: 'Luffy',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 13,
    rating: 4.8,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80'],
  },
  {
    id: 19,
    name: 'Ichigo',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 9,
    rating: 4.6,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80'],
  },
  {
    id: 20,
    name: 'Goku',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 15,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80'],
  },
  {
    id: 21,
    name: 'Aizen',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 11,
    rating: 4.8,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80'],
  },
  {
    id: 22,
    name: 'Madara',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 13,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80'],
  },
  {
    id: 23,
    name: 'Doflamingo',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 7,
    rating: 4.7,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80'],
  },
  {
    id: 24,
    name: 'Gojo',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 15,
    rating: 5.0,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'],
  },
  {
    id: 25,
    name: 'Sukuna',
    genre: 'ANIME',
    price: 299,
    originalPrice: 599,
    reviewCount: 13,
    rating: 4.8,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&q=80'],
  },
]

export function buildProductReviews(product = {}) {
  const reviews = []
  const count = Number(product.reviewCount) || 11
  const badTarget = Number(product.badCount) || 2
  const numId = Number(product.id) || 1

  // Add bad reviews first (1 to 5 as specified)
  for (let i = 0; i < badTarget && i < REVIEWS_POOL.critical.length; i++) {
    const pick = REVIEWS_POOL.critical[(numId + i) % REVIEWS_POOL.critical.length]
    reviews.push({
      id: `bad-${numId}-${i}`,
      name: pick.name,
      rating: pick.rating,
      date: `${(i + 2)} days ago`,
      text: pick.text,
      verified: true,
    })
  }

  // Genre specific positive reviews if available
  const genre = product.genre || 'MARVEL'
  const genreList = REVIEWS_POOL.genreSpecific[genre] || []
  if (genreList.length > 0 && reviews.length < count) {
    const genreReview = genreList[numId % genreList.length]
    reviews.push({
      id: `genre-${numId}`,
      name: genreReview.name,
      rating: 5,
      date: "Just now",
      text: genreReview.text,
      verified: true,
    })
  }

  // Fill remaining with positive general reviews
  let posIndex = (numId * 3) % REVIEWS_POOL.positive.length
  while (reviews.length < count) {
    const item = REVIEWS_POOL.positive[posIndex % REVIEWS_POOL.positive.length]
    reviews.push({
      id: `pos-${numId}-${reviews.length}`,
      name: item.name,
      rating: (reviews.length % 4 === 0) ? 4 : 5,
      date: `${(reviews.length + 1) * 2} days ago`,
      text: item.text,
      verified: true,
    })
    posIndex++
  }

  return reviews
}

export const MOCK_PRODUCTS = RAW_PRODUCTS.map((p) => {
  const reviews = buildProductReviews(p)
  const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-outframed-keychain`
  const fullName = `${p.name} Outframed Keychain`
  const description = CHARACTER_DESCRIPTIONS[p.name] || `Antique gold ${p.name} outframed keychain crafted for collectors.`

  const originalPrice = p.originalPrice || 599
  const discountPercent = Math.round(((originalPrice - p.price) / originalPrice) * 100)
  const discountBadge = `-${discountPercent}%`
  const isBestseller = p.name === 'Iron Man' || p.name === 'Hulk' || p.id === 1 || p.id === 4

  return {
    ...p,
    slug,
    fullName,
    originalPrice,
    discountPercent,
    isBestseller,
    image: p.image || DUMMY_GALLERY[0],
    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : (p.image ? [p.image] : DUMMY_GALLERY),
    description,
    features: [
      'Each keychain is made from bio degradable PLA material.',
      'Strong and durable keyring',
      'Antique gold finish',
      'Durable.',
      'Dimensions: 64mm * 43mm',
    ],
    dimensions: '64mm * 43mm',
    material: 'Biodegradable PLA',
    finish: 'Antique Gold Finish',
    keyring: 'Strong and Durable Keyring',
    durability: 'Durable Impact Resistant Structure',
    reviews,
  }
})
