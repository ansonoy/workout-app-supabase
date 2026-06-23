"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  prettyEquipment,
  prettyMuscle,
  type LoggedSet,
  type SessionWithExercises,
  type WeightUnit
} from "@/lib/types/db"
import {
  saveWorkoutLog,
  type SaveWorkoutLogInput
} from "@/lib/actions/workout-logs"
import RestTimer, { type RestTimerHandle } from "./rest-timer"

type DraftSet = {
  exerciseId: string
  prescribedSetId: string | null
  setNumber: number
  targetReps: number | null
  targetWeight: number | null
  reps: string
  weight: string
  rpe: string
  done: boolean
  restSeconds: number | null
}

type PrevMap = Record<string, { reps: number | null; weight: number | null }>

function prevKey(exerciseId: string, setNumber: number) {
  return `${exerciseId}:${setNumber}`
}

function buildInitial(
  session: SessionWithExercises,
  prev: PrevMap
): DraftSet[] {
  const out: DraftSet[] = []
  for (const se of session.session_exercises) {
    for (const s of se.sets) {
      const prior = prev[prevKey(se.exercise_id, s.set_number)]
      out.push({
        exerciseId: se.exercise_id,
        prescribedSetId: s.id,
        setNumber: s.set_number,
        targetReps: s.target_reps,
        targetWeight: s.target_weight,
        reps:
          prior?.reps?.toString() ??
          (s.target_reps != null ? String(s.target_reps) : ""),
        weight:
          prior?.weight?.toString() ??
          (s.target_weight != null ? String(s.target_weight) : ""),
        rpe: s.target_rpe != null ? String(s.target_rpe) : "",
        done: false,
        restSeconds: se.rest_seconds
      })
    }
  }
  return out
}

export default function WorkoutLogger({
  session,
  programId,
  previousLoggedSets,
  unit
}: {
  session: SessionWithExercises
  programId: string
  previousLoggedSets: Record<string, Pick<LoggedSet, "reps" | "weight">>
  unit: WeightUnit
}) {
  const router = useRouter()
  const [drafts, setDrafts] = useState<DraftSet[]>(() =>
    buildInitial(session, previousLoggedSets)
  )
  const [notes, setNotes] = useState("")
  const [startedAt] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const timerRef = useRef<RestTimerHandle | null>(null)

  const totals = useMemo(() => {
    const done = drafts.filter((d) => d.done).length
    return { done, all: drafts.length }
  }, [drafts])

  function patch(i: number, key: keyof DraftSet, value: string | boolean) {
    setDrafts((prev) =>
      prev.map((d, j) => (j === i ? { ...d, [key]: value } : d))
    )
  }

  function toggleDone(i: number) {
    setDrafts((prev) => {
      const next = prev.map((d, j) => (j === i ? { ...d, done: !d.done } : d))
      const target = next[i]
      if (target.done && target.restSeconds && target.restSeconds > 0) {
        // Defer the timer start so we don't trigger a state update on
        // RestTimer while WorkoutLogger is still rendering.
        const rest = target.restSeconds
        queueMicrotask(() => timerRef.current?.start(rest))
      }
      return next
    })
  }

  function finish() {
    setError(null)
    const numOrNull = (v: string) => {
      const t = v.trim()
      if (!t) return null
      const n = Number(t)
      return Number.isFinite(n) ? n : null
    }
    const payloadSets: SaveWorkoutLogInput["sets"] = drafts
      .filter((d) => d.done || d.reps.trim() || d.weight.trim())
      .map((d) => ({
        exercise_id: d.exerciseId,
        prescribed_set_id: d.prescribedSetId,
        set_number: d.setNumber,
        reps: numOrNull(d.reps) != null ? Math.trunc(Number(d.reps)) : null,
        weight: numOrNull(d.weight),
        rpe: numOrNull(d.rpe),
        rest_seconds: d.restSeconds,
        notes: null
      }))

    start(async () => {
      const res = await saveWorkoutLog({
        program_id: programId,
        session_id: session.id,
        duration_seconds: Math.floor((Date.now() - startedAt) / 1000),
        notes: notes.trim() || null,
        sets: payloadSets
      })
      if (res.error) {
        setError(res.error)
        return
      }
      timerRef.current?.stop()
      router.push(res.id ? `/history/${res.id}` : "/history")
      router.refresh()
    })
  }

  // Group drafts by exercise for rendering.
  const grouped = useMemo(() => {
    const byEx = new Map<
      string,
      { exerciseId: string; rows: { draft: DraftSet; index: number }[] }
    >()
    drafts.forEach((d, index) => {
      if (!byEx.has(d.exerciseId))
        byEx.set(d.exerciseId, { exerciseId: d.exerciseId, rows: [] })
      byEx.get(d.exerciseId)!.rows.push({ draft: d, index })
    })
    // Preserve the order they appear in the session
    return session.session_exercises
      .map((se) => {
        const g = byEx.get(se.exercise_id)
        return g ? { ...g, se } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [drafts, session])

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-md ring-1 ring-slate-200/70 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In progress
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {totals.done} / {totals.all} sets done
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={finish}
            className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Finish workout"}
          </button>
        </div>

        {grouped.map(({ se, rows }) => (
          <div
            key={se.id}
            className="rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {se.exercise.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {prettyMuscle(se.exercise.primary_muscle)} ·{" "}
                  {prettyEquipment(se.exercise.equipment)}
                </p>
              </div>
              {se.rest_seconds != null && se.rest_seconds > 0 && (
                <button
                  type="button"
                  onClick={() => timerRef.current?.start(se.rest_seconds!)}
                  className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-200"
                >
                  Start {se.rest_seconds}s rest
                </button>
              )}
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">Set</th>
                    <th className="py-2 pr-3">Target</th>
                    <th className="py-2 pr-3">Reps</th>
                    <th className="py-2 pr-3">Weight ({unit})</th>
                    <th className="py-2 pr-3">RPE</th>
                    <th className="py-2 pr-3 text-right">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ draft, index }) => (
                    <tr
                      key={index}
                      className={
                        "border-t border-slate-200/70 transition " +
                        (draft.done ? "bg-emerald-50/60" : "")
                      }
                    >
                      <td className="py-2 pr-3 font-semibold text-slate-700">
                        {draft.setNumber}
                      </td>
                      <td className="py-2 pr-3 text-xs text-slate-500">
                        {draft.targetReps != null
                          ? `${draft.targetReps} reps`
                          : "—"}
                        {draft.targetWeight != null
                          ? ` × ${draft.targetWeight}`
                          : ""}
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={draft.reps}
                          onChange={(e) => patch(index, "reps", e.target.value)}
                          className="h-8 w-20"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          min={0}
                          value={draft.weight}
                          onChange={(e) =>
                            patch(index, "weight", e.target.value)
                          }
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
                          value={draft.rpe}
                          onChange={(e) => patch(index, "rpe", e.target.value)}
                          className="h-8 w-20"
                        />
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleDone(index)}
                          className={
                            "rounded-full px-3 py-1 text-xs font-semibold transition " +
                            (draft.done
                              ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50")
                          }
                        >
                          {draft.done ? "✓ Done" : "Mark done"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
          <label
            htmlFor="workout-notes"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Notes
          </label>
          <textarea
            id="workout-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="How did it feel?"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:border-rose-300"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}
      </div>

      <RestTimer handleRef={timerRef} />
    </>
  )
}
