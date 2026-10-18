'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { RiCloseLine, RiPlayFill } from '@remixicon/react'
import { GALLERY_PHOTOS, GALLERY_VIDEOS } from './landing.data'

type Item = { kind: 'photo' | 'video'; src: string; alt: string }

const ITEMS: Item[] = [
  ...GALLERY_PHOTOS.slice(0, 2).map(p => ({ kind: 'photo' as const, ...p })),
  { kind: 'video', ...GALLERY_VIDEOS[0] },
  ...GALLERY_PHOTOS.slice(2).map(p => ({ kind: 'photo' as const, ...p })),
  { kind: 'video', ...GALLERY_VIDEOS[1] },
]

const CARD = 'relative h-[380px] w-[270px] shrink-0 overflow-hidden rounded-[14px] bg-white/5 lg:h-[480px] lg:w-[340px]'

export function WorkSection() {
  const [open, setOpen] = useState<Item | null>(null)

  return (
    <section
      id="work"
      className="scroll-mt-20 overflow-hidden bg-dac-ink py-24 text-white"
      aria-labelledby="dac-work"
    >
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="dac-work" data-split className="text-[2rem] leading-tight font-semibold sm:text-[2.5rem]">
            Our Work
          </h2>
          <p data-reveal className="max-w-sm text-white/70">
            Real jobs from our team — homes, condos, offices and commercial chillers. Tap any to view.
          </p>
        </div>
      </div>

      {/*
        Self-running reel: the list is rendered twice and translated -50% on a loop.
        Pauses on hover / keyboard focus. With reduced motion it becomes a plain
        horizontally scrollable row (the duplicate set is hidden).
      */}
      <div
        data-reveal
        className="group/reel mt-12 motion-reduce:overflow-x-auto motion-reduce:px-5 [scrollbar-width:none]"
      >
        <ul className="flex w-max gap-5 motion-safe:animate-[dac-marquee_70s_linear_infinite] group-hover/reel:[animation-play-state:paused] group-focus-within/reel:[animation-play-state:paused]">
          {[...ITEMS, ...ITEMS].map((item, i) => {
            const duplicate = i >= ITEMS.length
            const n = (i % ITEMS.length) + 1
            return (
              <li key={i} aria-hidden={duplicate} className={duplicate ? 'motion-reduce:hidden' : ''}>
                <button
                  type="button"
                  tabIndex={duplicate ? -1 : 0}
                  onClick={() => setOpen(item)}
                  aria-label={`View: ${item.alt}`}
                  className={`group ${CARD} block text-left`}
                >
                  {item.kind === 'photo' ? (
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      sizes="340px"
                      // Anchored top and enlarged slightly to crop phone-camera timestamps
                      className="origin-top scale-[1.1] object-cover object-top transition-transform duration-700 group-hover:scale-[1.15]"
                    />
                  ) : (
                    <ReelVideo src={item.src} />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-5 pt-16">
                    <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-dac-amber">
                      {String(n).padStart(2, '0')}
                      {item.kind === 'video' && <RiPlayFill className="size-3.5" aria-hidden />}
                    </span>
                    <span className="mt-1 block font-semibold">{item.alt}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {open && <Lightbox item={open} onClose={() => setOpen(null)} />}
    </section>
  )
}

/** Silent looping preview; only plays while on screen to save battery. */
function ReelVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      className="absolute inset-0 size-full object-cover"
    />
  )
}

function Lightbox({ item, onClose }: { item: Item; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const html = document.documentElement
    html.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      html.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      data-lenis-prevent
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm motion-safe:animate-[dac-fade_.25s_ease-out]"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <RiCloseLine className="size-6" aria-hidden />
        <span className="sr-only">Close</span>
      </button>
      <figure onClick={e => e.stopPropagation()} className="flex max-h-full flex-col items-center motion-safe:animate-[dac-pop_.35s_ease-out]">
        {item.kind === 'photo' ? (
          <Image
            src={item.src}
            alt={item.alt}
            width={960}
            height={1280}
            sizes="90vw"
            className="h-auto max-h-[82vh] w-auto rounded-[10px] object-contain"
          />
        ) : (
          <video
            src={item.src}
            controls
            autoPlay
            playsInline
            className="max-h-[82vh] w-auto rounded-[10px] bg-black"
          />
        )}
        <figcaption className="mt-3 text-center text-sm text-white/80">{item.alt}</figcaption>
      </figure>
    </div>
  )
}
