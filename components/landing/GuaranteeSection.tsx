'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { RiArrowRightLine, RiCheckboxCircleFill } from '@remixicon/react'
import { gsap, motionEnabled, useGSAP } from '@/components/motion/gsap'
import { GUARANTEE } from './landing.data'

export function GuaranteeSection() {
  const root = useRef<HTMLElement>(null)

  // Card opens from an inset frame to full width as it scrolls in; photo drifts inside it
  useGSAP(() => {
    if (!motionEnabled()) return
    const q = gsap.utils.selector(root)
    gsap.fromTo(q('[data-g-card]'),
      { clipPath: 'inset(6% 8% 6% 8% round 40px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 18px)',
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'center 60%', scrub: 0.8 },
      })
    gsap.fromTo(q('[data-g-img]'), { yPercent: -10, scale: 1.15 }, {
      yPercent: 10,
      scale: 1.15,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, { scope: root })

  return (
    <section ref={root} className="bg-dac-mist py-12" aria-labelledby="dac-guarantee">
      <div className="mx-auto max-w-6xl px-5">
        <div
          data-g-card
          className="grid overflow-hidden rounded-[18px] bg-dac-blue shadow-[0_30px_60px_-20px_rgb(31_111_209/0.55)] md:grid-cols-[2fr_3fr]"
        >
          <div className="relative h-80 overflow-hidden md:h-auto md:min-h-[420px]">
            <Image
              data-g-img
              src="/gallery/photo_3_2026-06-13_16-16-26.jpg"
              alt="Dizon technician working on an inverter outdoor unit"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="relative px-8 py-12 md:px-12 md:py-16">
            <span aria-hidden className="absolute -right-20 -bottom-24 size-72 rounded-full bg-dac-bright/40 blur-3xl" />
            <h2 id="dac-guarantee" data-split className="relative text-[1.75rem] font-bold text-white sm:text-[2rem]">
              Our Guarantee
            </h2>
            <ul className="relative mt-7 space-y-4">
              {GUARANTEE.map(item => (
                <li key={item} data-reveal className="flex gap-3 text-[1.05rem] text-white">
                  <RiCheckboxCircleFill className="mt-0.5 size-6 shrink-0 text-dac-amber" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#book"
              data-magnetic
              className="group relative mt-9 inline-flex items-center gap-2 rounded-[3px] bg-dac-amber px-6 py-3.5 font-semibold tracking-wide text-dac-ink uppercase shadow-[0_10px_24px_-8px_rgb(0_0_0/0.35)] transition-colors hover:bg-[#f5a21f]"
            >
              Get a free estimate
              <RiArrowRightLine className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
