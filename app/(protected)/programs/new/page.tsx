import Link from "next/link"
import ProgramForm from "@/components/programs/program-form"
import { createProgram } from "@/lib/actions/programs"

export default function NewProgramPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/programs"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back to programs
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">New program</h1>
      <p className="text-sm text-slate-600">
        After creating, you&apos;ll add sessions (A, B, C…) that rotate through
        your training days.
      </p>
      <ProgramForm action={createProgram} submitLabel="Create program" />
    </div>
  )
}
