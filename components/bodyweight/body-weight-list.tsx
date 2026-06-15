"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteBodyWeight } from "@/lib/actions/body-weight"
import type { BodyWeightLog } from "@/lib/types/db"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

export default function BodyWeightList({ logs }: { logs: BodyWeightLog[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 p-10 text-center text-slate-600 ring-1 ring-slate-200/70">
        No entries yet. Log your first weight above.
      </div>
    )
  }

  function remove(id: string) {
    if (!confirm("Delete this entry?")) return
    start(async () => {
      await deleteBodyWeight(id)
      router.refresh()
    })
  }

  return (
    <ul className="flex flex-col gap-2">
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {log.weight}{" "}
              <span className="text-xs font-normal text-slate-500">
                {log.unit}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              {formatDate(log.recorded_at)}
              {log.notes ? ` · ${log.notes}` : ""}
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => remove(log.id)}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
