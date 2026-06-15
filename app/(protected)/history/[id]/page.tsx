import Link from "next/link"
import { notFound } from "next/navigation"
import { getWorkoutLogWithDetails } from "@/lib/data/workout-logs"
import { getCurrentProfile } from "@/lib/data/profile"
import { detectPRsForLog } from "@/lib/data/stats"
import DeleteLogButton from "@/components/history/delete-log-button"

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return null
  if (seconds < 60) return `${seconds}s`
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

export default async function WorkoutLogDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [log, profile] = await Promise.all([
    getWorkoutLogWithDetails(id),
    getCurrentProfile()
  ])
  if (!log) notFound()

  const prs = await detectPRsForLog(log.id)

  const unit = profile?.unit_preference ?? "kg"

  // Group sets by exercise (preserving sort order from data layer).
  const groups: { exerciseName: string; sets: typeof log.logged_sets }[] = []
  for (const set of log.logged_sets) {
    const last = groups[groups.length - 1]
    if (last && last.sets[0].exercise_id === set.exercise_id) {
      last.sets.push(set)
    } else {
      groups.push({ exerciseName: set.exercise.name, sets: [set] })
    }
  }

  // Total volume = sum(reps * weight) for sets with both values.
  const totalVolume = log.logged_sets.reduce((sum, s) => {
    if (s.reps != null && s.weight != null) return sum + s.reps * s.weight
    return sum
  }, 0)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href="/history"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back to history
      </Link>

      <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              {log.session?.name ?? "Workout"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {formatDate(log.performed_at)}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              {log.duration_seconds != null && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                  Duration {formatDuration(log.duration_seconds)}
                </span>
              )}
              {totalVolume > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">
                  Volume {Math.round(totalVolume)} {unit}
                </span>
              )}
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">
                {log.logged_sets.length} sets
              </span>
            </div>
          </div>
          <DeleteLogButton id={log.id} />
        </div>
        {log.notes && (
          <div className="mt-4 rounded-xl bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
            {log.notes}
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-6 text-center text-slate-600 ring-1 ring-slate-200/70">
          No sets were logged for this workout.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g, gi) => (
            <div
              key={gi}
              cdiv className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">
                  {g.exerciseName}
                </h3>
                {(() => {
                  const pr = prs.exerciseToRecord.get(g.sets[0].exercise_id)
                  if (!pr) return null
                  return (
                    <span className="rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/30">
                      {pr.isWeightPR
                        ? "★ Weight PR"
                        : pr.isE1rmPR
                          ? "★ 1RM PR"
                          : "★ Rep PR"}
                    </span>
                  )
                })()}
              </dive-200/70 backdrop-blur-sm"
            >
              <h3 className="font-semibold text-slate-900">{g.exerciseName}</h3>
              <ul className="mt-3 grid gap-1 text-sm">
                {g.sets.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50/80 px-3 py-1.5 text-slate-700"
                  >
                    <span className="font-semibold text-slate-900">
                      Set {s.set_number}
                    </span>
                    {s.reps != null && <span>{s.reps} reps</span>}
                    {s.weight != null && (
                      <span>
                        × {s.weight} {unit}
                      </span>
                    )}
                    {s.rpe != null && (
                      <span className="text-slate-500">@ RPE {s.rpe}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
