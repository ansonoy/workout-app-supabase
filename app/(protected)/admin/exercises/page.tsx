import Link from "next/link"
import { listExercises } from "@/lib/data/exercises"
import { prettyEquipment, prettyMuscle } from "@/lib/types/db"
import DeleteExerciseButton from "@/components/exercises/delete-exercise-button"

export default async function AdminExercisesPage() {
  const exercises = await listExercises({ scope: "global" })

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          Global exercise library
        </h1>
        <Link
          href="/admin/exercises/new"
          className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5"
        >
          + New
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl bg-white/80 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Primary</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {exercises.map((ex) => (
              <tr key={ex.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {ex.name}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {prettyMuscle(ex.primary_muscle)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {prettyEquipment(ex.equipment)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link
                      href={`/admin/exercises/${ex.id}/edit`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                    <DeleteExerciseButton
                      id={ex.id}
                      redirectTo="/admin/exercises"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {exercises.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No global exercises yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
