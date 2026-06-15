"use client"

import { useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import type { SessionActionState } from "@/lib/actions/sessions"

type Action = (
  prev: SessionActionState,
  fd: FormData
) => Promise<SessionActionState>

export default function AddSessionForm({ action }: { action: Action }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<
    SessionActionState,
    FormData
  >(action, {} as SessionActionState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!pending && !state.error && !state.fieldErrors) {
      formRef.current?.reset()
      router.refresh()
    }
  }, [pending, state, router])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm sm:flex-row sm:items-center"
    >
      <Input
        name="name"
        required
        placeholder="New session name (e.g. Push A)"
        className="flex-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Adding…" : "+ Add session"}
      </button>
      {state.error && (
        <p className="text-sm text-rose-600 sm:ml-3">{state.error}</p>
      )}
    </form>
  )
}
