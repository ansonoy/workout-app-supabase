"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteProgram, activateProgram } from "@/lib/actions/programs"

export function DeleteProgramButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this program? All sessions will be removed."))
          return
        start(async () => {
          await deleteProgram(id)
          router.push("/programs")
          router.refresh()
        })
      }}
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  )
}

export function ActivateProgramButton({
  id,
  isActive
}: {
  id: string
  isActive: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        ✓ Active program
      </span>
    )
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await activateProgram(id)
          router.refresh()
        })
      }
      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {pending ? "Activating…" : "Set as active"}
    </button>
  )
}
