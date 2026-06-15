"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  replaceSessionExerciseSets,
  removeSessionExercise,
  type SetInput
} from "@/lib/actions/session-exercises"
import type { SessionExerciseWithDetails } from "@/lib/types/db"

type DraftSet = {
  target_reps: string
  target_weight: string
  target_rpe: string
  tempo: string
  notes: string
}

function toDraft(s: SessionExerciseWithDetails["sets"][number]): DraftSet {
  return {
    target_reps: s.target_reps?.toString() ?? "",
    target_weight: s.target_weight?.toString() ?? "",
    target_rpe: s.target_rpe?.toString() ?? "",
    tempo: s.tempo ?? "",
    notes: s.notes ?? ""
  }
}

function toInput(d: DraftSet, idx: number): SetInput {
  const numOrNull = (v: string) => {
    const t = v.trim()
    if (!t) return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }
  return {
    set_number: idx + 1,
    target_reps: numOrNull(d.target_reps)
      ? Math.trunc(Number(d.target_reps))
      : null,
    target_weight: numOrNull(d.target_weight),
    target_rpe: numOrNull(d.target_rpe),
    tempo: d.tempo.trim() || null,
    notes: d.notes.trim() || null
  }
}

export default function SessionExerciseEditor({
  se,
  sessionId,
  programId
}: {
  se: SessionExerciseWithDetails
  sessionId: string
  programId: string
}) {
  const router = useRouter()
  const [sets, setSets] = useState<DraftSet[]>(
    se.sets.length
      ? se.sets.map(toDraft)
      : [
          {
            target_reps: "10",
            target_weight: "",
            target_rpe: "",
            tempo: "",
            notes: ""
          }
        ]
  )
  const [rest, setRest] = useState<string>(se.rest_seconds?.toString() ?? "")
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function patch(i: number, key: keyof DraftSet, value: string) {
    setSets((prev) =>
      prev.map((s, j) => (j === i ? { ...s, [key]: value } : s))
    )
  }
  function addRow() {
    setSets((prev) => {
      const last = prev[prev.length - 1]
      return [
        ...prev,
        last
          ? { ...last, notes: "" }
          : {
              target_reps: "10",
              target_weight: "",
              target_rpe: "",
              tempo: "",
              notes: ""
            }
      ]
    })
  }
  function removeRow(i: number) {
    setSets((prev) => prev.filter((_, j) => j !== i))
  }

  function save() {
    setError(null)
    start(async () => {
      const res = await replaceSessionExerciseSets({
        sessionExerciseId: se.id,
        sessionId,
        programId,
        restSeconds: rest.trim() ? Math.max(0, Math.trunc(Number(rest))) : null,
        sets: sets.map(toInput)
      })
      if (res.error) {
        setError(res.error)
      } else {
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 1500)
        router.refresh()
      }
    })
  }

  function remove() {
    if (!confirm(`Remove ${se.exercise.name} from this session?`)) return
    start(async () => {
      await removeSessionExercise({
        sessionExerciseId: se.id,
        sessionId,
        programId
      })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {se.exercise.name}
          </h3>
          <p className="text-xs text-slate-500">
            {se.exercise.primary_muscle} · {se.exercise.equipment}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={remove}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
        >
          Remove
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Set</th>
              <th className="py-2 pr-3">Reps</th>
              <th className="py-2 pr-3">Weight</th>
              <th className="py-2 pr-3">RPE</th>
              <th className="py-2 pr-3">Tempo</th>
              <th className="py-2 pr-3">Notes</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {sets.map((s, i) => (
              <tr key={i} className="border-t border-slate-200/70">
                <td className="py-2 pr-3 font-semibold text-slate-700">
                  {i + 1}
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={s.target_reps}
                    onChange={(e) => patch(i, "target_reps", e.target.value)}
                    className="h-8 w-20"
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min={0}
                    value={s.target_weight}
                    onChange={(e) => patch(i, "target_weight", e.target.value)}
                    className="h-8 w-24"
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min={0}
                    max={10}
                    value={s.target_rpe}
                    onChange={(e) => patch(i, "target_rpe", e.target.value)}
                    className="h-8 w-20"
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    value={s.tempo}
                    onChange={(e) => patch(i, "tempo", e.target.value)}
                    placeholder="3-1-1"
                    className="h-8 w-24"
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    value={s.notes}
                    onChange={(e) => patch(i, "notes", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-xs text-rose-600 hover:underline"
                    disabled={sets.length === 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          + Add set
        </button>

        <div className="flex items-end gap-3">
          <div className="grid gap-1">
            <Label htmlFor={`rest-${se.id}`} className="text-xs text-slate-600">
              Rest (seconds)
            </Label>
            <Input
              id={`rest-${se.id}`}
              type="number"
              inputMode="numeric"
              min={0}
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              className="h-8 w-24"
            />
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Saving…" : savedFlash ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
