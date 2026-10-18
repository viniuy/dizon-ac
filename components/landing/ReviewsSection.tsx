import { RiDoubleQuotesL, RiStarFill } from '@remixicon/react'
import { REVIEWS } from './landing.data'
import { SectionTitle } from './SectionTitle'

/** Renders nothing until real, verified reviews are added to REVIEWS in landing.data.ts */
export function ReviewsSection() {
  if (REVIEWS.length === 0) return null

  return (
    <section id="reviews" className="scroll-mt-20 py-24" aria-labelledby="dac-reviews">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle id="dac-reviews" align="left">Reviews</SectionTitle>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map(({ name, location, service, text, stars }) => (
            <figure
              key={name}
              data-reveal
              className="flex flex-col rounded-[12px] border border-black/10 bg-white p-6 shadow-[0_1px_3px_rgb(0_0_0/0.06)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-dac-amber" role="img" aria-label={`${stars} out of 5 stars`}>
                  {Array.from({ length: stars }, (_, i) => (
                    <RiStarFill key={i} className="size-4" aria-hidden />
                  ))}
                </div>
                <RiDoubleQuotesL className="size-8 text-dac-ice" aria-hidden />
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-dac-ink">“{text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-dac-ice font-bold text-dac-blue" aria-hidden>
                  {name[0]}
                </span>
                <span>
                  <span className="block font-bold text-black">{name}</span>
                  <span className="text-sm text-dac-ink/70">{location} · {service}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
