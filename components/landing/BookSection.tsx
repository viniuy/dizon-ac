'use client'

import { useEffect, useId, useState } from 'react'
import { RiCheckboxCircleFill, RiLoader4Line, RiPhoneFill } from '@remixicon/react'
import { BUSINESS, PHONE_NUMBERS, SERVICE_OPTIONS } from './landing.data'
import { SELECT_SERVICE_EVENT } from './ServicesSection'

type Field = 'name' | 'phone' | 'address' | 'service' | 'date' | 'message'
type Form = Record<Field, string>

const EMPTY: Form = { name: '', phone: '', address: '', service: '', date: '', message: '' }

// PH mobile (09xx / +639xx) or landline — digits only after stripping spaces, dashes, parens
const PHONE_RE = /^(\+?63|0)\d{9,10}$/

function validate(form: Form) {
  const errors: Partial<Record<Field, string>> = {}
  if (!form.name.trim())    errors.name    = 'Please enter your name.'
  if (!PHONE_RE.test(form.phone.replace(/[\s\-()]/g, '')))
                            errors.phone   = 'Please enter a valid PH number, e.g. 0917 123 4567.'
  if (!form.address.trim()) errors.address = 'Please enter the service address.'
  if (!form.service)        errors.service = 'Please choose a service.'
  return errors
}

const INPUT =
  'mt-1.5 block w-full rounded-[5px] border border-black/15 bg-white px-4 py-3 text-dac-ink placeholder:text-black/40 focus:border-dac-blue focus:ring-2 focus:ring-dac-blue/20 focus:outline-none aria-invalid:border-red-500'

export function BookSection() {
  const uid = useId()
  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // "Book this service" in the Services panel pre-selects the service here
  useEffect(() => {
    const onSelect = (e: Event) => {
      const option = (e as CustomEvent<string>).detail
      if (SERVICE_OPTIONS.includes(option)) setForm(f => ({ ...f, service: option }))
    }
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect)
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect)
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const name = e.target.name as Field
    setForm(f => ({ ...f, [name]: e.target.value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus()
      return
    }
    setSubmitting(true)
    // TODO: wire up to your form endpoint / Supabase / email service
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  const fieldProps = (name: Field) => ({
    id: `${uid}-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${uid}-${name}-error` : undefined,
    className: INPUT,
  })

  const errorText = (name: Field) =>
    errors[name] && (
      <p id={`${uid}-${name}-error`} className="mt-1.5 text-sm text-red-600">{errors[name]}</p>
    )

  return (
    <section id="book" className="scroll-mt-20 py-24" aria-labelledby="dac-book">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[2fr_3fr]">
        {/* ── Left: pitch + phones ─────────────────────── */}
        <div>
          <h2 id="dac-book" data-split className="text-[2.5rem] leading-tight font-semibold text-black">Book a Service</h2>
          <p data-reveal className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-dac-ink/85">
            Tell us about your unit and preferred date. We&apos;ll call or text you to confirm your schedule.
          </p>
          <ol data-reveal className="mt-8 space-y-3 text-dac-ink">
            {['Submit your request', 'We confirm your schedule', 'Free check-up & estimate on site'].map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-dac-ice text-sm font-bold text-dac-blue">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>

          <p className="mt-10 text-sm text-dac-ink/70">Rather call?</p>
          <a
            href={BUSINESS.phone.href}
            className="mt-1 inline-flex items-center gap-2 text-2xl font-bold text-dac-blue hover:underline"
          >
            <RiPhoneFill className="size-6" aria-hidden /> {BUSINESS.phone.display}
          </a>
          <ul className="mt-4 space-y-1 text-[15px] text-dac-ink/80">
            {PHONE_NUMBERS.slice(1).map(({ network, number, href }) => (
              <li key={number}>
                <a href={href} className="hover:text-dac-blue hover:underline">{number}</a>
                <span className="text-dac-ink/60"> · {network}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: form ──────────────────────────────── */}
        <div data-reveal className="rounded-[12px] border border-black/10 bg-white p-6 shadow-[0_30px_70px_-30px_rgb(31_111_209/0.35)] sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-10 text-center" role="status">
              <RiCheckboxCircleFill className="size-14 text-dac-blue" aria-hidden />
              <h3 className="mt-4 text-xl font-bold text-dac-ink">Request sent!</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-dac-ink/80">
                Thanks, {form.name.split(' ')[0]}. We&apos;ll reach out to {form.phone} shortly to confirm your
                booking. For urgent jobs, call us directly.
              </p>
              <a
                href={BUSINESS.phone.href}
                className="mt-6 inline-flex rounded-[5px] bg-dac-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-dac-ink"
              >
                Call {BUSINESS.phone.display}
              </a>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-name`} className="text-sm font-semibold text-dac-ink">Full name</label>
                <input type="text" autoComplete="name" placeholder="Juan dela Cruz" {...fieldProps('name')} />
                {errorText('name')}
              </div>
              <div>
                <label htmlFor={`${uid}-phone`} className="text-sm font-semibold text-dac-ink">Mobile number</label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0917 123 4567"
                  {...fieldProps('phone')}
                />
                {errorText('phone')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-address`} className="text-sm font-semibold text-dac-ink">Service address</label>
                <input
                  type="text"
                  autoComplete="street-address"
                  placeholder="House no., street, barangay, city"
                  {...fieldProps('address')}
                />
                {errorText('address')}
              </div>
              <div>
                <label htmlFor={`${uid}-service`} className="text-sm font-semibold text-dac-ink">Service</label>
                <select {...fieldProps('service')}>
                  <option value="" disabled>Choose a service</option>
                  {SERVICE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errorText('service')}
              </div>
              <div>
                <label htmlFor={`${uid}-date`} className="text-sm font-semibold text-dac-ink">
                  Preferred date <span className="font-normal text-dac-ink/60">(optional)</span>
                </label>
                <input type="date" {...fieldProps('date')} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-message`} className="text-sm font-semibold text-dac-ink">
                  Unit details <span className="font-normal text-dac-ink/60">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brand, type, HP, and what's wrong with it"
                  {...fieldProps('message')}
                  className={`${INPUT} resize-none`}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  data-magnetic
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] bg-dac-blue px-6 py-4 text-[1.1rem] font-semibold text-white transition-colors hover:bg-dac-ink disabled:opacity-70"
                >
                  {submitting && <RiLoader4Line className="size-5 animate-spin" aria-hidden />}
                  {submitting ? 'Sending…' : 'Book a Service'}
                </button>
                <p className="mt-3 text-center text-xs text-dac-ink/60">
                  Free check-up and estimate. You only pay once you approve the work.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
