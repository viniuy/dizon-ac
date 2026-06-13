'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WHY_POINTS } from './landing.data'

const ICONS: Record<string, React.ReactNode> = {
  shield: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  peso: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="10" x2="14" y2="10"/><line x1="3" y1="14" x2="14" y2="14"/>
      <path d="M7 21V7a5 5 0 0 1 10 0v1a5 5 0 0 1-5 5H7"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
}

export function WhyChooseSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.why-left',
        { opacity: 0, x: -24 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '#why', start: 'top 78%', toggleActions: 'play none none none' },
        },
      )
      gsap.fromTo(
        '.why-point',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.12,
          scrollTrigger: { trigger: '#why', start: 'top 75%', toggleActions: 'play none none none' },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="why"
      ref={sectionRef}
      className="relative z-[1]"
      style={{
        borderTop: '1px solid rgba(56,189,248,0.08)',
        background: 'linear-gradient(180deg, var(--dac-surface) 0%, transparent 100%)',
      }}
    >
      <div
        className="max-w-[1120px] mx-auto px-[clamp(1.25rem,5vw,3rem)]
                   py-[clamp(5rem,10vh,8rem)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[clamp(3rem,6vw,6rem)] items-center">

          {/* ── Left: headline + CTA ─────────────────────── */}
          <div className="why-left">
            <p className="section-eyebrow">Why us</p>
            <h2
              className="font-syne font-extrabold tracking-[-0.035em] leading-[1.05] text-dac-text mb-5"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
            >
              We do the job right,{' '}
              <em className="not-italic text-dac-accent">not just done</em>
            </h2>
            <p
              className="text-dac-muted font-figtree leading-[1.75] mb-8"
              style={{ fontSize: '1rem', maxWidth: 400 }}
            >
              Dizon AC has been serving Bambang, Taguig and the wider Metro Manila
              area for over a decade. We stay accountable, keep our prices fair,
              and treat every home and business the way we'd treat our own.
            </p>

            {/* Quick highlights */}
            <div className="space-y-2 mb-8">
              {['Free check-up & estimate — always', 'Same-day service available', '100% satisfaction or we return free'].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-dac-muted text-sm font-figtree">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-dac-accent flex-shrink-0"
                       fill="none" stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>

            <a href="#contact" className="dac-btn-primary">
              Book a Service →
            </a>
          </div>

          {/* ── Right: 4 feature points ──────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_POINTS.map(({ icon, title, body }) => (
              <div
                key={title}
                className="why-point group rounded-[16px] p-6 transition-all duration-250 hover:-translate-y-0.5"
                style={{
                  background: 'var(--dac-card)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(56,189,248,0.1)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-dac-accent mb-4
                             transition-colors duration-250"
                  style={{ background: 'rgba(56,189,248,0.08)' }}
                >
                  {ICONS[icon]}
                </div>
                <h3 className="font-syne font-bold text-dac-text text-[0.9375rem] mb-1.5">{title}</h3>
                <p className="text-dac-muted text-sm font-figtree leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
