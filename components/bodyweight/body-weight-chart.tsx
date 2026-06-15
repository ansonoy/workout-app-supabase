"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import type { BodyWeightLog, WeightUnit } from "@/lib/types/db"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })
}

const KG_PER_LB = 0.45359237

function toUnit(weight: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return weight
  if (from === "lb" && to === "kg") return weight * KG_PER_LB
  return weight / KG_PER_LB
}

export default function BodyWeightChart({
  logs,
  unit
}: {
  logs: BodyWeightLog[]
  unit: WeightUnit
}) {
  if (logs.length < 2) return null

  const data = [...logs]
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .map((log) => ({
      date: formatDate(log.recorded_at),
      weight: Math.round(toUnit(log.weight, log.unit, unit) * 10) / 10
    }))

  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-slate-900">Trend</h2>
        <p className="text-xs text-slate-500">All entries, shown in {unit}</p>
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradBw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12
              }}
              formatter={(v: number) => `${v} ${unit}`}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#gradBw)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
