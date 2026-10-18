import Image from 'next/image'
import { BRANDS, type Brand } from './landing.data'
import { SectionTitle } from './SectionTitle'

const HALF = Math.ceil(BRANDS.length / 2)
const ROWS = [BRANDS.slice(0, HALF), BRANDS.slice(HALF)]

/**
 * Optical sizing: wide wordmarks get less height, compact marks more, so every
 * logo carries roughly the same visual weight (height ∝ 1/√ratio).
 */
function logoSize({ ratio }: Brand) {
  const height = Math.round(Math.min(58, Math.max(24, 40 * Math.sqrt(3.4 / ratio))))
  return { height, width: Math.round(height * ratio) }
}

export function BrandsSection() {
  return (
    <section className="overflow-hidden py-24" aria-labelledby="dac-brands">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle id="dac-brands">All Brands Serviced</SectionTitle>
        <p data-reveal className="mt-3 text-center text-dac-ink">
          Inverter or non-inverter, home or commercial — we work on every major brand.
        </p>
      </div>

      {/* Two counter-scrolling rows, edges faded out. Static wrapped grid when motion is reduced. */}
      <div
        data-reveal
        className="group/marquee mt-14 space-y-10 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
      >
        {ROWS.map((row, r) => (
          // Each row renders its logos twice; translating -50% loops seamlessly
          <ul
            key={r}
            className={`flex w-max items-center motion-safe:animate-[dac-marquee_40s_linear_infinite] group-hover/marquee:[animation-play-state:paused] motion-reduce:mx-auto motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8 ${
              r === 1 ? 'motion-safe:[animation-direction:reverse]' : ''
            }`}
          >
            {[...row, ...row].map((brand, i) => {
              const { width, height } = logoSize(brand)
              const duplicate = i >= row.length
              return (
                <li
                  key={`${brand.name}-${i}`}
                  aria-hidden={duplicate}
                  className={`mx-8 flex shrink-0 items-center sm:mx-12 ${duplicate ? 'motion-reduce:hidden' : ''}`}
                >
                  {/* Greyscale at rest, the brand's own colours on hover */}
                  <Image
                    src={brand.logo}
                    alt={duplicate ? '' : brand.name}
                    width={width}
                    height={height}
                    unoptimized
                    style={{ width, height }}
                    className="opacity-50 grayscale transition-[filter,opacity] duration-500 hover:opacity-100 hover:grayscale-0"
                  />
                </li>
              )
            })}
          </ul>
        ))}
      </div>
    </section>
  )
}
