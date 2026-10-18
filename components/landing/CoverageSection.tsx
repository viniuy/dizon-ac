import { RiMapPin2Fill, RiPhoneFill } from '@remixicon/react'
import { BUSINESS, COVERAGE } from './landing.data'
import { CoverageMap } from './CoverageMap'
import { SectionTitle } from './SectionTitle'

export function CoverageSection() {
  return (
    <section id="coverage" className="scroll-mt-20 py-24" aria-labelledby="dac-area">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionTitle id="dac-area" align="left">Where we service</SectionTitle>
          <p data-reveal className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-dac-ink/85">
            Based in {BUSINESS.address}, serving these areas across Metro Manila.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {COVERAGE.map(({ city, note }) => (
              <li
                key={city}
                data-reveal
                className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[15px] text-dac-ink"
              >
                <RiMapPin2Fill className="size-4 text-dac-blue" aria-hidden />
                {city}
                <span className="text-dac-ink/60">· {note}</span>
              </li>
            ))}
          </ul>

          {/* Outside-area note */}
          <div data-reveal className="mt-8 rounded-[14px] border border-dac-amber/40 bg-dac-amber/10 p-5">
            <p className="font-semibold text-dac-ink">Not in our coverage area?</p>
            <p className="mt-1 text-[15px] leading-relaxed text-dac-ink/80">
              Please inquire — call or send us a message and we&apos;ll let you know if we can schedule a visit
              to your area.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-semibold">
              <a href={BUSINESS.phone.href} className="inline-flex items-center gap-1.5 text-dac-blue hover:underline">
                <RiPhoneFill className="size-4" aria-hidden /> Call {BUSINESS.phone.display}
              </a>
              <a href="#book" className="text-dac-blue hover:underline">Send an inquiry →</a>
            </div>
          </div>
        </div>

        <div data-reveal>
          <CoverageMap />
        </div>
      </div>
    </section>
  )
}
