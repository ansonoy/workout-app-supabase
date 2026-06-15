"use client"

import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import WeekdayPicker from "./weekday-picker"
import type { Program } from "@/lib/types/db"
import type { ProgramActionState } from "@/lib/actions/programs"

type Action = (
  prev: ProgramActionState,
  fd: FormData
) => Promise<ProgramActionState>

function todayIsoDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

export default function ProgramForm({
  action,
  program,
  submitLabel = "Save program"
}: {
  action: Action
  program?: Program
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState<
    ProgramActionState,
    FormData
  >(action, {} as ProgramActionState)

  const fe = state.fieldErrors ?? {}

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm"
    >
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-slate-700">
          Program name
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={program?.name ?? ""}
          placeholder="e.g. Push / Pull / Legs"
        />
        {fe.name && <p className="text-sm text-rose-600">{fe.name[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description" className="text-slate-700">
          Description
        </Label>
        <textarea
          id="description"
          name="description"
          defaultValue={program?.description ?? ""}
          rows={2}
          className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:border-rose-300"
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-slate-700">Training days</Label>
        <p className="text-xs text-slate-500">
          Pick the days of the week you plan to train. Sessions rotate through
          these days.
        </p>
        <WeekdayPicker defaultValue={program?.training_weekdays ?? []} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="start_date" className="text-slate-700">
          Start date
        </Label>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          required
          defaultValue={program?.start_date ?? todayIsoDate()}
        />
        {fe.start_date && (
          <p className="text-sm text-rose-600">{fe.start_date[0]}</p>
        )}
        <p className="text-xs text-slate-500">
          Rotation begins counting from this day.
        </p>
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
