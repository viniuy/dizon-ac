'use client'

import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Our Work', href: '#gallery'  },
  { label: 'Coverage', href: '#map'      },
  { label: 'Reviews',  href: '#reviews'  },
  { label: 'Contact',  href: '#contact'  },
] as const

// ── Theme toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'))
  }, [])

  const toggle = () => {
    const html = document.documentElement
    if (html.classList.contains('light')) {
      html.classList.remove('light')
      localStorage.setItem('dac-theme', 'dark')
      setIsLight(false)
    } else {
      html.classList.add('light')
      localStorage.setItem('dac-theme', 'light')
      setIsLight(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
    >
      {isLight ? (
        // Moon icon — click to go dark
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        // Sun icon — click to go light
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1"  x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1"  y1="12" x2="3"  y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          paddingInline: 'clamp(1.25rem, 5vw, 3rem)',
          background: scrolled
            ? 'var(--dac-nav-bg-scroll)'
            : 'var(--dac-nav-bg-top)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid var(--dac-border)'
            : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          className="flex items-center gap-2 font-syne font-bold text-dac-text"
          style={{ fontSize: '1.075rem', letterSpacing: '-0.015em' }}
          aria-label="Dizon AC home"
        >
          <span
            className="w-[7px] h-[7px] rounded-full bg-dac-accent animate-logo-pulse"
            style={{ boxShadow: '0 0 8px var(--dac-accent-glow)' }}
          />
          DIZON <span className="text-dac-accent">AC</span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-[clamp(1.25rem,2.5vw,2rem)] ml-auto mr-5">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-dac-muted text-sm hover:text-dac-text transition-colors duration-150 font-figtree"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop: theme toggle + CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />
          <a
            href="#contact"
            className="dac-btn-primary"
            style={{ padding: '0.5rem 1.125rem', fontSize: '0.875rem' }}
          >
            Book Service
          </a>
        </div>

        {/* Mobile: theme + call + hamburger */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <ThemeToggle />
          <a
            href="tel:+639177800051"
            className="text-dac-accent font-syne font-bold text-sm px-2"
            aria-label="Call us"
          >
            Call
          </a>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span
              className="block h-[1.5px] bg-dac-text transition-all duration-300 origin-center"
              style={{
                width: 20,
                transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block h-[1.5px] bg-dac-text transition-all duration-200"
              style={{ width: 13, opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-[1.5px] bg-dac-text transition-all duration-300 origin-center"
              style={{
                width: 20,
                transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          pointerEvents: menuOpen ? 'auto' : 'none',
          opacity: menuOpen ? 1 : 0,
          background: 'var(--dac-menu-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          paddingTop: 64,
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col px-8 pt-8 gap-0">
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              onClick={closeMenu}
              className="font-syne font-bold text-dac-text border-b border-dac-border py-4"
              style={{
                fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                transform: menuOpen ? 'translateX(0)' : 'translateX(-14px)',
                opacity: menuOpen ? 1 : 0,
                transition: `transform 0.3s ease ${i * 40}ms, opacity 0.3s ease ${i * 40}ms`,
              }}
            >
              {label}
            </a>
          ))}

          <a
            href="#contact"
            onClick={closeMenu}
            className="dac-btn-primary mt-8 text-center justify-center"
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(-14px)',
              opacity: menuOpen ? 1 : 0,
              transition: 'transform 0.3s ease 220ms, opacity 0.3s ease 220ms',
            }}
          >
            Book a Service
          </a>

          <div
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid var(--dac-border)' }}
          >
            <p className="text-dac-dim text-xs mb-3 uppercase tracking-[0.12em] font-figtree">
              Call or Text
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:+639177800051" className="text-dac-accent font-syne font-semibold text-sm">
                0917 780 0051 · Globe
              </a>
              <a href="tel:+639999665008" className="text-dac-accent font-syne font-semibold text-sm">
                0999 966 5008 · Smart
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
