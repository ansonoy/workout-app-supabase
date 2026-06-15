import Link from "next/link"
import ExerciseForm from "@/components/exercises/exercise-form"
import { createCustomExercise } from "@/lib/actions/exercises"

export default function NewExercisePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/exercises"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back to exercises
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">New custom exercise</h1>
      <p className="text-sm text-slate-600">
        Only you will see exercises you add here.
      </p>
      <ExerciseForm
        action={createCustomExercise}
        submitLabel="Create exercise"
      />
    </div>
  )
}
