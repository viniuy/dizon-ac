'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { RiLoader4Line } from '@remixicon/react'
import { resendCode, signOut, verifyCode } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import type { CodeResult } from '@/lib/two-factor'

const RESEND_SECONDS = 60

export function VerifyForm({ initialError, email }: { initialError?: string; email: string }) {
  const [state, action, pending] = useActionState<CodeResult, FormData>(verifyCode, {})
  const [code, setCode] = useState('')
  const [resent, setResent] = useState<CodeResult>({})
  const [resending, startResend] = useTransition()
  const [wait, setWait] = useState(initialError ? 0 : RESEND_SECONDS)
  const form = useRef<HTMLFormElement>(null)

  // Countdown before another code can be asked for
  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait(w => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const error = state.error ?? resent.error ?? (code ? undefined : initialError)

  return (
    <div className="mt-6">
      <form ref={form} action={action}>
        <label htmlFor="code" className="sr-only">6-digit code</label>
        <input
          id="code"
          name="code"
          value={code}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
            setCode(digits)
            // Six digits in: check it straight away, as iOS does
            if (digits.length === 6) setTimeout(() => form.current?.requestSubmit())
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          autoFocus
          required
          placeholder="••••••"
          aria-invalid={!!state.error}
          className="h-16 w-full rounded-2xl bg-[rgb(118_118_128/0.1)] text-center text-[32px] font-semibold tracking-[0.5em] tabular-nums outline-none transition-shadow placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/40 aria-invalid:ring-2 aria-invalid:ring-destructive/40"
        />
        <div className="min-h-6 pt-2 text-[13px]">
          {error && <p role="alert" className="text-destructive">{error}</p>}
          {!error && resent.ok && <p role="status" className="text-emerald-700">A new code is on its way.</p>}
        </div>
        <Button
          type="submit"
          disabled={pending || code.length !== 6}
          className="mt-2 h-12 w-full rounded-full text-[17px] font-semibold shadow-[0_4px_14px_-4px_rgb(31_111_209/0.55)] transition-transform active:scale-[0.97]"
        >
          {pending && <RiLoader4Line className="animate-spin" aria-hidden />}
          Continue
        </Button>
      </form>

      <button
        type="button"
        disabled={wait > 0 || resending}
        onClick={() => startResend(async () => {
          const result = await resendCode()
          setResent(result)
          if (result.ok) { setCode(''); setWait(RESEND_SECONDS) }
        })}
        className="mt-4 text-[15px] font-medium text-primary transition-opacity hover:opacity-70 disabled:text-muted-foreground disabled:opacity-100"
      >
        {resending ? 'Sending…' : wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
      </button>

      <form action={signOut} className="mt-5 border-t border-[rgb(60_60_67/0.13)] pt-4">
        <p className="text-[13px] text-muted-foreground">Signed in as {email}</p>
        <button type="submit" className="mt-1 text-[14px] text-primary transition-opacity hover:opacity-70">Use a different account</button>
      </form>
    </div>
  )
}
