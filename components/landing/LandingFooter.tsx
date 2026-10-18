import { RiMailFill, RiMapPin2Fill, RiPhoneFill, RiTimeFill } from '@remixicon/react'
import { BUSINESS, FOOTER_LINKS, PHONE_NUMBERS } from './landing.data'
import { Logo } from './Navbar'

export function LandingFooter() {
  return (
    <footer className="overflow-hidden bg-dac-blue pt-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/90">{BUSINESS.about}</p>
          <ul className="mt-6 space-y-2 text-[15px] text-white/90">
            <li className="flex gap-2">
              <RiPhoneFill className="mt-1 size-4 shrink-0" aria-hidden />
              <span>
                {PHONE_NUMBERS.map(({ number, href }, i) => (
                  <span key={number}>
                    {i > 0 && ' · '}
                    <a href={href} className="hover:underline">{number}</a>
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-2">
              <RiMailFill className="mt-1 size-4 shrink-0" aria-hidden />
              <a href={`mailto:${BUSINESS.email}`} className="break-all hover:underline">{BUSINESS.email}</a>
            </li>
            <li className="flex gap-2">
              <RiMapPin2Fill className="mt-1 size-4 shrink-0" aria-hidden />
              {BUSINESS.address}
            </li>
            <li className="flex gap-2">
              <RiTimeFill className="mt-1 size-4 shrink-0" aria-hidden />
              {BUSINESS.hours}
            </li>
          </ul>
        </div>

        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <h2 className="font-semibold">{section}</h2>
            <ul className="mt-4 space-y-3 text-[15px] text-white/90">
              {links.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="hover:underline">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/15 px-5 pt-6 text-sm text-white/90">
        <p>© {new Date().getFullYear()} {BUSINESS.name}</p>
      </div>

      {/* Oversized wordmark, cropped by the footer's bottom edge */}
      <div aria-hidden className="mt-10 overflow-hidden">
        <p
          data-split
          className="-mb-[0.22em] text-center text-[clamp(6rem,26vw,22rem)] leading-none font-extrabold tracking-[-0.06em] text-white/10 select-none"
        >
          dizon<span className="text-dac-amber/40">.</span>
        </p>
      </div>
    </footer>
  )
}
