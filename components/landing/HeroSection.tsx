'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { RiArrowRightLine } from '@remixicon/react'
import { gsap, INTRO_EVENT, motionEnabled, useGSAP } from '@/components/motion/gsap'
import { BUSINESS, HERO, HERO_SLIDES } from './landing.data'

const ROTATE_MS = 5500

export function HeroSection() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [introDone, setIntroDone] = useState(false)

  // Quiet crossfade between job photos, starting once the entrance has finished.
  // Skipped entirely for reduced motion.
  useEffect(() => {
    if (!introDone || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setActive(i => (i + 1) % HERO_SLIDES.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [introDone])

  /*
    One-time entrance:
      1. "Aircon care," fades in, centred in the hero
      2. "done properly." fades in beneath it
      3. both lines glide left into place while the photo unveils
      4. supporting copy, caption and facts settle in
  */
  useGSAP(() => {
    if (!motionEnabled()) return
    const q = gsap.utils.selector(root)
    const lines = q('[data-hero-line]')
    let cancelled = false

    // Hide everything up front; positions are measured once the webfont has laid out
    gsap.set(q('[data-hero-intro]'), { opacity: 1 })
    gsap.set(lines, { opacity: 0 })
    gsap.set(q('[data-hero-fade]'), { opacity: 0, y: 16 })
    gsap.set(q('[data-hero-frame]'), { clipPath: 'inset(100% 0% 0% 0%)' })

    document.fonts.ready.then(() => {
      if (cancelled) return
      // Offset each line so it starts centred in the hero, stacked around the headline's centre
      const grid = q('[data-hero-grid]')[0].getBoundingClientRect()
      const h1 = q('h1')[0].getBoundingClientRect()
      // Centre within the part of the hero that's on screen (the stacked mobile layout runs past the fold)
      const cx = grid.left + grid.width / 2
      const cy = (grid.top + Math.min(grid.bottom, window.innerHeight)) / 2
      const dy = cy - (h1.top + h1.height / 2)
      lines.forEach(line => {
        const r = line.getBoundingClientRect()
        gsap.set(line, { x: cx - (r.left + r.width / 2), y: dy })
      })

      const tl = gsap.timeline({ paused: true, onComplete: () => setIntroDone(true) })
        .fromTo(lines[0], { opacity: 0, filter: 'blur(10px)' },
          { opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }, 0)
        .fromTo(lines[1], { opacity: 0, filter: 'blur(10px)' },
          { opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }, 0.6)
        .to(lines, { x: 0, y: 0, duration: 1.4, ease: 'expo.inOut', clearProps: 'transform,filter' }, 1.9)
        .to(q('[data-hero-frame]'),
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 2.05)
        .fromTo(q('[data-hero-zoom]'), { scale: 1.15 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 2.3)
        .to(q('[data-hero-fade]'), { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07 }, 2.9)
        // The nav lives outside this section, so it's selected from the document
        .fromTo('[data-hero-nav]', { autoAlpha: 0, y: -20 },
          { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', clearProps: 'transform' }, 2.9)

      if (window.__dacIntroDone) tl.play()
      else window.addEventListener(INTRO_EVENT, () => tl.play(), { once: true })
    })

    return () => { cancelled = true }
  }, { scope: root })

  return (
    <section
      ref={root}
      id="top"
      className="relative bg-linear-to-b from-[#eef1f4] to-[#f7f8fa] pt-[104px] md:pt-[120px]"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div data-hero-grid className="grid items-end gap-12 pb-14 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:pb-20">
          {/* ── Copy ─────────────────────────────────────── */}
          <div data-hero-intro className="md:pb-6">
            <p data-hero-fade className="text-[13px] font-semibold tracking-[0.18em] text-dac-blue uppercase">
              Dizon Aircon &amp; Refrigeration
            </p>
            <h1 className="mt-5 text-[clamp(2.75rem,6.4vw,5.25rem)] leading-[1.02] font-bold tracking-[-0.04em] text-dac-ink">
              {HERO.headline.map((line, i) => (
                // inline-block so each line's own width can be measured for the centred start
                <span key={line} className="block">
                  <span data-hero-line className={`inline-block will-change-transform ${i === 1 ? 'text-dac-blue' : ''}`}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p data-hero-fade className="mt-7 max-w-md text-[1.075rem] leading-relaxed text-dac-ink/75">
              {HERO.sub}
            </p>
            <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href="#book"
                className="group inline-flex items-center gap-2 rounded-full bg-dac-ink px-7 py-3.5 text-[15px] font-semibold text-white transition-colors duration-300 hover:bg-dac-blue"
              >
                Book a service
                <RiArrowRightLine className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </a>
              <a href={BUSINESS.phone.href} className="group text-[15px] text-dac-ink/70">
                or call{' '}
                <span className="font-semibold text-dac-ink underline decoration-dac-ink/20 underline-offset-4 transition-colors group-hover:decoration-dac-blue">
                  {BUSINESS.phone.display}
                </span>
              </a>
            </div>
          </div>

          {/* ── Photo ────────────────────────────────────── */}
          <figure data-hero-intro>
            <div data-hero-frame className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-dac-mist">
              <div data-hero-zoom className="absolute inset-0">
                {HERO_SLIDES.map((s, i) => (
                  <Image
                    key={s.image}
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    aria-hidden={i !== active}
                    // Anchored top and slightly enlarged to crop the phone-camera timestamp at the bottom
                    className={`origin-top scale-[1.12] object-cover object-top transition-opacity duration-[1400ms] ease-out ${
                      i === active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>
            </div>
            <figcaption data-hero-fade className="mt-3 flex items-baseline justify-between gap-4 text-[13px] text-dac-ink/55">
              <span key={active} className="motion-safe:animate-[dac-pop_.6s_ease-out]">
                {HERO_SLIDES[active].caption}
              </span>
              <span className="tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
              </span>
            </figcaption>
          </figure>
        </div>

        {/* ── Facts ──────────────────────────────────────── */}
        <ul data-hero-intro className="grid border-t border-dac-ink/10 sm:grid-cols-3">
          {HERO.facts.map((fact, i) => (
            <li
              key={fact}
              data-hero-fade
              className={`flex items-center gap-3 py-5 text-[15px] text-dac-ink/80 ${
                i > 0 ? 'border-t border-dac-ink/10 sm:border-t-0 sm:border-l sm:pl-6' : ''
              }`}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-dac-amber" aria-hidden />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
