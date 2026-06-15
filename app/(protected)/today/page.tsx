import Link from "next/link"
import {
  getActiveProgramWithSessions,
  getSessionWithExercises
} from "@/lib/data/programs"
import {
  countCompletedWorkouts,
  getTodaysLogIfAny,
  getLastLoggedSetsForSession
} from "@/lib/data/workout-logs"
import { getCurrentProfile } from "@/lib/data/profile"
import { computeTodaysSession } from "@/lib/rotation"
import { WEEKDAY_LONG } from "@/lib/types/db"
import WorkoutLogger from "@/components/today/workout-logger"
import SkipSessionButton from "@/components/today/skip-button"

export default async function TodayPage() {
  const [program, profile] = await Promise.all([
    getActiveProgramWithSessions(),
    getCurrentProfile()
  ])

  if (!program) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white/80 p-10 text-center shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-900">No active program</h1>
        <p className="text-sm text-slate-600">
          Create a program and set it as active to see today&apos;s session
          here.
        </p>
        <Link
          href="/programs/new"
          className="mt-2 rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5"
        >
          Create a program
        </Link>
      </div>
    )
  }

  const completedWorkouts = await countCompletedWorkouts(program.id)

  const result = computeTodaysSession({
    startDate: program.start_date,
    trainingWeekdays: program.training_weekdays,
    sessions: program.sessions,
    completedWorkouts
  })

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              {todayLabel}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {result.kind === "scheduled"
                ? result.session.name
                : result.kind === "rest_day"
                  ? "Rest day"
                  : result.kind === "before_start"
                    ? "Program hasn't started yet"
                    : "No sessions yet"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              From your active program{" "}
              <Link
                href={`/programs/${program.id}`}
                className="font-semibold text-rose-600 hover:underline"
              >
                {program.name}
              </Link>
            </p>
          </div>
          {result.kind === "scheduled" && (
            <SkipSessionButton
              programId={program.id}
              sessionId={result.session.id}
            />
          )}
        </div>
      </div>

      {result.kind === "scheduled" && (
        <ScheduledSessionView
          sessionId={result.session.id}
          programId={program.id}
          unit={profile?.unit_preference ?? "kg"}
        />
      )}

      {result.kind === "rest_day" && (
        <div className="rounded-2xl bg-white/70 p-6 text-slate-700 ring-1 ring-slate-200/70 backdrop-blur-sm">
          <p>
            Take it easy. Your next training day is your scheduled rotation.
          </p>
          {result.nextTrainingDate && (
            <p className="mt-1 text-sm text-slate-500">
              Next training day: {result.nextTrainingDate}
            </p>
          )}
        </div>
      )}

      {result.kind === "before_start" && (
        <div className="rounded-2xl bg-white/70 p-6 text-slate-700 ring-1 ring-slate-200/70 backdrop-blur-sm">
          Your program starts on <strong>{result.startDate}</strong>.
        </div>
      )}

      {result.kind === "no_sessions" && (
        <div className="rounded-2xl bg-white/70 p-6 text-slate-700 ring-1 ring-slate-200/70 backdrop-blur-sm">
          This program doesn&apos;t have any sessions yet.{" "}
          <Link
            href={`/programs/${program.id}`}
            className="font-semibold text-rose-600 hover:underline"
          >
            Add some sessions
          </Link>
          .
        </div>
      )}

      {program.training_weekdays.length > 0 && (
        <p className="text-center text-xs text-slate-500">
          Training days:{" "}
          {program.training_weekdays.map((d) => WEEKDAY_LONG[d]).join(", ")}
        </p>
      )}
    </div>
  )
}

async function ScheduledSessionView({
  sessionId,
  programId,
  unit
}: {
  sessionId: string
  programId: string
  unit: "kg" | "lb"
}) {
  const [session, todaysLog, previous] = await Promise.all([
    getSessionWithExercises(sessionId),
    getTodaysLogIfAny(programId),
    getLastLoggedSetsForSession(sessionId)
  ])
  if (!session) return null

  if (todaysLog) {
    return (
      <div className="rounded-2xl bg-emerald-50/80 p-6 text-emerald-900 ring-1 ring-emerald-200/70 backdrop-blur-sm">
        <p className="text-sm font-semibold">
          {todaysLog.skipped
            ? "You marked today as skipped."
            : "You already logged today's workout."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!todaysLog.skipped && (
            <Link
              href={`/history/${todaysLog.id}`}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              View workout
            </Link>
          )}
          <Link
            href="/history"
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50"
          >
            History
          </Link>
        </div>
      </div>
    )
  }

  if (session.session_exercises.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 p-6 text-slate-700 ring-1 ring-slate-200/70 backdrop-blur-sm">
        This session has no exercises yet.{" "}
        <Link
          href={`/programs/${programId}/sessions/${sessionId}`}
          className="font-semibold text-rose-600 hover:underline"
        >
          Add some
        </Link>
        .
      </div>
    )
  }

  const previousObj: Record<
    string,
    { reps: number | null; weight: number | null }
  > = {}
  for (const [key, set] of previous) {
    previousObj[key] = { reps: set.reps, weight: set.weight }
  }

  return (
    <WorkoutLogger
      session={session}
      programId={programId}
      previousLoggedSets={previousObj}
      unit={unit}
    />
  )
}
