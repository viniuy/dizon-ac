'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Pages that show lists other people (and customers) change: the calendar and the tickets list
const LIVE = (path: string) => path === '/staff' || path === '/staff/tickets'
const EVERY = 60_000 // while one of those pages is open and on screen
const STALE_AFTER = 20_000 // coming back to the tab, or hopping to a page served from cache

/**
 * Keeps the staff pages current without ever showing a loading state. Pages are reused from
 * the router cache so hopping between them is instant; this then swaps in fresh data in the
 * background (router.refresh keeps the current screen up until the new one is ready).
 */
export function LiveRefresh() {
  const router = useRouter()
  const pathname = usePathname()
  const last = useRef(0)

  // The page was just rendered fresh by the server, so the clock starts now (runs before the effect below)
  useEffect(() => {
    last.current = Date.now()
  }, [])

  useEffect(() => {
    const refresh = (force = false) => {
      if (document.visibilityState !== 'visible') return
      if (!force && Date.now() - last.current < STALE_AFTER) return
      last.current = Date.now()
      router.refresh()
    }

    // A page shown from cache may be a few minutes old, so freshen it right after it appears
    if (LIVE(pathname)) refresh()

    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    const timer = LIVE(pathname) ? window.setInterval(() => refresh(true), EVERY) : undefined

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
      window.clearInterval(timer)
    }
  }, [pathname, router])

  return null
}
