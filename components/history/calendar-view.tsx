import Link from "next/link"
import { cn } from "@/lib/utils"

const WEEK_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarView({
  year,
  month,
  byDate
}: {
  year: number
  month: number
  byDate: Map<string, { id: string; skipped: boolean }[]>
}) {
  const firstOfMonth = new Date(year, month, 1)
  const startDow = firstOfMonth.getDay() // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  const isToday = (d: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d

  // Build a 6-row grid (42 cells) so months never jump height.
  const cells: ({ day: number } | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d })
  while (cells.length < 42) cells.push(null)

  return (
    <div className="overflow-hidden rounded-3xl bg-white/80 p-3 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm sm:p-4">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
        {WEEK_HEADERS.map((h) => (
          <div key={h} className="py-1.5">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="aspect-square" />
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            cell.day
          ).padStart(2, "0")}`
          const logs = byDate.get(key) ?? []
          const completed = logs.find((l) => !l.skipped)
          const skipped = !completed && logs.find((l) => l.skipped)
          const linkTarget = completed ? `/history/${completed.id}` : null

          const inner = (
            <div
              className={cn(
                "flex aspect-square w-full flex-col items-center justify-center rounded-xl text-sm transition",
                isToday(cell.day)
                  ? "ring-2 ring-rose-400"
                  : "ring-1 ring-slate-200/70",
                completed
                  ? "bg-linear-to-br from-emerald-100 to-emerald-50 text-emerald-900 hover:from-emerald-200 hover:to-emerald-100"
                  : skipped
                    ? "bg-slate-100 text-slate-500"
                    : "bg-white/60 text-slate-700"
              )}
            >
              <span className="font-semibold">{cell.day}</span>
              {(completed || skipped) && (
                <span
                  className={cn(
                    "mt-1 h-1.5 w-1.5 rounded-full",
                    completed ? "bg-emerald-500" : "bg-slate-400"
                  )}
                />
              )}
            </div>
          )

          return linkTarget ? (
            <Link key={i} href={linkTarget}>
              {inner}
            </Link>
          ) : (
            <div key={i}>{inner}</div>
          )
        })}
      </div>
    </div>
  )
}
