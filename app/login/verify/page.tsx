import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CODE_RECIPIENTS, maskEmail } from '@/lib/two-factor'
import { VerifyForm } from './VerifyForm'

export const metadata: Metadata = { title: 'Sign-in code | Dizon Aircon', robots: { index: false } }

/** Step 2 of staff sign-in: the code emailed to the owners */
export default async function VerifyPage({ searchParams }: PageProps<'/login/verify'>) {
  const { error } = await searchParams

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')
  const [{ data: verified }, { data: hasRole }] = await Promise.all([
    supabase.rpc('is_staff_or_admin'),
    supabase.rpc('has_staff_role'),
  ])
  if (verified) redirect('/staff')
  if (!hasRole) redirect('/login?error=not-staff')

  const sentTo = CODE_RECIPIENTS.filter(Boolean).map(maskEmail)

  return (
    <main className="staff-theme relative grid min-h-dvh place-items-center overflow-hidden bg-linear-to-br! from-dac-navy! to-dac-navy-2! px-5">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center leading-none text-white">
          <span className="font-[family-name:var(--font-archivo)] text-4xl font-extrabold tracking-tight [font-stretch:125%]">DIZON</span>
          <span className="mt-2 font-[family-name:var(--font-poppins)] text-xs font-semibold tracking-wide text-sky-300">AIRCON AND REFRIGERATION</span>
        </Link>
        <div className="rounded-[26px] bg-card p-7 text-center shadow-2xl shadow-black/30">
          <h1 className="text-[20px] font-bold tracking-[-0.02em]">Enter the sign-in code</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            We emailed a 6-digit code to {sentTo.join(' and ')}.
          </p>
          <VerifyForm initialError={typeof error === 'string' ? error : undefined} email={String(data.claims.email ?? '')} />
        </div>
      </div>
    </main>
  )
}
