import Link from "next/link"
import { notFound } from "next/navigation"
import { getProgram } from "@/lib/data/programs"
import ProgramForm from "@/components/programs/program-form"
import { updateProgram, type ProgramActionState } from "@/lib/actions/programs"

export default async function EditProgramPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const program = await getProgram(id)
  if (!program) notFound()

  const bound = updateProgram.bind(null, id) as (
    prev: ProgramActionState,
    fd: FormData
  ) => Promise<ProgramActionState>

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={`/programs/${id}`}
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">Edit program</h1>
      <ProgramForm
        action={bound}
        program={program}
        submitLabel="Save changes"
      />
    </div>
  )
}
