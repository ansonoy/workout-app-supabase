import Link from "next/link"
import { listLogsBetween } from "@/lib/data/workout-logs"
import CalendarView from "@/components/history/calendar-view"

export default async function HistoryCalendarPage({
  searchParams
}: {
  searchParams: Promise<{ m?: string }>
}) {
  const { m } = await searchParams
  const now = new Date()
  let year: number
  let month: number // 0-indexed
  if (m && /^\d{4}-\d{1,2}$/.test(m)) {
    const [y, mm] = m.split("-").map((n) => parseInt(n, 10))
    year = y
    month = mm - 1
  } else {
    year = now.getFullYear()
    month = now.getMonth()
  }

  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 1)
  const logs = await listLogsBetween(start.toISOString(), end.toISOString())

  // Bucket logs by local date "YYYY-MM-DD".
  const byDate = new Map<string, { id: string; skipped: boolean }[]>()
  for (const log of logs) {
    const d = new Date(log.performed_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push({ id: log.id, skipped: log.skipped })
  }

  const prevMonth = new Date(year, month - 1, 1)
  const nextMonth = new Date(year, month + 1, 1)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-600">
            A bird&apos;s-eye view of what you&apos;ve trained.
          </p>
        </div>
        <Link
          href="/history"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          List view
        </Link>
      </header>

      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/history/calendar?m=${fmt(prevMonth)}`}
          className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          ← {prevMonth.toLocaleDateString(undefined, { month: "short" })}
        </Link>
        <h2 className="text-lg font-semibold text-slate-900">
          {start.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
          })}
        </h2>
        <Link
          href={`/history/calendar?m=${fmt(nextMonth)}`}
          className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          {nextMonth.toLocaleDateString(undefined, { month: "short" })} →
        </Link>
      </div>

      <CalendarView year={year} month={month} byDate={byDate} />

      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Completed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
          Skipped
        </span>
      </div>
    </div>
  )
}
