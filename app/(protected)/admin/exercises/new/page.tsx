import Link from "next/link"
import ExerciseForm from "@/components/exercises/exercise-form"
import { createGlobalExercise } from "@/lib/actions/exercises"

export default function AdminNewExercisePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/admin/exercises"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">
        New library exercise
      </h1>
      <p className="text-sm text-slate-600">Visible to every user.</p>
      <ExerciseForm
        action={createGlobalExercise}
        submitLabel="Publish to library"
      />
    </div>
  )
}
