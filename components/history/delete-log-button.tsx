"use client"

import { useTransition } from "react"
import { deleteWorkoutLog } from "@/lib/actions/workout-logs"

export default function DeleteLogButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this workout? This cannot be undone.")) return
        start(async () => {
          await deleteWorkoutLog(id)
        })
      }}
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  )
}
