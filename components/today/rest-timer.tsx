"use client"

import { useEffect, useRef, useState } from "react"

export type RestTimerHandle = {
  start: (seconds: number) => void
  stop: () => void
}

const REST_TIMER_STORAGE_KEY = "rest-timer"

export function useRestTimer() {
  const ref = useRef<RestTimerHandle | null>(null)
  return ref
}

export default function RestTimer({
  handleRef
}: {
  handleRef: React.RefObject<RestTimerHandle | null>
}) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Drive the countdown from an absolute end timestamp so it stays accurate
    // across refreshes and while the tab is backgrounded.
    function beginCountdown(endsAt: number) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      const tick = () => {
        const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000))
        setRemaining(left)
        if (left <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          try {
            window.localStorage.removeItem(REST_TIMER_STORAGE_KEY)
          } catch {
            // Ignore storage failures.
          }
        }
      }
      tick()
      intervalRef.current = setInterval(tick, 250)
    }

    handleRef.current = {
      start(seconds: number) {
        const endsAt = Date.now() + Math.max(0, Math.floor(seconds)) * 1000
        try {
          window.localStorage.setItem(
            REST_TIMER_STORAGE_KEY,
            JSON.stringify({ endsAt })
          )
        } catch {
          // Ignore storage failures.
        }
        beginCountdown(endsAt)
      },
      stop() {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        setRemaining(null)
        try {
          window.localStorage.removeItem(REST_TIMER_STORAGE_KEY)
        } catch {
          // Ignore storage failures.
        }
      }
    }

    // Resume a timer that was still running before the page refreshed.
    try {
      const raw = window.localStorage.getItem(REST_TIMER_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { endsAt?: number }
        if (typeof saved.endsAt === "number" && saved.endsAt > Date.now()) {
          beginCountdown(saved.endsAt)
        } else {
          window.localStorage.removeItem(REST_TIMER_STORAGE_KEY)
        }
      }
    } catch {
      // Ignore corrupt or unavailable storage.
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [handleRef])

  if (remaining === null) return null

  const done = remaining === 0
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className={
          "flex items-center gap-3 rounded-full px-5 py-3 shadow-2xl ring-1 backdrop-blur-md transition " +
          (done
            ? "bg-emerald-500/95 text-white ring-emerald-300"
            : "bg-slate-900/95 text-white ring-slate-700")
        }
      >
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
          {done ? "Rest done" : "Rest"}
        </span>
        <span className="text-2xl font-bold tabular-nums">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => handleRef.current?.stop()}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
        >
          {done ? "Dismiss" : "Skip"}
        </button>
      </div>
    </div>
  )
}
