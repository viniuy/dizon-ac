'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function BeforeAfterSection() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(50)
  const dragging = useRef(false)

  const clamp     = (v: number) => Math.max(2, Math.min(98, v))
  const setFromX  = useCallback((clientX: number) => {
    if (!wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    setPct(clamp(((clientX - rect.left) / rect.width) * 100))
  }, [])

  useEffect(() => {
    const onMove  = (e: MouseEvent)  => { if (dragging.current) setFromX(e.clientX) }
    const onUp    = ()               => { dragging.current = false }
    const onTouch = (e: TouchEvent)  => { if (dragging.current) setFromX(e.touches[0].clientX) }
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mouseup',    onUp)
    window.addEventListener('touchmove',  onTouch, { passive: true })
    window.addEventListener('touchend',   onUp)
    return () => {
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('touchmove',  onTouch)
      window.removeEventListener('touchend',   onUp)
    }
  }, [setFromX])

  return (
    <section
      id="before-after"
      className="relative z-[1]"
      style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}
    >
      <div className="max-w-[1120px] mx-auto px-[clamp(1.25rem,5vw,3rem)] py-[clamp(5rem,10vh,8rem)]">

        {/* Head */}
        <div className="text-center mb-4">
          <p className="section-eyebrow">See the difference</p>
          <h2 className="section-title">Before &amp; After Cleaning</h2>
        </div>
        <p className="text-center text-dac-dim text-sm mb-10 font-figtree">
          Drag the handle to compare
        </p>

        {/* Slider */}
        <div
          ref={wrapRef}
          className="relative max-w-[860px] mx-auto overflow-hidden cursor-col-resize select-none"
          style={{
            height: 'clamp(280px, 45vw, 440px)',
            borderRadius: 20,
            border: '1px solid rgba(56,189,248,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          }}
          onMouseDown={e => { dragging.current = true; setFromX(e.clientX) }}
          onTouchStart={e => { dragging.current = true; setFromX(e.touches[0].clientX) }}
        >
          {/* ── BEFORE panel ──────────────────────────────── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            style={{ background: 'linear-gradient(135deg,#1a0d00,#2e1800 45%,#180c00)' }}
          >
            <ACUnit dirty />
            <span
              className="font-syne font-bold text-xs tracking-[0.08em] px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(100,50,0,0.55)',
                color: '#e09050',
                border: '1px solid rgba(100,50,0,0.7)',
              }}
            >
              BEFORE — Dirty Unit
            </span>
          </div>

          {/* ── AFTER panel ───────────────────────────────── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            style={{
              background: 'linear-gradient(135deg,#060e1a,#0a2540 50%,#061828)',
              clipPath: `inset(0 ${(100 - pct).toFixed(1)}% 0 0)`,
            }}
          >
            <ACUnit dirty={false} />
            <span
              className="font-syne font-bold text-xs tracking-[0.08em] px-4 py-1.5 rounded-full text-dac-accent"
              style={{
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.25)',
              }}
            >
              AFTER — Professionally Cleaned
            </span>
          </div>

          {/* ── Divider + handle ──────────────────────────── */}
          <div
            className="absolute top-0 bottom-0 w-[2px] z-10"
            style={{
              left: `${pct}%`,
              transform: 'translateX(-50%)',
              background: '#38bdf8',
              boxShadow: '0 0 16px rgba(56,189,248,0.6), 0 0 40px rgba(56,189,248,0.25)',
            }}
          >
            {/* Handle circle */}
            <div
              className="absolute top-1/2 left-1/2 w-11 h-11 rounded-full
                         bg-dac-accent flex items-center justify-center"
              style={{
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 3px rgba(6,14,26,0.8), 0 0 20px rgba(56,189,248,0.5)',
                pointerEvents: 'none',
                color: '#060e1a',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor"
                   strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 9l-4 3 4 3M16 9l4 3-4 3"/>
              </svg>
            </div>
          </div>

          {/* Corner labels */}
          <div
            className="absolute bottom-3 left-3 text-xs font-syne font-semibold tracking-[0.08em]"
            style={{ color: '#e09050', opacity: Math.max(0, 1 - pct / 30) }}
          >
            BEFORE
          </div>
          <div
            className="absolute bottom-3 right-3 text-xs font-syne font-semibold tracking-[0.08em] text-dac-accent"
            style={{ opacity: Math.max(0, (pct - 70) / 30) }}
          >
            AFTER
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-dac-dim text-xs mt-5 font-figtree">
          Regular cleaning restores cooling efficiency and cuts electricity costs by up to 30%
        </p>

      </div>
    </section>
  )
}

/* ── AC unit illustration ────────────────────────────────────────────────── */
function ACUnit({ dirty }: { dirty: boolean }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 'clamp(200px, 30vw, 290px)',
        height: 'clamp(100px, 15vw, 140px)',
        borderRadius: 16,
        ...(dirty
          ? {
              background: 'linear-gradient(180deg, #2e1a00, #1a0e00)',
              border: '2px solid rgba(100,50,0,0.7)',
            }
          : {
              background: 'linear-gradient(180deg, #0a2540, #061828)',
              border: '2px solid rgba(56,189,248,0.35)',
              boxShadow: '0 0 30px rgba(56,189,248,0.1)',
            }),
      }}
    >
      {/* Clean AC sweep */}
      {!dirty && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.05),transparent)',
            animation: 'acglow 3s ease infinite',
          }}
        />
      )}

      {/* Status indicator */}
      <div
        className="absolute top-3 right-3 w-[7px] h-[7px] rounded-full"
        style={{
          background: dirty ? '#8b4513' : '#38bdf8',
          boxShadow: dirty ? 'none' : '0 0 8px rgba(56,189,248,0.8)',
        }}
      />

      {/* Vent slats */}
      <div className="flex flex-col gap-[8px] px-5 pt-9">
        {[0, 1, 2, 3].map(n => (
          <div
            key={n}
            style={{
              height: 4,
              borderRadius: 3,
              background: dirty
                ? `linear-gradient(90deg, #5a3010, ${n % 2 === 0 ? '#8b5520' : '#6b4020'}, #5a3010)`
                : 'linear-gradient(90deg, rgba(56,189,248,0.15), rgba(56,189,248,0.45), rgba(56,189,248,0.15))',
            }}
          />
        ))}
      </div>

      {/* Dirt overlay */}
      {dirty && (
        <>
          <div className="absolute w-10 h-6 rounded-full top-3 left-7"
               style={{ background: 'radial-gradient(circle,rgba(70,35,5,0.9),transparent 70%)' }}/>
          <div className="absolute w-7 h-5 rounded-full top-10 right-10"
               style={{ background: 'radial-gradient(circle,rgba(70,35,5,0.8),transparent 70%)' }}/>
          <div className="absolute w-8 h-5 rounded-full bottom-4 left-14"
               style={{ background: 'radial-gradient(circle,rgba(70,35,5,0.85),transparent 70%)' }}/>
          <div className="absolute w-5 h-4 rounded-full bottom-3 right-6"
               style={{ background: 'radial-gradient(circle,rgba(70,35,5,0.7),transparent 70%)' }}/>
        </>
      )}
    </div>
  )
}
