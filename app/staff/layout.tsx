import type { Metadata } from 'next'
import Link from 'next/link'
import { RiAddLine, RiLogoutBoxRLine } from '@remixicon/react'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { requireStaff } from '@/lib/staff'
import { cn } from '@/lib/utils'
import { HAIRLINE, IOS_TYPE } from './ios'
import { LiveRefresh } from './LiveRefresh'
import { StaffNav } from './StaffNav'

export const metadata: Metadata = { title: 'Bookings | Dizon Aircon', robots: { index: false } }

export default async function StaffLayout({ children }: LayoutProps<'/staff'>) {
  const { email } = await requireStaff()

  return (
    <div className={cn('staff-theme min-h-dvh text-foreground', IOS_TYPE)}>
      {/* Frosted bar, like an iOS navigation bar */}
      <header className={cn('sticky top-0 z-30 border-b bg-white/72 backdrop-blur-xl backdrop-saturate-150', HAIRLINE)}>
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:gap-5 sm:px-6">
          <Link href="/staff" prefetch className="flex shrink-0 items-baseline gap-1.5 leading-none">
            <span className="font-[family-name:var(--font-archivo)] text-lg font-extrabold tracking-tight text-dac-navy [font-stretch:125%]">DIZON</span>
            <span className="hidden text-[11px] font-semibold tracking-[0.06em] text-primary uppercase sm:inline">Bookings</span>
          </Link>
          <StaffNav />
          <span className="ml-auto hidden truncate text-[13px] text-muted-foreground lg:block">{email}</span>
          <Button
            asChild
            size="sm"
            className="ml-auto h-9 rounded-full px-4 text-[14px] font-semibold shadow-[0_4px_14px_-4px_rgb(31_111_209/0.55)] transition-transform duration-200 active:scale-[0.95] lg:ml-0"
          >
            <Link href="/staff/tickets/new" prefetch><RiAddLine /> <span className="max-sm:sr-only">New ticket</span></Link>
          </Button>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="grid size-9 place-items-center rounded-full text-primary transition-[background-color,transform] duration-200 hover:bg-[rgb(118_118_128/0.12)] active:scale-[0.9]"
            >
              <RiLogoutBoxRLine className="size-[18px]" aria-hidden />
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      <LiveRefresh />
    </div>
  )
}
