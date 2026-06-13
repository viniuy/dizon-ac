import Link from 'next/link'
import { FOOTER_LINKS, PHONE_NUMBERS } from './landing.data'

const SOCIAL = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
] as const

export function LandingFooter() {
  return (
    <footer
      className="relative z-[1]"
      style={{
        background: 'rgba(7,16,28,0.98)',
        borderTop: '1px solid rgba(56,189,248,0.1)',
      }}
    >
      <div
        className="max-w-[1120px] mx-auto
                   px-[clamp(1.25rem,5vw,3rem)]
                   pt-[clamp(3rem,6vh,5rem)] pb-8"
      >
        {/* Top row */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]
                     gap-[clamp(2rem,4vw,3.5rem)] mb-12"
        >
          {/* Brand col */}
          <div>
            <a
              href="#hero"
              className="inline-flex items-center gap-2 font-syne font-extrabold
                         tracking-[-0.025em] text-dac-text mb-4"
              style={{ fontSize: '1.1rem' }}
            >
              <span
                className="w-[7px] h-[7px] rounded-full bg-dac-accent animate-logo-pulse"
                style={{ boxShadow: '0 0 8px rgba(56,189,248,0.8)' }}
              />
              DIZON <span className="text-dac-accent">AC</span>
            </a>

            <p
              className="text-dac-muted font-figtree text-sm leading-[1.7] mb-5"
              style={{ maxWidth: 240 }}
            >
              Professional airconditioning &amp; refrigeration services. Trusted by
              thousands of homes and businesses across Metro Manila.
            </p>

            {/* Quick phones */}
            <div className="flex flex-col gap-1.5 mb-5">
              {PHONE_NUMBERS.slice(0, 2).map(({ network, number, href }) => (
                <a
                  key={number}
                  href={href}
                  className="text-dac-muted text-sm font-figtree hover:text-dac-accent
                             transition-colors duration-150 flex items-center gap-2"
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{ background: '#38bdf8' }}
                  />
                  {number}
                  <span className="text-dac-dim text-xs">· {network}</span>
                </a>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center
                             text-dac-muted transition-all duration-200 hover:text-dac-accent"
                  style={{
                    background: 'rgba(56,189,248,0.06)',
                    border: '1px solid rgba(56,189,248,0.12)',
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {(
            Object.entries(FOOTER_LINKS) as [
              string,
              readonly { label: string; href: string; accent?: boolean }[],
            ][]
          ).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-syne font-bold text-dac-text text-sm mb-5 tracking-[-0.01em]">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, href, accent }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`text-sm font-figtree transition-colors duration-150 ${
                        accent
                          ? 'text-dac-accent hover:text-dac-accent-dark'
                          : 'text-dac-muted hover:text-dac-text'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-wrap justify-between items-center gap-3 pt-6"
          style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}
        >
          <span className="text-dac-dim text-xs font-figtree">
            © {new Date().getFullYear()} Dizon Aircon &amp; Refrigeration Services.
            All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="text-dac-dim text-xs font-figtree">
              Bambang, Taguig, Philippines
            </span>
            <Link
              href="/login"
              className="text-dac-dim text-xs font-figtree hover:text-dac-muted
                         transition-colors duration-150"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
