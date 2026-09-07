import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import MarqueeBanner from '../components/MarqueeBanner'
import GenreShowcase from '../components/GenreShowcase'
import ProductGrid from '../components/ProductGrid'
import FeatureBanner from '../components/FeatureBanner'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import ReviewsModal from '../components/ReviewsModal'
import WishlistDrawer from '../components/WishlistDrawer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main>
        <Hero />
        <MarqueeBanner />
        <GenreShowcase />
        <ProductGrid />
        <FeatureBanner />
      </main>
      <Footer />
      <CartDrawer />
      <ReviewsModal />
      <WishlistDrawer />
    </div>
  )
}
