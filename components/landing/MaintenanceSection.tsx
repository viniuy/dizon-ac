import { RiArrowRightLine, RiCheckboxCircleFill, RiSnowflakeFill } from '@remixicon/react'
import { PMS_POINTS, SERVICES } from './landing.data'
import { SectionTitle } from './SectionTitle'

const PMS = SERVICES.find(s => s.id === 'cleaning')!

/** Teko's "Annual Aircon Maintenance Plan" block, adapted to Dizon's PMS service */
export function MaintenanceSection() {
  return (
    <section id="pms" className="scroll-mt-20 bg-dac-mist py-24" aria-labelledby="dac-pms">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle id="dac-pms">Regular Aircon Maintenance (PMS)</SectionTitle>
        <div className="mx-auto mt-14 grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div>
            <h3 data-reveal className="text-[1.25rem] font-bold text-black">Ideal for homes and businesses</h3>
            <ul className="mt-6 space-y-4">
              {PMS_POINTS.map(point => (
                <li key={point} data-reveal className="flex gap-3 text-[1.02rem] text-dac-ink">
                  <RiCheckboxCircleFill className="mt-0.5 size-6 shrink-0 text-dac-blue" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div
            data-reveal
            className="relative overflow-hidden rounded-[16px] bg-dac-ice px-8 py-12 text-center shadow-[0_30px_60px_-30px_rgb(31_111_209/0.45)]"
          >
            {/* Frost rings */}
            <span aria-hidden className="absolute -top-24 -right-24 size-64 rounded-full border border-white/70" />
            <span aria-hidden className="absolute -top-12 -right-12 size-40 rounded-full border border-white/70" />
            <span aria-hidden className="absolute -bottom-20 -left-16 size-56 rounded-full bg-white/40 blur-2xl" />

            <span className="relative mx-auto grid size-20 place-items-center rounded-full bg-white shadow-[0_10px_30px_-10px_rgb(31_111_209/0.5)]">
              <RiSnowflakeFill className="size-10 text-dac-blue motion-safe:animate-[spin_16s_linear_infinite]" aria-hidden />
            </span>
            <p className="relative mx-auto mt-6 max-w-xs text-[1.1rem] text-dac-ink">
              Extend the life of your aircon and keep it running cold all year.
            </p>
            <p className="relative mt-3 text-sm text-dac-ink/70">
              {PMS.duration} per unit · {PMS.note}
            </p>
            <a
              href="#book"
              data-magnetic
              className="group relative mt-8 inline-flex items-center gap-2 rounded-[3px] bg-dac-amber px-7 py-3.5 font-semibold tracking-wide text-dac-ink uppercase shadow-[0_10px_24px_-8px_rgb(254_177_59/0.8)] transition-colors hover:bg-[#f5a21f]"
            >
              Get a free quote
              <RiArrowRightLine className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
