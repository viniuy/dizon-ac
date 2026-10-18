'use client'

import { useState } from 'react'
import {
  RiArrowRightLine,
  RiBuilding2Fill,
  RiCheckboxCircleFill,
  RiDropFill,
  RiHammerFill,
  RiSparkling2Fill,
  RiTimeFill,
  RiToolsFill,
  RiTruckFill,
  type RemixiconComponentType,
} from '@remixicon/react'
import { SERVICES, type ServiceIcon } from './landing.data'
import { SectionTitle } from './SectionTitle'

export const SERVICE_ICONS: Record<ServiceIcon, RemixiconComponentType> = {
  clean:    RiSparkling2Fill,
  repair:   RiToolsFill,
  install:  RiHammerFill,
  freon:    RiDropFill,
  relocate: RiTruckFill,
  vrf:      RiBuilding2Fill,
}

/** Booking form listens for this to pre-select the service */
export const SELECT_SERVICE_EVENT = 'dac:select-service'

/** Track the cursor so the tile's spotlight follows it */
function spotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export function ServicesSection() {
  const [selected, setSelected] = useState(0)
  const service = SERVICES[selected]
  const Icon = SERVICE_ICONS[service.icon]

  return (
    <section id="services" className="scroll-mt-20 py-24" aria-labelledby="dac-services">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle id="dac-services" tone="bright">On-site Services</SectionTitle>
        <p data-reveal className="mx-auto mt-4 max-w-lg text-center text-dac-ink/75">
          Pick a service to see what&apos;s included. Every job starts with a free check-up and estimate.
        </p>

        <ul
          role="tablist"
          aria-label="Services"
          className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {SERVICES.map(({ id, label, icon, duration }, i) => {
            const TileIcon = SERVICE_ICONS[icon]
            const isActive = i === selected
            return (
              <li key={id} data-reveal role="presentation">
                <button
                  type="button"
                  role="tab"
                  id={`svc-tab-${id}`}
                  aria-selected={isActive}
                  aria-controls="svc-panel"
                  onClick={() => setSelected(i)}
                  onPointerMove={spotlight}
                  className={`group relative flex h-full w-full flex-col items-center overflow-hidden rounded-[8px] px-3 pt-7 pb-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-16px_rgb(31_111_209/0.45)] ${
                    isActive ? 'bg-dac-blue text-white shadow-[0_18px_40px_-16px_rgb(31_111_209/0.7)]' : 'bg-dac-ice text-dac-ink'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`dac-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                      isActive ? 'mix-blend-soft-light' : ''
                    }`}
                  />
                  <TileIcon
                    className={`relative size-12 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-dac-blue'
                    }`}
                    aria-hidden
                  />
                  <span className="relative mt-5 text-[13px] font-semibold tracking-wide uppercase">{label}</span>
                  <span className={`relative mt-1 text-[13px] ${isActive ? 'text-white/80' : 'text-dac-ink/70'}`}>
                    {duration}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* ── Detail panel ─────────────────────────────── */}
        <div
          id="svc-panel"
          role="tabpanel"
          aria-labelledby={`svc-tab-${service.id}`}
          data-reveal
          className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_24px_60px_-28px_rgb(0_0_0/0.25)]"
        >
          <div key={service.id} className="grid gap-8 p-7 motion-safe:animate-[dac-pop_.45s_ease-out] sm:p-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-dac-ice text-dac-blue">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-[1.4rem] font-bold text-dac-ink">{service.label}</h3>
              </div>
              <p className="mt-4 text-[1.1rem] font-semibold text-dac-blue">{service.tagline}</p>
              <p className="mt-3 leading-relaxed text-dac-ink/80">{service.description}</p>
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-[10px] bg-dac-mist p-6">
              <ul className="space-y-3 text-[15px] text-dac-ink">
                <li className="flex items-center gap-2.5">
                  <RiTimeFill className="size-5 shrink-0 text-dac-blue" aria-hidden />
                  Typical job: <strong className="font-semibold">{service.duration}</strong>
                </li>
                <li className="flex items-start gap-2.5">
                  <RiCheckboxCircleFill className="mt-0.5 size-5 shrink-0 text-dac-blue" aria-hidden />
                  {service.note}
                </li>
                <li className="flex items-start gap-2.5">
                  <RiCheckboxCircleFill className="mt-0.5 size-5 shrink-0 text-dac-blue" aria-hidden />
                  Free check-up &amp; estimate
                </li>
              </ul>
              <a
                href="#book"
                data-magnetic
                onClick={() =>
                  window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: service.formOption }))
                }
                className="group inline-flex items-center justify-center gap-2 rounded-[5px] bg-dac-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-dac-ink"
              >
                Book this service
                <RiArrowRightLine className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
