import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Staff login | Dizon Aircon', robots: { index: false } }

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { error } = await searchParams

  return (
    <main className="staff-theme relative grid min-h-dvh place-items-center overflow-hidden bg-linear-to-br! from-dac-navy! to-dac-navy-2! px-5">
      {/* Soft cool-air glow behind the card */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center leading-none text-white">
          <span className="font-[family-name:var(--font-archivo)] text-4xl font-extrabold tracking-tight [font-stretch:125%]">DIZON</span>
          <span className="mt-2 font-[family-name:var(--font-poppins)] text-xs font-semibold tracking-wide text-sky-300">AIRCON AND REFRIGERATION</span>
        </Link>
        <div className="rounded-2xl bg-card p-7 shadow-2xl shadow-black/30">
          <h1 className="text-lg font-semibold">Staff login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage bookings.</p>
          {error === 'not-staff' && (
            <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              That account isn&apos;t set up as staff yet.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
