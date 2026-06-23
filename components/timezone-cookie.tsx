"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Stores the browser's IANA timezone in a `tz` cookie so server components can
 * compute "today" in the user's timezone instead of the server's. Refreshes the
 * route once when the cookie is first set or changes, so date-dependent server
 * rendering (e.g. today's scheduled session) uses the correct day immediately.
 */
export default function TimezoneCookie() {
  const router = useRouter()

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (!tz) return

      const match = document.cookie.split("; ").find((c) => c.startsWith("tz="))
      const existing = match ? decodeURIComponent(match.split("=")[1]) : null

      if (existing !== tz) {
        document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`
        router.refresh()
      }
    } catch {
      // Ignore: server falls back to its own timezone.
    }
  }, [router])

  return null
}
