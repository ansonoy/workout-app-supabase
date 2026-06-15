import Link from "next/link"
import { type Exercise, prettyEquipment, prettyMuscle } from "@/lib/types/db"

export function ExerciseCard({
  exercise,
  isMine
}: {
  exercise: Exercise
  isMine: boolean
}) {
  return (
    <Link
      href={`/exercises/${exercise.id}`}
      className="group flex flex-col gap-3 rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 group-hover:text-rose-600">
          {exercise.name}
        </h3>
        {isMine ? (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
            Custom
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            Library
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">
          {prettyMuscle(exercise.primary_muscle)}
        </span>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">
          {prettyEquipment(exercise.equipment)}
        </span>
        {exercise.secondary_muscles.slice(0, 2).map((m) => (
          <span
            key={m}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600"
          >
            {prettyMuscle(m)}
          </span>
        ))}
      </div>
      {exercise.description && (
        <p className="line-clamp-2 text-sm text-slate-600">
          {exercise.description}
        </p>
      )}
    </Link>
  )
}
