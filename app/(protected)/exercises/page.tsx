import Link from "next/link"
import { listExercises, type ExerciseScope } from "@/lib/data/exercises"
import { getCurrentProfile } from "@/lib/data/profile"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import ExerciseFilters from "@/components/exercises/exercise-filters"
import type { MuscleGroup, EquipmentType } from "@/lib/types/db"

type SP = Promise<{
  search?: string
  muscle?: string
  equipment?: string
  scope?: string
}>

export default async function ExercisesPage({
  searchParams
}: {
  searchParams: SP
}) {
  const sp = await searchParams
  const [profile, exercises] = await Promise.all([
    getCurrentProfile(),
    listExercises({
      search: sp.search,
      muscle: sp.muscle as MuscleGroup | undefined,
      equipment: sp.equipment as EquipmentType | undefined,
      scope: (sp.scope as ExerciseScope) ?? "all"
    })
  ])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exercises</h1>
          <p className="text-sm text-slate-600">
            Browse the library or add your own.
          </p>
        </div>
        <Link
          href="/exercises/new"
          className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5"
        >
          + New custom
        </Link>
      </header>

      <ExerciseFilters />

      {exercises.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-10 text-center text-slate-600 ring-1 ring-slate-200/70">
          No exercises match. Try clearing filters or{" "}
          <Link
            href="/exercises/new"
            className="font-semibold text-rose-600 hover:underline"
          >
            add one of your own
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              isMine={!!profile && ex.owner_id === profile.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
