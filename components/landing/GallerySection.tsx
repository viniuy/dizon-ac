'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─────────────────────────────────────────────────────────────────────────────
// DATA — put all files inside  public/gallery/
// All 7 photos are portrait/square — masonry layout handles them naturally.
// Videos get their own full-width horizontal row.
// ─────────────────────────────────────────────────────────────────────────────
const PHOTOS: { src: string; alt: string }[] = [
  { src: '/gallery/photo_2_2026-06-13_16-16-26.jpg', alt: 'AC cleaning'    },
  { src: '/gallery/photo_4_2026-06-13_16-16-27.jpg', alt: 'AC service'   },
  { src: '/gallery/photo_5_2026-06-13_16-16-27.jpg', alt: 'Maintenance'   },
  { src: '/gallery/photo_6_2026-06-13_16-16-27.jpg', alt: 'Repair'        },
  { src: '/gallery/photo_7_2026-06-13_16-16-27.jpg', alt: 'Team at work'  },
]

const VIDEOS: { src: string; alt: string }[] = [
  { src: '/gallery/IMG_1634.MP4',  alt: 'AC Cleaning Video'      },
  { src: '/gallery/IMG_1636.MP4',  alt: 'AC Repair Video' },
]

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTBOX  (images + videos)
// ─────────────────────────────────────────────────────────────────────────────
type MediaItem = { src: string; alt: string; type: 'image' | 'video' }

function Lightbox({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(4, 10, 18, 0.95)', backdropFilter: 'blur(18px)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center
                   text-dac-muted hover:text-dac-text transition-colors z-10"
        style={{ background: 'var(--dac-card-dense)', border: '1px solid var(--dac-border)' }}
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Media */}
      <div
        className="relative max-w-[92vw] max-h-[88vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        style={{ borderRadius: 16, overflow: 'hidden' }}
      >
        {item.type === 'image' ? (
          <img
            src={item.src}
            alt={item.alt}
            style={{
              maxWidth: '92vw',
              maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: 16,
              display: 'block',
            }}
          />
        ) : (
          <video
            src={item.src}
            controls
            autoPlay
            playsInline
            style={{
              maxWidth: '92vw',
              maxHeight: '88vh',
              borderRadius: 16,
              background: '#000',
              display: 'block',
            }}
          />
        )}
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-dac-dim text-xs font-figtree whitespace-nowrap">
        {item.alt} · click anywhere to close
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO TILE  (used inside the horizontal video row)
// ─────────────────────────────────────────────────────────────────────────────
function VideoTile({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  return (
    <div
      className="relative w-full h-full group cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={`Play ${alt}`}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
    >
      <video
        src={src}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        style={{ pointerEvents: 'none' }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-70"
        style={{ background: 'rgba(4, 10, 18, 0.45)' }}
      />

      {/* Play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center
                     transition-transform duration-200 group-hover:scale-110"
          style={{
            background: 'rgba(56,189,248,0.15)',
            border: '2px solid rgba(56,189,248,0.7)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-dac-accent ml-1" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
        <span className="text-dac-text text-sm font-syne font-semibold tracking-[0.08em] uppercase
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {alt}
        </span>
      </div>

      {/* Video badge */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
        style={{ background: 'rgba(4,10,18,0.7)', border: '1px solid rgba(56,189,248,0.25)' }}
      >
        <svg viewBox="0 0 24 24" className="w-3 h-3 text-dac-accent" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        <span className="text-dac-accent text-[10px] font-syne font-bold uppercase tracking-[0.1em]">
          Video
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY SECTION
// ─────────────────────────────────────────────────────────────────────────────
export function GallerySection() {
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const sectionRef              = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gallery-card',
        { opacity: 0, y: 28, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5, ease: 'power2.out', stagger: 0.07,
          scrollTrigger: {
            trigger: '#gallery',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const openPhoto = useCallback((p: { src: string; alt: string }) =>
    setLightbox({ ...p, type: 'image' }), [])

  const openVideo = useCallback((v: { src: string; alt: string }) =>
    setLightbox({ ...v, type: 'video' }), [])

  const close = useCallback(() => setLightbox(null), [])

  return (
    <>
      <section
        id="gallery"
        ref={sectionRef}
        className="relative z-[1]"
        style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}
      >
        <div className="max-w-[1120px] mx-auto px-[clamp(1.25rem,5vw,3rem)] py-[clamp(5rem,10vh,8rem)]">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="mb-10">
            <p className="section-eyebrow">Our work</p>
            <h2 className="section-title">Jobs We've Done</h2>
            <p className="section-sub mt-2">Photos and videos from real service calls.</p>
          </div>

          {/* ── Photo Masonry ────────────────────────────────────────────
              CSS columns — browser stacks items top-to-bottom in each column,
              so portrait images are never cropped; they just show naturally tall.
          ────────────────────────────────────────────────────────────────── */}
          <div
            style={{
              columns: 'var(--masonry-cols, 3)',
              columnGap: '0.75rem',
            }}
            className="[--masonry-cols:2] sm:[--masonry-cols:3] lg:[--masonry-cols:4]"
          >
            {PHOTOS.map((photo) => (
              <div
                key={photo.src}
                className="gallery-card relative overflow-hidden cursor-pointer group mb-3"
                style={{
                  borderRadius: 12,
                  border: '1px solid var(--dac-border)',
                  background: 'var(--dac-card)',
                  breakInside: 'avoid',          // prevent column-break mid-image
                  display: 'block',
                }}
                onClick={() => openPhoto(photo)}
                role="button"
                aria-label={`View ${photo.alt}`}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openPhoto(photo) }}
              >
                {/* Next/Image with natural height via width:100% + height:auto */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',        // ← key: no forced crop
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  className="group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Caption hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100
                             transition-opacity duration-200 flex items-end p-3 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(4,10,18,0.8) 0%, transparent 55%)' }}
                >
                  <span className="text-dac-text text-xs font-syne font-semibold">{photo.alt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Video Row ───────────────────────────────────────────────────
              Two videos side-by-side, each 16/9. On mobile they stack.
          ────────────────────────────────────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {VIDEOS.map((video) => (
              <div
                key={video.src}
                className="gallery-card relative overflow-hidden"
                style={{
                  borderRadius: 14,
                  border: '1px solid var(--dac-border)',
                  background: 'var(--dac-card)',
                  aspectRatio: '16/9',
                }}
              >
                <VideoTile
                  src={video.src}
                  alt={video.alt}
                  onClick={() => openVideo(video)}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-dac-dim text-xs mt-8 font-figtree">
            Click any photo or video to view full size
          </p>
        </div>
      </section>

      {lightbox && <Lightbox item={lightbox} onClose={close} />}
    </>
  )
}