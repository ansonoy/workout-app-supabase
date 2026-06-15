import Link from "next/link"
import { listMyWorkoutLogs } from "@/lib/data/workout-logs"

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return null
  if (seconds < 60) return `${seconds}s`
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

export default async function HistoryPage() {
  const logs = await listMyWorkoutLogs()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">History</h1>
          <p className="text-sm text-slate-600">
            Every workout you&apos;ve logged.
          </p>
        </div>
        <Link
          href="/history/calendar"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Calendar view
        </Link>
      </header>

      {logs.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-10 text-center text-slate-600 ring-1 ring-slate-200/70">
          Nothing logged yet. Head to{" "}
          <Link
            href="/today"
            className="font-semibold text-rose-600 hover:underline"
          >
            today&apos;s session
          </Link>{" "}
          and crush some sets.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {logs.map((log) => {
            const duration = formatDuration(log.duration_seconds)
            return (
              <li key={log.id}>
                <Link
                  href={log.skipped ? "/history" : `/history/${log.id}`}
                  className={
                    "flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm transition " +
                    (log.skipped
                      ? "opacity-70"
                      : "hover:-translate-y-0.5 hover:shadow-lg")
                  }
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(log.performed_at)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {log.skipped ? "Skipped" : "Completed"}
                      {duration && !log.skipped ? ` · ${duration}` : ""}
                    </p>
                  </div>
                  {log.skipped ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Skipped
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      ✓ Done
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
