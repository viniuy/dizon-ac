'use client'

import { useEffect, useState } from 'react'
import { RiArrowRightLine, RiPhoneFill } from '@remixicon/react'
import { BUSINESS, NAV_LINKS } from './landing.data'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`font-[family-name:var(--font-archivo)] text-[1.75rem] leading-none font-extrabold tracking-[-0.01em] [font-stretch:125%] ${inverted ? 'text-white' : 'text-dac-ink'}`}
    >
      DIZON
    </span>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)

  // Condense into the floating bar once the page moves
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section is in the middle of the viewport; the hero clears it
  useEffect(() => {
    const sections = ['#top', ...NAV_LINKS.map(l => l.href)]
      .map(href => document.querySelector<HTMLElement>(href))
      .filter((el): el is HTMLElement => el !== null)
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setCurrent(e.target.id === 'top' ? null : `#${e.target.id}`)
      }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    // data-hero-nav: hidden until the hero entrance brings it in (see HeroSection)
    <header data-hero-nav className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
      <div
        // Padding stays fixed so only the surface changes on scroll, not the logo's position
        className={`mx-auto flex max-w-6xl items-center gap-6 rounded-full border pr-2 pl-5 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          scrolled
            ? 'h-[60px] border-black/[0.06] bg-white/80 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl'
            : 'h-[72px] border-transparent bg-transparent'
        }`}
      >
        <a href="#top" aria-label={`${BUSINESS.name} home`} className="shrink-0">
          <Logo />
        </a>

        {/* Kept quiet: small muted labels, a dot marks the section you're in */}
        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map(link => {
              const active = current === link.href
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={active ? 'true' : undefined}
                    className={`relative block py-2 text-[13.5px] font-medium transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-dac-blue after:transition-all after:duration-300 ${
                      active
                        ? 'text-dac-ink after:scale-100 after:opacity-100'
                        : 'text-dac-ink/50 after:scale-0 after:opacity-0 hover:text-dac-ink'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a
            href={BUSINESS.phone.href}
            aria-label={`Call ${BUSINESS.phone.display}`}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-[14.5px] font-semibold text-dac-ink transition-colors hover:text-dac-blue"
          >
            <RiPhoneFill className="size-4 text-dac-blue" aria-hidden />
            <span className="hidden md:inline">{BUSINESS.phone.display}</span>
          </a>
          <a
            href="#book"
            className="group inline-flex items-center gap-2 rounded-full bg-dac-blue px-5 py-2.5 text-[14.5px] font-semibold text-white transition-colors duration-300 hover:bg-dac-ink"
          >
            Book a service
            <RiArrowRightLine className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </a>
        </div>
      </div>
    </header>
  )
}
