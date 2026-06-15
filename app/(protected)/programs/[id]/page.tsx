import Link from "next/link"
import { notFound } from "next/navigation"
import { getProgramWithSessions } from "@/lib/data/programs"
import { WEEKDAY_LABELS } from "@/lib/types/db"
import AddSessionForm from "@/components/programs/add-session-form"
import { addSession } from "@/lib/actions/sessions"
import {
  ActivateProgramButton,
  DeleteProgramButton
} from "@/components/programs/program-buttons"
import SortableSessionList from "@/components/programs/sortable-session-list"

export default async function ProgramDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const program = await getProgramWithSessions(id)
  if (!program) notFound()

  const bound = addSession.bind(null, id)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href="/programs"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back to programs
      </Link>

      <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {program.name}
            </h1>
            {program.description && (
              <p className="mt-1 text-sm text-slate-600">
                {program.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>
                Starts <strong>{program.start_date}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <div className="flex flex-wrap gap-1">
                {program.training_weekdays.length === 0 ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                    No training days set
                  </span>
                ) : (
                  program.training_weekdays.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700"
                    >
                      {WEEKDAY_LABELS[d]}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ActivateProgramButton
              id={program.id}
              isActive={program.is_active}
            />
            <Link
              href={`/programs/${program.id}/edit`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Edit
            </Link>
            <DeleteProgramButton id={program.id} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900">Sessions</h2>
          <p className="text-xs text-slate-500">
            Sessions rotate in order across your training days.
          </p>
        </div>

        {program.sessions.length === 0 ? (
          <div className="rounded-2xl bg-white/70 p-8 text-center text-slate-600 ring-1 ring-slate-200/70">
            No sessions yet. Add your first one below.
          </div>
        ) : (
          <SortableSessionList
            programId={program.id}
            sessions={program.sessions.map((s) => ({ id: s.id, name: s.name }))}
          />
        )}

        <AddSessionForm action={bound} />
      </div>
    </div>
  )
}
