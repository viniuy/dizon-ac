'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REVIEWS } from './landing.data'

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5"
          fill={i < count ? '#f59e0b' : 'none'}
          stroke={i < count ? '#f59e0b' : '#4a6585'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.review-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '#reviews',
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative z-[1]"
      style={{
        borderTop: '1px solid rgba(56,189,248,0.08)',
        background: 'linear-gradient(180deg, transparent 0%, var(--dac-surface) 100%)',
      }}
    >
      <div
        className="max-w-[1120px] mx-auto px-[clamp(1.25rem,5vw,3rem)]
                   py-[clamp(5rem,10vh,8rem)]"
      >
        {/* Head */}
        <div className="text-center mb-12">
          <p className="section-eyebrow">What clients say</p>
          <h2 className="section-title mb-3">Customer Reviews</h2>
          <p className="section-sub">Feedback from real customers across Metro Manila.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map(({ stars, text, name, location, initials }) => (
            <div
              key={name}
              className="review-card rounded-[18px] p-7 flex flex-col gap-5
                         transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'var(--dac-card-dense)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(56,189,248,0.1)',
              }}
            >
              {/* Stars + quote mark */}
              <div className="flex items-start justify-between">
                <StarRow count={stars} />
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 flex-shrink-0"
                  fill="rgba(56,189,248,0.12)"
                  stroke="none"
                >
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                </svg>
              </div>

              {/* Review text */}
              <p className="text-dac-muted font-figtree leading-[1.78] text-[0.9375rem] flex-1">
                "{text}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}>
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center
                             font-syne font-bold text-xs text-dac-accent flex-shrink-0"
                  style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-dac-text text-sm font-syne font-semibold">{name}</p>
                  <p className="text-dac-dim text-xs font-figtree">{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google reviews prompt */}
        <div className="text-center mt-10">
          <p className="text-dac-dim text-sm font-figtree">
            Happy with our service?{' '}
            <a
              href="https://g.page/r/dizon-ac/review"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dac-accent hover:underline"
            >
              Leave us a Google review →
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
