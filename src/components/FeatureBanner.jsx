import { useScrollReveal } from '../hooks/useScrollReveal'

export default function FeatureBanner() {
  const [ref, isVisible] = useScrollReveal(0.15)

  return (
    <section ref={ref} className="relative overflow-hidden py-16 sm:py-24 border-t border-gold/15 bg-obsidian">
      {/* Subtle atmospheric gold ambient lighting */}
      <div className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/5 blur-[120px]" />

      <div
        className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: Artwork Poster (Mona Lisa & Girl with Pearl Earring - WHY INSIDE?) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Soft gold glow accent */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold/25 via-gold/10 to-gold/25 opacity-60 blur-md transition duration-500 group-hover:opacity-100" />

              <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-charcoal shadow-2xl shadow-black">
                <img
                  src="/images/why-inside-poster.jpg"
                  alt="Why Inside? Beyond the Frame artwork"
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-700 ease-out group-hover:scale-102"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right: Beyond the Frame Brand Story */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Eyebrow */}
            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-gold uppercase mb-3 sm:mb-4">
              Think out of the box
            </span>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-cream tracking-tight leading-tight">
              Beyond the Frame
            </h2>

            {/* Paragraph Body */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-cream-muted/90 max-w-2xl font-sans">
              Why follow the edges when you can redefine them? At Out Frame Lab, we create bold 3D merch that breaks through boundaries, challenges the expected, and gives your favorite characters a life beyond the conventional frame.
            </p>

            {/* Subtle Brand Accent Line */}
            <div className="mt-8 flex items-center gap-3">
              <div className="h-0.5 w-12 bg-gold/50" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold/70">
                Outframe Originals
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
