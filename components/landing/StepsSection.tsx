'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  RiCalendarCheckFill,
  RiCheckDoubleLine,
  RiCheckLine,
  RiSearchEyeFill,
  RiShieldCheckFill,
  RiToolsFill,
  type RemixiconComponentType,
} from '@remixicon/react'
import { gsap, motionEnabled, ScrollTrigger, useGSAP } from '@/components/motion/gsap'
import { STEPS } from './landing.data'
import { SectionTitle } from './SectionTitle'

const STEP_ICONS: RemixiconComponentType[] = [RiCalendarCheckFill, RiSearchEyeFill, RiToolsFill, RiShieldCheckFill]

/*
  Desktop (with motion): the section pins and scrolling deals the steps like a deck —
  each card rises in while the previous one sinks back into the stack, and a rail on
  the left tracks progress. Everywhere else the cards stack with position: sticky.

  Layout for both modes is decided in CSS (`lg:in-[.motion]:` = desktop + motion on
  <html>), so there's no layout jump when the JS boots.
*/
export function StepsSection() {
  const root = useRef<HTMLElement>(null)
  const [pinned, setPinned] = useState(false)
  const [active, setActive] = useState(-1)

  useGSAP(() => {
    // No motion: every card shows its finished state
    if (!motionEnabled()) { setActive(STEPS.length); return }
    const q = gsap.utils.selector(root)
    const cards = q('[data-step-card]')
    const n = cards.length
    const reach = (i: number) => setActive(a => Math.max(a, i))

    const mm = gsap.matchMedia()

    // Stacked (sticky) layout: each card plays its micro-animation as it arrives
    mm.add('(max-width: 1023.98px)', () => {
      cards.forEach((card, i) =>
        ScrollTrigger.create({ trigger: card, start: 'top 70%', onEnter: () => reach(i) }))
    })

    mm.add('(min-width: 1024px)', () => {
      setPinned(true)
      // First card animates as the section arrives, before the pin engages
      ScrollTrigger.create({ trigger: root.current, start: 'top 55%', onEnter: () => reach(0) })
      gsap.set(cards.slice(1), { yPercent: 175, rotation: 4 }) // fully below the fold until dealt

      const tl = gsap.timeline({
        defaults: { duration: 1 },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${(n - 1) * window.innerHeight * 0.85}`,
          pin: true,
          scrub: 0.9,
          invalidateOnRefresh: true,
          onUpdate: self => setActive(Math.round(self.progress * (n - 1))),
        },
      })

      for (let i = 1; i < n; i++) {
        tl.addLabel(`step${i}`, '+=0.35') // short hold so each card gets a moment to sit
          .to(cards[i - 1], { yPercent: -7, scale: 0.92, opacity: 0.55, ease: 'power2.inOut' }, `step${i}`)
          .fromTo(cards[i], { yPercent: 175, rotation: 4 }, { yPercent: 0, rotation: 0, ease: 'power3.out' }, `step${i}`)
        if (i >= 2) {
          tl.to(cards[i - 2], { yPercent: -13, scale: 0.84, opacity: 0, ease: 'power2.inOut' }, `step${i}`)
        }
      }
      tl.to({}, { duration: 0.35 })
      tl.fromTo(q('[data-rail-fill]'), { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: tl.duration() }, 0)

      return () => setPinned(false)
    })
  }, { scope: root })

  const isOn = (i: number) => i <= active

  return (
    <section
      ref={root}
      id="how"
      aria-labelledby="dac-steps"
      className="scroll-mt-20 overflow-x-clip py-24 lg:in-[.motion]:flex lg:in-[.motion]:min-h-svh lg:in-[.motion]:items-center lg:in-[.motion]:py-16"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-16">
        {/* ── Left: heading + progress rail ─────────────── */}
        <div>
          <SectionTitle id="dac-steps" align="left">How Booking Works</SectionTitle>
          <p data-reveal className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-dac-ink/75">
            Four steps from &ldquo;my aircon isn&apos;t cooling&rdquo; to a job done right.
          </p>

          {/* Decorative: the cards carry the same step titles */}
          <ol aria-hidden className="relative mt-10 hidden space-y-1 lg:block">
            <span className="absolute top-5 bottom-5 left-[19px] w-0.5 rounded-full bg-dac-ink/[0.07]">
              <span data-rail-fill className="absolute inset-0 origin-top rounded-full bg-dac-blue" />
            </span>
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex items-center gap-4 py-2.5">
                <span
                  className={`relative z-10 grid size-10 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-500 ${
                    isOn(i)
                      ? 'border-dac-blue bg-dac-blue text-white'
                      : 'border-dac-ink/10 bg-white text-dac-ink/40'
                  }`}
                >
                  {isOn(i) && i < active ? <RiCheckLine className="size-5" /> : i + 1}
                </span>
                <span
                  className={`text-[1.05rem] font-semibold transition-colors duration-500 ${
                    i === active || (!pinned && isOn(i)) ? 'text-dac-ink' : 'text-dac-ink/35'
                  }`}
                >
                  {s.title}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Right: card deck ───────────────────────────── */}
        <ol className="relative space-y-6 lg:in-[.motion]:h-[460px] lg:in-[.motion]:space-y-0">
          {STEPS.map(({ title, body }, i) => {
            const Icon = STEP_ICONS[i]
            return (
              <li
                key={title}
                data-step-card
                data-active={isOn(i)}
                style={{ zIndex: i + 1, '--stack': `${104 + i * 16}px` } as React.CSSProperties}
                className="group sticky top-(--stack) origin-top overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_30px_70px_-35px_rgb(15_40_80/0.35)] will-change-transform lg:in-[.motion]:absolute lg:in-[.motion]:inset-0"
              >
                <div className="grid h-full gap-6 p-7 sm:p-9 md:grid-cols-[1fr_1.05fr] md:items-center md:gap-8">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-dac-ice text-dac-blue">
                        <Icon className="size-6" aria-hidden />
                      </span>
                      <span className="text-[4.5rem] leading-none font-extrabold tracking-[-0.06em] text-dac-ink/[0.06] tabular-nums">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-[1.6rem] font-bold tracking-[-0.02em] text-dac-ink">{title}</h3>
                    <p className="mt-3 text-[1.02rem] leading-relaxed text-dac-ink/75">{body}</p>
                  </div>
                  <div aria-hidden className="h-full min-h-[220px] rounded-[16px] bg-dac-mist p-5">
                    <StepVisual index={i} />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

// ── Per-step mini visuals. Their parts animate in when the card turns active
//    (`group-data-[active=true]`), staggered with transition delays. ──────────

const IN = 'transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] opacity-0 translate-y-2 group-data-[active=true]:opacity-100 group-data-[active=true]:translate-y-0'
const delay = (ms: number) => ({ transitionDelay: `${ms}ms` })

function StepVisual({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <div className="flex h-full flex-col justify-center gap-3 text-[14px]">
          <div className={`max-w-[85%] self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 text-dac-ink shadow-sm ${IN}`} style={delay(150)}>
            Hi! Aircon not cooling. Pwede po bukas?
          </div>
          <div className={`max-w-[85%] self-end rounded-2xl rounded-br-md bg-dac-blue px-4 py-3 text-white shadow-sm ${IN}`} style={delay(650)}>
            Yes po! Tomorrow, 10:00 AM. See you!
          </div>
          <div className={`flex items-center gap-1.5 self-end text-[12px] font-semibold text-dac-blue ${IN}`} style={delay(1050)}>
            <RiCheckDoubleLine className="size-4" /> Schedule confirmed
          </div>
        </div>
      )
    case 1:
      return (
        <div className="flex h-full flex-col justify-center">
          <p className="text-[12px] font-semibold tracking-[0.14em] text-dac-ink/50 uppercase">Free check-up</p>
          <ul className="mt-3 space-y-2.5 text-[14px] text-dac-ink">
            {['Filters & coil', 'Refrigerant pressure', 'Electrical & PCB', 'Drain line'].map((item, k) => (
              <li key={item} className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
                <span
                  className="grid size-5 scale-50 place-items-center rounded-full bg-dac-blue text-white opacity-0 transition-all duration-400 ease-[cubic-bezier(.3,1.6,.5,1)] group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100"
                  style={delay(250 + k * 280)}
                >
                  <RiCheckLine className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className={`mt-3 text-[13px] font-semibold text-dac-blue ${IN}`} style={delay(1500)}>
            Estimate shared before any work →
          </p>
        </div>
      )
    case 2:
      return (
        <div className="relative h-full min-h-[220px] overflow-hidden rounded-xl">
          <Image
            src="/gallery/photo_5_2026-06-13_16-16-27.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 90vw"
            className="origin-top scale-[1.15] object-cover object-[center_20%]"
          />
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 p-3 backdrop-blur">
            <div className="flex items-center justify-between text-[13px] font-semibold text-dac-ink">
              Service in progress
              <span className="text-dac-blue">Testing…</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dac-ink/10">
              <div
                className="h-full w-full origin-left scale-x-0 rounded-full bg-dac-blue transition-transform duration-[1800ms] ease-[cubic-bezier(.4,0,.2,1)] group-data-[active=true]:scale-x-[0.86]"
                style={delay(300)}
              />
            </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <span className="relative grid size-20 place-items-center">
            <span
              className="absolute inset-0 scale-50 rounded-full bg-dac-blue/15 opacity-0 transition-all duration-700 group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100"
              style={delay(150)}
            />
            <span
              className="relative grid size-14 scale-75 place-items-center rounded-full bg-dac-blue text-white opacity-0 transition-all duration-500 ease-[cubic-bezier(.3,1.6,.5,1)] group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100"
              style={delay(350)}
            >
              <RiShieldCheckFill className="size-7" />
            </span>
          </span>
          <p className={`mt-4 text-[15px] font-bold text-dac-ink ${IN}`} style={delay(650)}>Covered after the job</p>
          <p className={`mt-1 max-w-[16rem] text-[13px] text-dac-ink/65 ${IN}`} style={delay(800)}>
            Same issue comes back? We return and fix it free.
          </p>
        </div>
      )
  }
}
