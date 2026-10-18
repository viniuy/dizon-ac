import { RiArrowRightLine, RiPhoneFill } from '@remixicon/react'
import { BUSINESS } from './landing.data'

// Cold-air streaks: [top %, duration s, delay s]
const AIRFLOW: [number, number, number][] = [
  [18, 7, 0], [32, 9, 1.5], [47, 6.5, 0.8], [61, 8.5, 2.6], [76, 7.5, 1.1], [88, 10, 3.2],
]

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-dac-blue py-24 text-white" aria-labelledby="dac-final">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 size-[36rem] rounded-full bg-dac-bright/50 blur-3xl motion-safe:animate-[dac-drift_18s_ease-in-out_infinite]" />
        <div className="absolute -bottom-48 -left-24 size-[30rem] rounded-full bg-[#0b4fa3]/60 blur-3xl motion-safe:animate-[dac-drift_22s_ease-in-out_infinite_reverse]" />
        {AIRFLOW.map(([top, dur, delay]) => (
          <span
            key={top}
            className="absolute -left-[10%] h-px w-[120%] bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 motion-safe:animate-[dac-airflow_linear_infinite]"
            style={{ top: `${top}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 px-5 md:flex-row md:items-center">
        <div>
          <h2 id="dac-final" data-split className="text-[2.25rem] leading-tight font-bold sm:text-[3rem]">
            Aircon not cooling?
          </h2>
          <p data-reveal className="mt-3 max-w-xl text-[1.1rem] text-white/85">
            Book now or call us — check-up and estimate are always free.
          </p>
        </div>
        <div data-reveal className="flex flex-wrap gap-3">
          <a
            href="#book"
            data-magnetic
            className="group inline-flex items-center gap-2 rounded-[5px] bg-dac-amber px-7 py-4 text-[1.1rem] font-semibold text-dac-ink shadow-[0_14px_30px_-10px_rgb(0_0_0/0.4)] transition-colors hover:bg-white"
          >
            Book a Service
            <RiArrowRightLine className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
          </a>
          <a
            href={BUSINESS.phone.href}
            data-magnetic
            className="inline-flex items-center gap-2 rounded-[5px] border border-white/60 px-7 py-4 text-[1.1rem] font-semibold text-white transition-colors hover:bg-white hover:text-dac-blue"
          >
            <RiPhoneFill className="size-5" aria-hidden /> Call us
          </a>
        </div>
      </div>
    </section>
  )
}
