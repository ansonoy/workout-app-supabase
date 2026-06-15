"use client"

import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  addBodyWeight,
  type BodyWeightActionState
} from "@/lib/actions/body-weight"
import type { WeightUnit } from "@/lib/types/db"

function todayDateInputValue() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function AddBodyWeightForm({
  defaultUnit
}: {
  defaultUnit: WeightUnit
}) {
  const [state, formAction, pending] = useActionState<
    BodyWeightActionState,
    FormData
  >(addBodyWeight, {} as BodyWeightActionState)

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Log weight</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1">
          <Label htmlFor="weight" className="text-xs text-slate-600">
            Weight
          </Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            required
            placeholder="0"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-slate-600">Unit</Label>
          <div className="flex gap-1">
            {(["kg", "lb"] as const).map((u) => (
              <label
                key={u}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 has-[:checked]:bg-linear-to-r has-[:checked]:from-rose-500 has-[:checked]:to-orange-500 has-[:checked]:text-white has-[:checked]:shadow-md has-[:checked]:shadow-rose-500/30 has-[:checked]:ring-transparent"
              >
                <input
                  type="radio"
                  name="unit"
                  value={u}
                  defaultChecked={defaultUnit === u}
                  className="sr-only"
                />
                {u.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="recorded_at" className="text-xs text-slate-600">
            Date
          </Label>
          <Input
            id="recorded_at"
            name="recorded_at"
            type="date"
            defaultValue={todayDateInputValue()}
            required
          />
        </div>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="notes" className="text-xs text-slate-600">
          Notes (optional)
        </Label>
        <Input id="notes" name="notes" placeholder="post-meal, morning, etc." />
      </div>

      {state.error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Logged.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add entry"}
      </button>
    </form>
  )
}
