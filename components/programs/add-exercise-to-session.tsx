"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { type Exercise, prettyEquipment, prettyMuscle } from "@/lib/types/db"
import { addExerciseToSession } from "@/lib/actions/session-exercises"

export default function AddExerciseToSession({
  exercises,
  alreadyAddedIds,
  sessionId,
  programId
}: {
  exercises: Exercise[]
  alreadyAddedIds: string[]
  sessionId: string
  programId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, start] = useTransition()

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return exercises
    return exercises.filter((e) => e.name.toLowerCase().includes(needle))
  }, [exercises, q])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5"
      >
        + Add exercise
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises…"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setQ("")
          }}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>

      <ul className="max-h-72 divide-y divide-slate-200/70 overflow-y-auto rounded-xl bg-white/70 ring-1 ring-slate-200/70">
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            No matches.
          </li>
        )}
        {filtered.map((ex) => {
          const added = alreadyAddedIds.includes(ex.id)
          const isPending = pendingId === ex.id
          return (
            <li
              key={ex.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {ex.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {prettyMuscle(ex.primary_muscle)} ·{" "}
                  {prettyEquipment(ex.equipment)}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setPendingId(ex.id)
                  start(async () => {
                    try {
                      await addExerciseToSession({
                        sessionId,
                        programId,
                        exerciseId: ex.id
                      })
                      router.refresh()
                    } finally {
                      setPendingId(null)
                    }
                  })
                }}
                className={
                  added
                    ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                    : "rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
                }
              >
                {isPending ? "Adding…" : added ? "Added" : "Add"}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
