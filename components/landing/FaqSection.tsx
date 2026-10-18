'use client'

import { useId, useState } from 'react'
import { RiAddLine } from '@remixicon/react'
import { FAQS } from './landing.data'
import { SectionTitle } from './SectionTitle'

export function FaqSection() {
  const uid = useId()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-20 bg-dac-mist py-24" aria-labelledby="dac-faq">
      <div className="mx-auto max-w-3xl px-5">
        <SectionTitle id="dac-faq">Frequently Asked Questions</SectionTitle>
        <div className="mt-12 space-y-3">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i
            return (
              <div
                key={q}
                data-reveal
                className={`rounded-[8px] border bg-white transition-[border-color,box-shadow] duration-300 ${
                  isOpen ? 'border-dac-blue/30 shadow-[0_16px_40px_-24px_rgb(31_111_209/0.5)]' : 'border-black/10'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={`${uid}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-dac-ink"
                  >
                    {q}
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                        isOpen ? 'rotate-45 bg-dac-blue text-white' : 'bg-dac-ice text-dac-blue'
                      }`}
                    >
                      <RiAddLine className="size-5" aria-hidden />
                    </span>
                  </button>
                </h3>
                {/* grid-rows 0fr → 1fr animates to the content's natural height */}
                <div
                  id={`${uid}-a${i}`}
                  role="region"
                  aria-labelledby={`${uid}-q${i}`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 leading-relaxed text-dac-ink/85">{a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
