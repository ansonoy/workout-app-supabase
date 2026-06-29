"use client"

import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  prettyMuscle,
  prettyEquipment,
  type Exercise
} from "@/lib/types/db"
import type { ExerciseActionState } from "@/lib/actions/exercises"

type Action = (
  prev: ExerciseActionState,
  fd: FormData
) => Promise<ExerciseActionState>

export default function ExerciseForm({
  action,
  exercise,
  submitLabel = "Save exercise"
}: {
  action: Action
  exercise?: Exercise
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState<
    ExerciseActionState,
    FormData
  >(action, {} as ExerciseActionState)

  const fe = state.fieldErrors ?? {}

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm"
    >
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-slate-700">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={exercise?.name ?? ""}
        />
        {fe.name && <p className="text-sm text-rose-600">{fe.name[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description" className="text-slate-700">
          Description / cues
        </Label>
        <textarea
          id="description"
          name="description"
          defaultValue={exercise?.description ?? ""}
          rows={3}
          className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:border-rose-300"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="primary_muscle" className="text-slate-700">
          Primary muscle
        </Label>
        <select
          id="primary_muscle"
          name="primary_muscle"
          required
          defaultValue={exercise?.primary_muscle ?? ""}
          className="h-10 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <option value="" disabled>
            Select…
          </option>
          {MUSCLE_GROUPS.map((m) => (
            <option key={m} value={m}>
              {prettyMuscle(m)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label className="text-slate-700">Secondary muscles</Label>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((m) => {
            const checked = exercise?.secondary_muscles.includes(m) ?? false
            return (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1 text-xs ring-1 ring-slate-200 hover:bg-slate-50 has-[:checked]:bg-rose-100 has-[:checked]:text-rose-700 has-[:checked]:ring-rose-200"
              >
                <input
                  type="checkbox"
                  name="secondary_muscles"
                  value={m}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {prettyMuscle(m)}
              </label>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="equipment" className="text-slate-700">
          Equipment
        </Label>
        <select
          id="equipment"
          name="equipment"
          required
          defaultValue={exercise?.equipment ?? "bodyweight"}
          className="h-10 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          {EQUIPMENT_TYPES.map((e) => (
            <option key={e} value={e}>
              {prettyEquipment(e)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="increment" className="text-slate-700">
          Weight increment
        </Label>
        <Input
          id="increment"
          name="increment"
          type="number"
          inputMode="decimal"
          step="0.5"
          min={0}
          defaultValue={exercise?.increment ?? 5}
        />
        <p className="text-xs text-slate-500">
          How much to add each time you progress this exercise. During a workout
          your next weight is pre-filled as last weight + this amount.
        </p>
        {fe.increment && (
          <p className="text-sm text-rose-600">{fe.increment[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="media_url" className="text-slate-700">
          Media URL (optional)
        </Label>
        <Input
          id="media_url"
          name="media_url"
          type="url"
          defaultValue={exercise?.media_url ?? ""}
          placeholder="https://…"
        />
        {fe.media_url && (
          <p className="text-sm text-rose-600">{fe.media_url[0]}</p>
        )}
      </div>

      {state.error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  )
}
