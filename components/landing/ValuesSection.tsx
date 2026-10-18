import {
  RiHandCoinFill,
  RiShieldCheckFill,
  RiThumbUpFill,
  RiUserStarFill,
  type RemixiconComponentType,
} from '@remixicon/react'
import { WHY_POINTS, type ValueIcon } from './landing.data'
import { SectionTitle } from './SectionTitle'

const VALUE_ICONS: Record<ValueIcon, RemixiconComponentType> = {
  shield: RiShieldCheckFill,
  star:   RiUserStarFill,
  peso:   RiHandCoinFill,
  heart:  RiThumbUpFill,
}

export function ValuesSection() {
  return (
    <section id="why" className="scroll-mt-20 bg-dac-mist py-24" aria-labelledby="dac-values">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle id="dac-values" tone="bright">We Stand Behind Our Work</SectionTitle>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_POINTS.map(({ icon, title, body }) => {
            const Icon = VALUE_ICONS[icon]
            return (
              <li
                key={title}
                data-reveal
                className="group rounded-[12px] bg-white p-7 text-center shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgb(31_111_209/0.4)]"
              >
                <span className="relative mx-auto grid size-20 place-items-center">
                  <span className="absolute inset-0 rounded-full bg-dac-ice transition-transform duration-500 group-hover:scale-110" />
                  <Icon className="relative size-10 text-dac-blue transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" aria-hidden />
                </span>
                <h3 className="mt-6 text-[1.2rem] font-bold text-dac-blue">{title}</h3>
                <p className="mt-3 leading-relaxed text-dac-ink/80">{body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
