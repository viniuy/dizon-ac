'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SERVICES, type Service } from './landing.data'

/* ── Service icons ──────────────────────────────────────────────────────── */
const ICONS: Record<string, React.ReactNode> = {
  wrench: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.636 5.636l2.122 2.122m8.484 8.484 2.122 2.122M5.636 18.364l2.122-2.122m8.484-8.484 2.122-2.122"/>
    </svg>
  ),
  tool: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
  arrows: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l4-4-4-4M9 5H3M19 15l-4 4 4 4M15 19h6"/>
      <path d="M3 19h10a4 4 0 0 0 4-4v-1M21 5H11a4 4 0 0 0-4 4v1"/>
    </svg>
  ),
  droplet: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
}

/* ── Detail right panel ─────────────────────────────────────────────────── */
function ServiceDetail({ service }: { service: Service }) {
  return (
    <div className="flex flex-col h-full">
      {/* Icon + label */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-dac-accent flex-shrink-0"
          style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
        >
          {ICONS[service.icon]}
        </div>
        <div>
          <div className="font-syne font-bold text-dac-text" style={{ fontSize: '0.9rem' }}>
            {service.label}
          </div>
          <div className="text-dac-accent text-xs font-semibold">{service.tagline}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-dac-muted font-figtree leading-[1.78] mb-7 flex-1"
         style={{ fontSize: '0.9375rem' }}>
        {service.description}
      </p>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mb-7">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold font-syne px-3 py-1.5 rounded-full text-dac-accent"
          style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.18)' }}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {service.duration}
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold font-syne px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {service.note}
        </span>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <a href="#contact" className="dac-btn-primary" style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}>
          Book {service.label} →
        </a>
        <a href="tel:+639177800051" className="dac-btn-outline" style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}>
          Call Now
        </a>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export function ServicesSection() {
  const [active,    setActive]    = useState(0)
  const sectionRef                = useRef<HTMLElement>(null)
  const detailRef                 = useRef<HTMLDivElement>(null)
  const isAnimating               = useRef(false)

  const handleSelect = useCallback((idx: number) => {
    if (idx === active || isAnimating.current) return
    const el = detailRef.current
    if (!el) { setActive(idx); return }

    isAnimating.current = true
    gsap.to(el, {
      opacity: 0,
      y: 10,
      duration: 0.18,
      ease: 'power1.in',
      onComplete: () => {
        setActive(idx)
        gsap.fromTo(
          el,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            ease: 'power2.out',
            onComplete: () => { isAnimating.current = false },
          },
        )
      },
    })
  }, [active])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.svc-list-item',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.07,
          scrollTrigger: { trigger: '#services', start: 'top 75%', toggleActions: 'play none none none' },
        },
      )
      gsap.fromTo(
        '.svc-detail-panel',
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#services', start: 'top 75%', toggleActions: 'play none none none' },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const service = SERVICES[active]

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-[1]"
      style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}
    >
      <div
        className="max-w-[1120px] mx-auto px-[clamp(1.25rem,5vw,3rem)] py-[clamp(5rem,10vh,8rem)]"
      >
        {/* Head */}
        <div className="mb-[clamp(2.5rem,5vh,4rem)]">
          <p className="section-eyebrow">What we do</p>
          <h2 className="section-title mb-3">Our Services</h2>
          <p className="section-sub" style={{ maxWidth: 480 }}>
            Select a service to see what's involved. Every job comes with a free
            assessment and no-surprise pricing.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

          {/* ── Left: service list ───────────────────────── */}
          <div
            className="rounded-[18px] overflow-hidden"
            style={{ border: '1px solid rgba(56,189,248,0.12)' }}
          >
            {SERVICES.map((svc, idx) => {
              const isActive = idx === active
              return (
                <button
                  key={svc.id}
                  onClick={() => handleSelect(idx)}
                  className="svc-list-item w-full text-left flex items-center gap-3.5 px-5 py-4
                             transition-all duration-200 relative"
                  style={{
                    background: isActive
                      ? 'rgba(56,189,248,0.08)'
                      : 'var(--dac-card)',
                    borderBottom: idx < SERVICES.length - 1
                      ? '1px solid rgba(56,189,248,0.08)'
                      : 'none',
                  }}
                  aria-pressed={isActive}
                >
                  {/* Active left bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-all duration-300"
                    style={{
                      background: isActive ? '#38bdf8' : 'transparent',
                      boxShadow: isActive ? '0 0 8px rgba(56,189,248,0.5)' : 'none',
                    }}
                  />
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                    style={{
                      background: isActive ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.06)',
                      color: isActive ? '#38bdf8' : '#4a6585',
                    }}
                  >
                    <div className="w-4 h-4">{ICONS[svc.icon]}</div>
                  </div>
                  {/* Label */}
                  <div>
                    <div
                      className="font-syne font-semibold text-sm transition-colors duration-200"
                      style={{ color: isActive ? '#f0f9ff' : '#94a3b8' }}
                    >
                      {svc.label}
                    </div>
                    <div className="text-dac-dim text-xs mt-0.5 font-figtree">
                      {svc.duration}
                    </div>
                  </div>
                  {/* Arrow indicator */}
                  {isActive && (
                    <div className="ml-auto text-dac-accent">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
                           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Right: detail pane ───────────────────────── */}
          <div
            className="svc-detail-panel rounded-[18px] p-[clamp(1.75rem,4vw,2.5rem)]"
            style={{
              background: 'var(--dac-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(56,189,248,0.12)',
              minHeight: 360,
            }}
          >
            <div ref={detailRef}>
              <ServiceDetail service={service} />
            </div>
          </div>

        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="text-dac-dim text-sm font-figtree">
            Not sure which service you need?{' '}
            <a href="tel:+639177800051" className="text-dac-accent hover:underline">
              Call us free
            </a>{' '}
            and we'll advise you — no obligation.
          </p>
        </div>
      </div>
    </section>
  )
}
