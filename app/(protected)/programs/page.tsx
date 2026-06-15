import Link from "next/link"
import { listMyPrograms } from "@/lib/data/programs"
import { ProgramCard } from "@/components/programs/program-card"

export default async function ProgramsPage() {
  const programs = await listMyPrograms()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Programs</h1>
          <p className="text-sm text-slate-600">
            Build a rotating workout plan and let it pick today&apos;s session
            for you.
          </p>
        </div>
        <Link
          href="/programs/new"
          className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5"
        >
          + New program
        </Link>
      </header>

      {programs.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-10 text-center text-slate-600 ring-1 ring-slate-200/70">
          You don&apos;t have any programs yet.{" "}
          <Link
            href="/programs/new"
            className="font-semibold text-rose-600 hover:underline"
          >
            Create your first one
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      )}
    </div>
  )
}
