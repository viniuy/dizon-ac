'use client'

import { useEffect, useRef, useState } from 'react'
import { RiArrowRightLine, RiCloseLine, RiPhoneFill } from '@remixicon/react'
import { BUSINESS, NAV_LINKS } from './landing.data'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`text-[2rem] leading-none font-bold tracking-[-0.04em] ${inverted ? 'text-white' : 'text-dac-bright'}`}
    >
      dizon<span className="text-dac-amber">.</span>
    </span>
  )
}

type Pill = { left: number; width: number; visible: boolean }

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const [pill, setPill] = useState<Pill>({ left: 0, width: 0, visible: false })
  const listRef = useRef<HTMLUListElement>(null)

  // Condense into the floating bar once the page moves
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section is in the middle of the viewport
  useEffect(() => {
    const sections = NAV_LINKS
      .map(l => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => el !== null)
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setCurrent(`#${e.target.id}`) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  // Highlight follows the hovered link, otherwise rests on the current section
  const moveTo = (href: string | null) => {
    const el = href ? listRef.current?.querySelector<HTMLElement>(`a[href="${href}"]`) : null
    setPill(el ? { left: el.offsetLeft, width: el.offsetWidth, visible: true } : p => ({ ...p, visible: false }))
  }
  useEffect(() => { moveTo(current) }, [current])

  // Full-screen mobile menu: lock page scroll, close on Escape
  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    html.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      html.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      {/* data-hero-nav: hidden until the hero entrance brings it in (see HeroSection) */}
      <header data-hero-nav className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
        <div
          className={`mx-auto flex max-w-6xl items-center gap-6 rounded-full border transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
            scrolled
              ? 'h-[60px] border-black/[0.06] bg-white/80 pr-2 pl-5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl'
              : 'h-[72px] border-transparent bg-transparent px-2'
          }`}
        >
          <a href="#top" aria-label={`${BUSINESS.name} home`} className="shrink-0">
            <Logo />
          </a>

          <nav aria-label="Main" className="mx-auto hidden lg:block">
            <ul
              ref={listRef}
              onMouseLeave={() => moveTo(current)}
              className="relative flex items-center text-[14.5px]"
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 rounded-full bg-dac-ink/[0.06] transition-all duration-300 ease-out ${
                  pill.visible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ left: pill.left, width: pill.width }}
              />
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onMouseEnter={() => moveTo(link.href)}
                    onFocus={() => moveTo(link.href)}
                    aria-current={current === link.href ? 'true' : undefined}
                    className={`relative block rounded-full px-4 py-2 transition-colors duration-300 ${
                      current === link.href ? 'text-dac-ink' : 'text-dac-ink/60 hover:text-dac-ink'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <a
              href={BUSINESS.phone.href}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-[14.5px] font-semibold text-dac-ink transition-colors hover:text-dac-blue md:flex"
            >
              <RiPhoneFill className="size-4 text-dac-blue" aria-hidden />
              {BUSINESS.phone.display}
            </a>
            <a
              href="#book"
              className="hidden rounded-full bg-dac-blue px-5 py-2.5 text-[14.5px] font-semibold text-white transition-colors duration-300 hover:bg-dac-ink sm:inline-flex"
            >
              Book a service
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(true)}
              className="flex h-11 items-center gap-2.5 rounded-full px-4 text-[14px] font-semibold text-dac-ink lg:hidden"
            >
              Menu
              <span aria-hidden className="flex w-5 flex-col gap-[5px]">
                <span className="h-0.5 w-full rounded-full bg-current" />
                <span className="h-0.5 w-3/5 self-end rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ───────────────────────────────── */}
      {open && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          className="fixed inset-0 z-[60] flex flex-col bg-white px-5 pt-3 pb-8 motion-safe:animate-[dac-fade_.3s_ease-out] lg:hidden"
        >
          <div className="flex h-[72px] items-center justify-between px-2">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              autoFocus
              className="grid size-11 place-items-center rounded-full bg-dac-mist text-dac-ink"
            >
              <RiCloseLine className="size-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-8 flex-1 px-2">
            <ul className="space-y-1">
              {NAV_LINKS.map((link, i) => (
                <li
                  key={link.href}
                  className="motion-safe:animate-[dac-pop_.5s_ease-out_backwards]"
                  style={{ animationDelay: `${80 + i * 50}ms` }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-black/5 py-4 text-[1.9rem] leading-none font-semibold tracking-[-0.02em] text-dac-ink"
                  >
                    <span className="text-xs font-semibold text-dac-ink/35 tabular-nums">0{i + 1}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 px-2 motion-safe:animate-[dac-pop_.5s_ease-out_.4s_backwards]">
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-full bg-dac-blue px-6 py-4 font-semibold text-white"
            >
              Book a service
              <RiArrowRightLine className="size-5" aria-hidden />
            </a>
            <a
              href={BUSINESS.phone.href}
              className="flex items-center justify-between rounded-full bg-dac-mist px-6 py-4 font-semibold text-dac-ink"
            >
              {BUSINESS.phone.display}
              <RiPhoneFill className="size-5 text-dac-blue" aria-hidden />
            </a>
          </div>
        </div>
      )}
    </>
  )
}
