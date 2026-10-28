'use client'

import { useRef } from 'react'
import Lenis from 'lenis'
import { gsap, INTRO_EVENT, motionEnabled, ScrollTrigger, SplitText, useGSAP } from './gsap'

declare global {
  interface Window {
    __dacMotionReady?: boolean
    __dacIntroDone?: boolean
  }
}

function finishIntro() {
  window.__dacIntroDone = true
  window.dispatchEvent(new Event(INTRO_EVENT))
}

/**
 * Wraps the page and owns the page-wide motion:
 *  - Lenis smooth scroll, synced to ScrollTrigger
 *  - the intro preloader (once per session)
 *  - generic `[data-reveal]` fade-ups and `[data-split]` masked line reveals
 *  - `[data-magnetic]` buttons on fine pointers
 *
 * Section components set up their own bespoke timelines. Their effects run before
 * this one (children first), so pins exist before the generic triggers are created.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  const preloaderRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!motionEnabled()) {
      finishIntro()
      return
    }
    window.__dacMotionReady = true
    const html = document.documentElement

    // ── Smooth scroll ──────────────────────────────────────────
    const lenis = new Lenis({ anchors: { offset: -84 }, autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // ── Intro preloader ────────────────────────────────────────
    const pre = preloaderRef.current
    if (html.classList.contains('intro') && pre) {
      lenis.stop()
      try { sessionStorage.setItem('dac-intro', '1') } catch {}
      gsap.timeline({
        onComplete: () => {
          html.classList.remove('intro')
          lenis.start()
        },
      })
        .from(pre.querySelectorAll('[data-pre-letter]'), {
          yPercent: 110, duration: 0.7, ease: 'expo.out', stagger: 0.05,
        })
        .from(pre.querySelector('[data-pre-line]'), {
          scaleX: 0, duration: 0.7, ease: 'power3.inOut',
        }, '<0.15')
        .to(pre.querySelector('[data-pre-inner]'), {
          yPercent: -40, opacity: 0, duration: 0.6, ease: 'power3.in',
        }, '+=0.25')
        .to(pre, {
          clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut',
        }, '<0.2')
        .add(finishIntro, '<0.35')
    } else {
      finishIntro()
    }

    // ── Masked line reveals for headings ───────────────────────
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach(el => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: 'visible' })
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        },
      })
    })

    // ── Fade-up reveals, batched so siblings stagger together ──
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: els =>
        gsap.fromTo(els,
          { opacity: 0, y: 48 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true },
        ),
    })

    // ── Magnetic buttons ───────────────────────────────────────
    const mm = gsap.matchMedia()
    mm.add('(pointer: fine)', () => {
      const cleanups = gsap.utils.toArray<HTMLElement>('[data-magnetic]').map(el => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          xTo((e.clientX - r.left - r.width / 2) * 0.3)
          yTo((e.clientY - r.top - r.height / 2) * 0.4)
        }
        const leave = () => { xTo(0); yTo(0) }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        return () => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
        }
      })
      return () => cleanups.forEach(fn => fn())
    })

    ScrollTrigger.sort()
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  })

  return (
    <>
      {/* Shown only when <html> has `motion intro` (first visit this session) */}
      <div
        ref={preloaderRef}
        aria-hidden
        className="dac-preloader fixed inset-0 z-[100] items-center justify-center bg-dac-blue"
      >
        <div data-pre-inner className="flex flex-col items-center">
          <div className="flex overflow-hidden font-[family-name:var(--font-archivo)] text-[clamp(3rem,11vw,6.5rem)] leading-none font-extrabold tracking-[-0.01em] text-white [font-stretch:125%]">
            {'DIZON'.split('').map((l, i) => (
              <span key={i} data-pre-letter className="inline-block">{l}</span>
            ))}
          </div>
          <span data-pre-line className="mt-5 block h-px w-40 origin-left bg-white/50" />
          <p className="mt-4 font-[family-name:var(--font-poppins)] text-[clamp(0.8rem,2.2vw,1.25rem)] font-semibold text-dac-ice uppercase">
            Aircon and Refrigeration
          </p>
        </div>
      </div>
      {children}
    </>
  )
}
