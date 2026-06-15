import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getExercise } from "@/lib/data/exercises"
import { getCurrentProfile, isAdminRole } from "@/lib/data/profile"
import ExerciseForm from "@/components/exercises/exercise-form"
import {
  updateExercise,
  type ExerciseActionState
} from "@/lib/actions/exercises"

export default async function EditExercisePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [exercise, profile] = await Promise.all([
    getExercise(id),
    getCurrentProfile()
  ])
  if (!exercise) notFound()

  const isOwner = !!profile && exercise.owner_id === profile.id
  const isAdmin = isAdminRole(profile?.role)
  const canEdit = isOwner || (isAdmin && exercise.owner_id === null)
  if (!canEdit) redirect(`/exercises/${id}`)

  const bound = updateExercise.bind(null, id) as (
    prev: ExerciseActionState,
    fd: FormData
  ) => Promise<ExerciseActionState>

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={`/exercises/${id}`}
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">Edit exercise</h1>
      <ExerciseForm
        action={bound}
        exercise={exercise}
        submitLabel="Save changes"
      />
    </div>
  )
}
