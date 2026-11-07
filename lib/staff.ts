import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'

/**
 * For staff pages and actions: signed-in, active staff or admin who has entered this sign-in's
 * emailed code. Without the code they go to /login/verify; without the role, back to /login.
 * Wrapped in React's cache so the layout, the page and its sections share one check per request
 * instead of each asking Supabase again.
 */
export const requireStaff = cache(async function requireStaff() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')

  // Active staff/admin AND this sign-in's emailed code entered (the same rule the database enforces)
  const { data: isStaff } = await supabase.rpc('is_staff_or_admin')
  if (!isStaff) {
    const { data: hasRole } = await supabase.rpc('has_staff_role')
    redirect(hasRole ? '/login/verify' : '/login?error=not-staff')
  }

  return { supabase, userId: data.claims.sub as string, email: data.claims.email as string | undefined }
})
