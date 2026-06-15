"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteExercise } from "@/lib/actions/exercises"

export default function DeleteExerciseButton({
  id,
  redirectTo = "/exercises"
}: {
  id: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this exercise? This cannot be undone.")) return
        start(async () => {
          await deleteExercise(id)
          router.push(redirectTo)
          router.refresh()
        })
      }}
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  )
}
