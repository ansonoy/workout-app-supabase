"use client"

import { useEffect, useRef, useState } from "react"

export type RestTimerHandle = {
  start: (seconds: number) => void
  stop: () => void
}

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
    handleRef.current = {
      start(seconds: number) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setRemaining(Math.max(0, Math.floor(seconds)))
        intervalRef.current = setInterval(() => {
          setRemaining((r) => {
            if (r === null) return null
            if (r <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current)
              intervalRef.current = null
              return 0
            }
            return r - 1
          })
        }, 1000)
      },
      stop() {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        setRemaining(null)
      }
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
