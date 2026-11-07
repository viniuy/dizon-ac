'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendSignInCode, verifySignInCode, type CodeResult } from '@/lib/two-factor'

export type SignInState = { error?: string }

/** Step 1: email and password. Staff then get a code emailed to the owners (step 2). */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Wrong email or password.' }

  const { data: isStaff } = await supabase.rpc('has_staff_role')
  if (!isStaff) {
    await supabase.auth.signOut()
    redirect('/login?error=not-staff')
  }

  // Same client: it already holds the new session, before the cookie reaches the browser
  const result = await sendCodeForThisSession(supabase)
  redirect(result.error ? `/login/verify?error=${encodeURIComponent(result.error)}` : '/login/verify')
}

/** Step 2: the 6-digit code from the email */
export async function verifyCode(_prev: CodeResult, formData: FormData): Promise<CodeResult> {
  const session = await currentSession()
  if (!session) redirect('/login')

  const result = await verifySignInCode(session.sessionId, session.userId, String(formData.get('code') ?? '').trim())
  if (result.error) return result
  redirect('/staff')
}

/** "Send a new code" on the code page */
export async function resendCode(): Promise<CodeResult> {
  const result = await sendCodeForThisSession()
  return result.error ? result : { ok: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/** The signed-in staff session: its id is what a code is tied to */
async function currentSession(client?: Awaited<ReturnType<typeof createClient>>) {
  const supabase = client ?? await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.session_id || !claims.sub) return null
  return { supabase, sessionId: String(claims.session_id), userId: claims.sub, email: String(claims.email ?? 'A staff account') }
}

async function sendCodeForThisSession(client?: Awaited<ReturnType<typeof createClient>>): Promise<CodeResult> {
  const session = await currentSession(client)
  if (!session) redirect('/login')
  const { data: isStaff } = await session.supabase.rpc('has_staff_role')
  if (!isStaff) redirect('/login?error=not-staff')

  return sendSignInCode({ ...session, device: describeDevice((await headers()).get('user-agent') ?? '') })
}

/** "Chrome on Windows" from a user-agent string, for the email */
function describeDevice(ua: string) {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'A browser'
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'an unknown device'
  return `${browser} on ${os}`
}
