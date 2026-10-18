'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { RiChat3Fill, RiCloseLine, RiMailFill, RiMessage3Fill, RiPhoneFill } from '@remixicon/react'
import { BUSINESS } from './landing.data'

const OPTIONS = [
  { label: 'Call us',   href: BUSINESS.phone.href,        Icon: RiPhoneFill    },
  { label: 'Send SMS',  href: BUSINESS.sms,               Icon: RiMessage3Fill },
  { label: 'Email us',  href: `mailto:${BUSINESS.email}`, Icon: RiMailFill     },
]

/** Floating quick-contact button (bottom-right). */
export function ContactButton() {
  const id = useId()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="fixed right-5 bottom-5 z-50">
      {open && (
        <div
          id={id}
          className="absolute right-0 bottom-full mb-3 w-56 origin-bottom-right rounded-md border border-black/10 bg-white p-2 shadow-xl motion-safe:animate-[dac-pop_.18s_ease-out]"
        >
          <p className="sr-only">Contact us by</p>
          <ul className="space-y-1">
            {OPTIONS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center gap-3 rounded px-3 py-2.5 font-semibold text-dac-ink hover:bg-dac-mist"
                >
                  <Icon className="size-5 shrink-0 text-dac-blue" aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
        className="grid size-14 place-items-center rounded-full bg-dac-blue text-white shadow-lg ring-2 ring-white transition-transform hover:bg-dac-ink active:scale-95"
      >
        {open ? <RiCloseLine className="size-6" aria-hidden /> : <RiChat3Fill className="size-6" aria-hidden />}
        <span className="sr-only">{open ? 'Close contact options' : 'Contact us'}</span>
      </button>
    </div>
  )
}
