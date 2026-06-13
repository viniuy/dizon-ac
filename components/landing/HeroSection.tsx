'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { HERO_STATS, PHONE_NUMBERS } from './landing.data'

const AIR_LINES = [
  { t: '18%', d: '9s',   dl: '0s'   },
  { t: '33%', d: '11s',  dl: '1.8s' },
  { t: '49%', d: '8.5s', dl: '3.2s' },
  { t: '63%', d: '12s',  dl: '0.6s' },
  { t: '77%', d: '10s',  dl: '2.5s' },
  { t: '89%', d: '9s',   dl: '4.1s' },
] as const

const NETWORK_COLORS: Record<string, string> = {
  Globe: '#38bdf8',
  Smart: '#22c55e',
  PLDT:  '#a78bfa',
}

export function HeroSection() {
  const heroRef    = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    const els = contentRef.current.querySelectorAll('[data-reveal]')
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.15,
      },
    )
  }, [])

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-svh flex items-center overflow-hidden"
      style={{ paddingTop: 64 }}
    >
      {/* ── Ambient air-flow lines ───────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {AIR_LINES.map(({ t, d, dl }, i) => (
          <div
            key={i}
            className="air-line"
            style={{ '--flow-t': t, '--flow-d': d, '--flow-dl': dl } as React.CSSProperties}
          />
        ))}

        {/* Corner ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 600,
            top: '-8%',
            right: '-4%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 400,
            height: 400,
            bottom: '5%',
            left: '2%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="relative z-[2] max-w-[1120px] mx-auto w-full
                   px-[clamp(1.25rem,5vw,3rem)] py-[clamp(4rem,8vh,6rem)]"
      >
        {/* Eyebrow */}
        <div
          data-reveal
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6"
          style={{
            background: 'rgba(56,189,248,0.07)',
            border: '1px solid rgba(56,189,248,0.2)',
          }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full bg-dac-accent"
            style={{ boxShadow: '0 0 6px #38bdf8' }}
          />
          <span className="text-dac-accent text-xs font-semibold tracking-[0.1em] uppercase font-syne">
            Bambang, Taguig · Serving Metro Manila
          </span>
        </div>

        {/* Headline */}
        <h1
          data-reveal
          className="font-syne font-extrabold tracking-[-0.04em] leading-[1.05] text-dac-text mb-5"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', maxWidth: 760 }}
        >
          Your AC Problems,{' '}
          <em className="not-italic text-dac-accent">Solved Fast</em>
          <br className="hidden sm:block" /> by People You Can Trust
        </h1>

        {/* Sub */}
        <p
          data-reveal
          className="text-dac-muted leading-[1.8] mb-8 font-figtree"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', maxWidth: 520 }}
        >
          Installation, Cleaning, Repair, Freon Charging &amp; VRF/VRV service for
          homes and businesses. Free check-up and estimate — always.
        </p>

        {/* CTAs */}
        <div data-reveal className="flex flex-wrap gap-3 mb-10">
          <a href="#contact" className="dac-btn-primary">
            Get Free Quote →
          </a>
          <a href="#services" className="dac-btn-outline">
            See Services
          </a>
        </div>

        {/* Phone numbers */}
        <div data-reveal className="mb-12">
          <p className="text-dac-dim text-xs font-semibold uppercase tracking-[0.14em] mb-3 font-syne">
            Call or Text Anytime
          </p>
          <div className="flex flex-wrap gap-2">
            {PHONE_NUMBERS.map(({ network, number, href }) => (
              <a
                key={number}
                href={href}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 font-figtree
                           text-sm font-medium text-dac-text transition-all duration-200
                           hover:-translate-y-0.5"
                style={{
                  background: 'var(--dac-chip)',
                  border: `1px solid rgba(${network === 'Globe' ? '56,189,248' : network === 'Smart' ? '34,197,94' : '167,139,250'},0.2)`,
                }}
              >
                <span
                  className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                  style={{ background: NETWORK_COLORS[network] ?? '#38bdf8' }}
                />
                <span className="text-dac-dim text-xs">{network}</span>
                <span>{number}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div
          data-reveal
          className="flex flex-wrap gap-[clamp(1.5rem,4vw,3rem)] pt-8"
          style={{ borderTop: '1px solid rgba(56,189,248,0.12)' }}
        >
          {HERO_STATS.map(({ value, label }) => (
            <div key={label}>
              <div
                className="font-syne font-extrabold text-dac-accent tracking-[-0.03em]"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                {value}
              </div>
              <div className="text-dac-dim text-xs mt-0.5 font-figtree">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
