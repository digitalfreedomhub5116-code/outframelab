import { useScrollReveal } from '../hooks/useScrollReveal'
import { GENRES } from '../store/cartStore'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const [ref, isVisible] = useScrollReveal(0.1)
  const navigate = useNavigate()

  const handleGenreClick = (slug) => {
    navigate(`/${slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer ref={ref} className="relative border-t border-gold/15 bg-obsidian">
      <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div
        className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="font-heading text-xl font-bold tracking-[0.2em] text-cream">
              OUTFRAME
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-muted/70">
              Antique gold outframed keychains across Marvel, DC, Anime, Cars & Valorant.
              Break the boundary.
            </p>
          </div>

          {/* Genres */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              Universes
            </h4>
            <ul className="mt-4 space-y-2.5">
              {GENRES.map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => handleGenreClick(g.slug)}
                    className="text-sm text-cream-muted/70 transition-colors hover:text-gold text-left"
                  >
                    {g.label} Outframed
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              Outframe Labs
            </h4>
            <ul className="mt-4 space-y-2.5">
              {['About Us', 'Shipping Info', 'Returns', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-cream-muted/70 transition-colors hover:text-gold">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              Drop Notifications
            </h4>
            <p className="mt-4 text-sm text-cream-muted/70">
              Get notified when new drops go live.
            </p>
            <div className="mt-3 flex">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-l-full border border-charcoal-light bg-charcoal px-4 py-2.5 text-sm text-cream placeholder-cream-muted/40 outline-none transition-colors focus:border-gold/50"
              />
              <button className="rounded-r-full bg-gold px-5 py-2.5 text-sm font-bold text-obsidian transition-all hover:bg-gold-dark">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-charcoal-light pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-cream-muted/40">
            © 2026 Outframe Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Shipping Policy'].map((link) => (
              <a key={link} href="#" className="text-xs text-cream-muted/40 transition-colors hover:text-gold">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
