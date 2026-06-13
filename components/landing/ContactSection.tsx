'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PHONE_NUMBERS, CONTACT_DETAILS, SERVICE_OPTIONS } from './landing.data'

const NETWORK_COLORS: Record<string, string> = {
  Globe: '#38bdf8',
  Smart: '#22c55e',
  PLDT:  '#a78bfa',
}

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-left',
        { opacity: 0, x: -24 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '#contact', start: 'top 78%', toggleActions: 'play none none none' },
        },
      )
      gsap.fromTo(
        '.contact-right',
        { opacity: 0, x: 24 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '#contact', start: 'top 78%', toggleActions: 'play none none none' },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // TODO: wire up to your form endpoint / Supabase / email service
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-[1]"
      style={{
        borderTop: '1px solid rgba(56,189,248,0.08)',
        background: 'linear-gradient(180deg, var(--dac-accent-pale) 0%, transparent 100%)',
      }}
    >
      <div
        className="max-w-[1120px] mx-auto px-[clamp(1.25rem,5vw,3rem)]
                   py-[clamp(5rem,10vh,8rem)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(3rem,6vw,6rem)] items-start">

          {/* ── Left: contact info ───────────────────────── */}
          <div className="contact-left">
            <p className="section-eyebrow">Get in touch</p>
            <h2
              className="font-syne font-extrabold tracking-[-0.035em] leading-[1.05] text-dac-text mb-4"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
            >
              Book a Service or{' '}
              <span className="text-dac-accent">Get a Free Quote</span>
            </h2>
            <p className="text-dac-muted font-figtree leading-[1.75] mb-8 text-sm" style={{ maxWidth: 420 }}>
              Fill in the form or call us directly — we reply fast and our check-up
              is always free.
            </p>

            {/* ── Phone numbers ──────────────────────────── */}
            <div className="mb-8">
              <p className="text-dac-dim text-xs font-syne font-semibold uppercase tracking-[0.14em] mb-3">
                Call or Text
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PHONE_NUMBERS.map(({ network, number, href }) => (
                  <a
                    key={number}
                    href={href}
                    className="flex items-center gap-3 rounded-[12px] px-4 py-3.5
                               transition-all duration-200 hover:-translate-y-0.5 group"
                    style={{
                      background: 'var(--dac-card-dense)',
                      border: `1px solid rgba(${network === 'Globe' ? '56,189,248' : network === 'Smart' ? '34,197,94' : '167,139,250'},0.18)`,
                    }}
                  >
                    <span
                      className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                      style={{ background: NETWORK_COLORS[network] ?? '#38bdf8' }}
                    />
                    <div>
                      <p
                        className="font-syne font-bold leading-none"
                        style={{
                          color: NETWORK_COLORS[network] ?? '#38bdf8',
                          fontSize: '0.9375rem',
                        }}
                      >
                        {number}
                      </p>
                      <p className="text-dac-dim text-[0.7rem] font-figtree mt-0.5">{network}</p>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: NETWORK_COLORS[network] ?? '#38bdf8' }}
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.08 11.92 19.79 19.79 0 0 1 1 3.5 2 2 0 0 1 2.96 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Other contact details */}
            <div className="flex flex-col gap-3">
              {CONTACT_DETAILS.slice(1).map(({ icon, label, value, sub, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-start gap-3 rounded-[12px] px-4 py-3
                             hover:border-dac-border-hi transition-all duration-200 group"
                  style={{
                    background: 'var(--dac-card)',
                    border: '1px solid rgba(56,189,248,0.1)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-dac-accent flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(56,189,248,0.08)' }}
                  >
                    {icon === 'mail' && (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
                           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    )}
                    {icon === 'pin' && (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
                           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-dac-dim text-xs font-syne font-semibold uppercase tracking-[0.1em] mb-0.5">
                      {label}
                    </p>
                    <p className="text-dac-text text-sm font-figtree truncate">{value}</p>
                    <p className="text-dac-dim text-xs font-figtree">{sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Right: form ──────────────────────────────── */}
          <div
            className="contact-right rounded-[20px] p-[clamp(1.5rem,4vw,2.25rem)]"
            style={{
              background: 'var(--dac-card-dense)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(56,189,248,0.12)',
            }}
          >
            {submitted ? (
              /* ── Success state ─────────────────────────── */
              <div className="flex flex-col items-center text-center gap-4 py-10">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-dac-accent" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="font-syne font-bold text-dac-text text-xl">Request Sent!</h3>
                <p className="text-dac-muted text-sm font-figtree leading-[1.7]">
                  Thanks! We'll reach out to you shortly to confirm your booking.
                  For urgent jobs, call us directly.
                </p>
                <a href="tel:+639177800051" className="dac-btn-primary mt-2">
                  Call Now: 0917 780 0051
                </a>
              </div>
            ) : (
              /* ── Form ──────────────────────────────────── */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="font-syne font-bold text-dac-text text-lg mb-1">
                  Request a Service
                </h3>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-dac-muted text-xs font-syne font-semibold uppercase tracking-[0.1em]">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Juan dela Cruz"
                    required
                    className="dac-input"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-dac-muted text-xs font-syne font-semibold uppercase tracking-[0.1em]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxxx"
                    required
                    className="dac-input"
                  />
                </div>

                {/* Service */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-dac-muted text-xs font-syne font-semibold uppercase tracking-[0.1em]">
                    Service Needed
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                    className="dac-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="" disabled>Select a service…</option>
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-dac-muted text-xs font-syne font-semibold uppercase tracking-[0.1em]">
                    Message <span className="normal-case text-dac-dim">(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Brand/model of your unit, issue description, address…"
                    rows={3}
                    className="dac-input resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="dac-btn-primary justify-center mt-1"
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    'Send Request →'
                  )}
                </button>

                <p className="text-dac-dim text-xs text-center font-figtree">
                  Or call us directly —{' '}
                  <a href="tel:+639177800051" className="text-dac-accent hover:underline">
                    0917 780 0051
                  </a>
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
