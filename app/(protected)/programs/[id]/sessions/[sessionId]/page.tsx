import Link from "next/link"
import { notFound } from "next/navigation"
import { getSessionWithExercises, getProgram } from "@/lib/data/programs"
import { listExercises } from "@/lib/data/exercises"
import SortableExerciseList from "@/components/programs/sortable-exercise-list"
import AddExerciseToSession from "@/components/programs/add-exercise-to-session"

export default async function SessionEditorPage({
  params
}: {
  params: Promise<{ id: string; sessionId: string }>
}) {
  const { id, sessionId } = await params
  const [session, program, exercises] = await Promise.all([
    getSessionWithExercises(sessionId),
    getProgram(id),
    listExercises({ scope: "all" })
  ])
  if (!session || !program || session.program_id !== program.id) notFound()

  const addedIds = session.session_exercises.map((se) => se.exercise_id)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href={`/programs/${program.id}`}
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back to {program.name}
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{session.name}</h1>
          <p className="text-sm text-slate-600">
            {session.session_exercises.length}{" "}
            {session.session_exercises.length === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <AddExerciseToSession
          exercises={exercises}
          alreadyAddedIds={addedIds}
          sessionId={session.id}
          programId={program.id}
        />
      </div>

      {session.session_exercises.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-10 text-center text-slate-600 ring-1 ring-slate-200/70">
          No exercises in this session yet. Use the picker above to add some.
        </div>
      ) : (
        <SortableExerciseList
          sessionId={session.id}
          programId={program.id}
          exercises={session.session_exercises}
        />
      )}
    </div>
  )
}
