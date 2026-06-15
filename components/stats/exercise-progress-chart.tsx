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
import type { ExerciseHistoryPoint } from "@/lib/data/stats"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })
}

export default function ExerciseProgressChart({
  data,
  unit
}: {
  data: ExerciseHistoryPoint[]
  unit: "kg" | "lb"
}) {
  if (data.length < 2) return null

  const chartData = data.map((p) => ({
    date: formatDate(p.performed_at),
    "Top set": p.topWeight,
    "Est. 1RM": p.bestE1rm
  }))

  return (
    <div className="rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-slate-900">Progress</h2>
        <p className="text-xs text-slate-500">
          Top set weight and estimated 1RM ({unit}) over time
        </p>
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradTopSet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradE1rm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12
              }}
              formatter={(v) => `${v as number} ${unit}`}
            />
            <Area
              type="monotone"
              dataKey="Top set"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#gradTopSet)"
            />
            <Area
              type="monotone"
              dataKey="Est. 1RM"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#gradE1rm)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
