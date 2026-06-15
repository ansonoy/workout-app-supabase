"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { skipTodaysSession } from "@/lib/actions/workout-logs"

export default function SkipSessionButton({
  programId,
  sessionId
}: {
  programId: string
  sessionId: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Skip today's session? It won't advance your rotation, but it'll be recorded as skipped."
          )
        )
          return
        start(async () => {
          const res = await skipTodaysSession({ programId, sessionId })
          if (res.error) {
            alert(res.error)
            return
          }
          router.refresh()
        })
      }}
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {pending ? "Skipping…" : "Skip today"}
    </button>
  )
}
