"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  prettyMuscle,
  prettyEquipment
} from "@/lib/types/db"
import { Input } from "@/components/ui/input"

export default function ExerciseFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    startTransition(() => router.replace(`/exercises?${next.toString()}`))
  }

  const scope = params.get("scope") ?? "all"

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2">
        {[
          { v: "all", l: "All" },
          { v: "global", l: "Library" },
          { v: "mine", l: "My customs" }
        ].map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => update("scope", t.v === "all" ? "" : t.v)}
            className={
              "rounded-full px-3 py-1 text-xs font-semibold transition " +
              (scope === t.v
                ? "bg-linear-to-r from-rose-500 to-orange-500 text-white shadow-sm"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50")
            }
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          defaultValue={params.get("search") ?? ""}
          placeholder="Search exercises…"
          onChange={(e) => update("search", e.target.value)}
        />
        <select
          defaultValue={params.get("muscle") ?? ""}
          onChange={(e) => update("muscle", e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <option value="">All muscles</option>
          {MUSCLE_GROUPS.map((m) => (
            <option key={m} value={m}>
              {prettyMuscle(m)}
            </option>
          ))}
        </select>
        <select
          defaultValue={params.get("equipment") ?? ""}
          onChange={(e) => update("equipment", e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <option value="">All equipment</option>
          {EQUIPMENT_TYPES.map((e) => (
            <option key={e} value={e}>
              {prettyEquipment(e)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
