import Link from "next/link"
import { notFound } from "next/navigation"
import { getExercise } from "@/lib/data/exercises"
import ExerciseForm from "@/components/exercises/exercise-form"
import {
  updateExercise,
  type ExerciseActionState
} from "@/lib/actions/exercises"

export default async function AdminEditExercisePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exercise = await getExercise(id)
  if (!exercise) notFound()

  const bound = updateExercise.bind(null, id) as (
    prev: ExerciseActionState,
    fd: FormData
  ) => Promise<ExerciseActionState>

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/admin/exercises"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">
        Edit library exercise
      </h1>
      <ExerciseForm action={bound} exercise={exercise} submitLabel="Save" />
    </div>
  )
}
