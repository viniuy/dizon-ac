import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client with the project's secret key. It bypasses RLS, so it is only for
 * server code that has already checked who is asking (the staff sign-in codes).
 * Never import this from a client component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!key) throw new Error('SUPABASE_SECRET_KEY is not set')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
