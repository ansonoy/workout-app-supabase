import Link from "next/link"
import { notFound } from "next/navigation"
import { getExercise } from "@/lib/data/exercises"
import { getCurrentProfile, isAdminRole } from "@/lib/data/profile"
import { getExerciseHistory, getTopWeightByReps } from "@/lib/data/stats"
import { prettyEquipment, prettyMuscle } from "@/lib/types/db"
import DeleteExerciseButton from "@/components/exercises/delete-exercise-button"
import ExerciseProgressChart from "@/components/stats/exercise-progress-chart"

export default async function ExerciseDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [exercise, profile, history, prByReps] = await Promise.all([
    getExercise(id),
    getCurrentProfile(),
    getExerciseHistory(id),
    getTopWeightByReps(id)
  ])
  if (!exercise) notFound()

  const isOwner = !!profile && exercise.owner_id === profile.id
  const isAdmin = isAdminRole(profile?.role)
  const canEdit = isOwner || (isAdmin && exercise.owner_id === null)
  const unit = profile?.unit_preference ?? "kg"

  const bestWeight = history.reduce((m, p) => Math.max(m, p.topWeight), 0)
  const bestE1rm = history.reduce((m, p) => Math.max(m, p.bestE1rm), 0)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href="/exercises"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back to exercises
      </Link>

      <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {exercise.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {exercise.owner_id === null
                ? "Global library exercise"
                : "Your custom exercise"}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Link
                href={`/exercises/${exercise.id}/edit`}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Edit
              </Link>
              <DeleteExerciseButton id={exercise.id} />
            </div>
          )}
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Primary muscle">
            {prettyMuscle(exercise.primary_muscle)}
          </Field>
          <Field label="Equipment">{prettyEquipment(exercise.equipment)}</Field>
          <Field label="Secondary muscles">
            {exercise.secondary_muscles.length
              ? exercise.secondary_muscles.map(prettyMuscle).join(", ")
              : "—"}
          </Field>
          {exercise.media_url && (
            <Field label="Media">
              <a
                href={exercise.media_url}
                target="_blank"
                rel="noreferrer"
                className="text-rose-600 underline-offset-4 hover:underline"
              >
                Open ↗
              </a>
            </Field>
          )}
        </dl>

        {exercise.description && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">
              {exercise.description}
            </p>
          </div>
        )}
      </div>

      {(bestWeight > 0 || bestE1rm > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {bestWeight > 0 && (
            <div className="rounded-2xl bg-linear-to-br from-rose-500 to-orange-500 p-5 text-white shadow-lg shadow-rose-500/30">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Top set ever
              </p>
              <p className="mt-1 text-2xl font-bold">
                {bestWeight} {unit}
              </p>
            </div>
          )}
          {bestE1rm > 0 && (
            <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Est. 1RM
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {bestE1rm} {unit}
              </p>
            </div>
          )}
        </div>
      )}

      <ExerciseProgressChart data={history} unit={unit} />

      {prByReps.length > 0 && (
        <div className="rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
          <h2 className="font-semibold text-slate-900">PRs by rep range</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Heaviest set ever performed at each rep count.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {prByReps.map((pr) => (
              <li key={pr.reps}>
                <Link
                  href={`/history/${pr.workout_log_id}`}
                  className="block rounded-xl bg-linear-to-br from-slate-50 to-white p-3 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                      {pr.reps} rep{pr.reps === 1 ? "" : "s"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(pr.performed_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {pr.weight}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      {unit}
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-slate-800">{children}</dd>
    </div>
  )
}
