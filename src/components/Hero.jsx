import { ChevronDown } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Hero() {
  const [ref, isVisible] = useScrollReveal(0.1)

  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-black pb-12 pt-20 sm:pb-16">
      {/* Background Graphic */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
        <img
          src="/hero-bg.jpg"
          alt="Outframe Labs - Spider-Man breaking out of frame"
          className="h-full w-full object-contain md:object-cover md:object-center filter contrast-105"
          loading="eager"
        />
        {/* Soft Vignettes & Gradients for seamless black blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Decorative Gold Side Accents */}
      <div className="absolute left-4 top-1/3 hidden h-32 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent sm:block sm:left-8" />
      <div className="absolute right-4 top-1/3 hidden h-32 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent sm:block sm:right-8" />

      {/* Content Positioned Elegantly over Bottom */}
      <div
        ref={ref}
        className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8"
      >
        {/* Headline */}
        <h1
          className={`font-heading text-4xl font-extrabold tracking-tight text-cream sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Break the{' '}
          <span className="bg-gradient-to-r from-gold via-yellow-200 to-gold bg-clip-text text-transparent">
            Boundary.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className={`mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cream-muted sm:text-base transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Antique gold keychains that refuse to stay in the frame.
          <br className="hidden sm:block" />
          Crafted for those who carry something extraordinary.
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <a
            href="#genres"
            className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-xl shadow-gold/20 hover:shadow-gold/40"
          >
            Explore Universes
          </a>
          <a
            href="#products"
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-obsidian/70 px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-cream backdrop-blur-md transition-all hover:border-gold hover:bg-gold/10 hover:text-gold"
          >
            View All Keychains
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="relative z-10 mt-6 flex justify-center animate-bounce text-cream-muted/50">
        <a href="#genres" aria-label="Scroll to genres">
          <ChevronDown className="h-5 w-5 hover:text-gold transition-colors" />
        </a>
      </div>
    </section>
  )
}
