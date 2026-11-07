'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/staff', label: 'Calendar', match: (p: string) => p === '/staff' },
  { href: '/staff/tickets', label: 'Tickets', match: (p: string) => p.startsWith('/staff/tickets') },
]

/** Two-way segmented control, with the white thumb sliding to the current page */
export function StaffNav() {
  const pathname = usePathname()
  const index = Math.max(0, LINKS.findIndex(l => l.match(pathname)))

  return (
    <nav aria-label="Staff" className="relative grid grid-cols-2 rounded-[10px] bg-[rgb(118_118_128/0.12)] p-0.5">
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[8px] bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] transition-transform duration-300 ease-[cubic-bezier(.3,.7,.2,1)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {LINKS.map(l => (
        <Link
          key={l.href}
          href={l.href}
          prefetch // preloaded in full, so switching never shows a loading screen
          aria-current={l.match(pathname) ? 'page' : undefined}
          className="relative z-10 rounded-[8px] px-4 py-1 text-center text-[13px] font-medium text-foreground/65 transition-[color,transform] duration-200 hover:text-foreground active:scale-[0.95] aria-[current=page]:font-semibold aria-[current=page]:text-foreground sm:px-5"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
