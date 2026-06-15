"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const SessionSchema = z.object({
  name: z.string().trim().min(1).max(80)
})

export type SessionActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function addSession(
  programId: string,
  _prev: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const parsed = SessionSchema.safeParse({ name: formData.get("name") ?? "" })
  if (!parsed.success) {
    return {
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()
  const { data: existing, error: countErr } = await supabase
    .from("sessions")
    .select("position")
    .eq("program_id", programId)
    .order("position", { ascending: false })
    .limit(1)
  if (countErr) return { error: countErr.message }
  const nextPos = (existing?.[0]?.position ?? -1) + 1

  const { error } = await supabase.from("sessions").insert({
    program_id: programId,
    name: parsed.data.name,
    position: nextPos
  })
  if (error) return { error: error.message }

  revalidatePath(`/programs/${programId}`)
  revalidatePath("/today")
  return {}
}

export async function renameSession(
  sessionId: string,
  programId: string,
  name: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("sessions")
    .update({ name: name.trim() })
    .eq("id", sessionId)
  if (error) throw error
  revalidatePath(`/programs/${programId}`)
  revalidatePath(`/programs/${programId}/sessions/${sessionId}`)
}

export async function deleteSession(
  sessionId: string,
  programId: string
): Promise<void> {
  const supabase = await createClient()

  // Pull current positions to resequence after delete.
  const { data: all, error: fetchErr } = await supabase
    .from("sessions")
    .select("id, position")
    .eq("program_id", programId)
    .order("position")
  if (fetchErr) throw fetchErr

  const { error: delErr } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
  if (delErr) throw delErr

  // Resequence remaining positions to 0..n-1.
  const remaining = (all ?? []).filter((s) => s.id !== sessionId)
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].position !== i) {
      await supabase
        .from("sessions")
        .update({ position: i })
        .eq("id", remaining[i].id)
    }
  }

  revalidatePath(`/programs/${programId}`)
  revalidatePath("/today")
}

export async function moveSession(
  sessionId: string,
  programId: string,
  direction: "up" | "down"
): Promise<void> {
  const supabase = await createClient()
  const { data: all, error } = await supabase
    .from("sessions")
    .select("id, position")
    .eq("program_id", programId)
    .order("position")
  if (error) throw error

  const ordered = all ?? []
  const idx = ordered.findIndex((s) => s.id === sessionId)
  const swapIdx = direction === "up" ? idx - 1 : idx + 1
  if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) return

  const a = ordered[idx]
  const b = ordered[swapIdx]

  // Swap via a temporary out-of-range value to avoid unique constraint clash.
  const tmp = -1 - idx
  await supabase.from("sessions").update({ position: tmp }).eq("id", a.id)
  await supabase
    .from("sessions")
    .update({ position: a.position })
    .eq("id", b.id)
  await supabase
    .from("sessions")
    .update({ position: b.position })
    .eq("id", a.id)

  revalidatePath(`/programs/${programId}`)
  revalidatePath("/today")
}

/** Atomically write the new position for every session in a program. */
export async function reorderSessions(
  programId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: all, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("program_id", programId)
  if (error) return { error: error.message }

  const existing = new Set((all ?? []).map((s) => s.id))
  if (
    orderedIds.length !== existing.size ||
    orderedIds.some((id) => !existing.has(id))
  ) {
    return { error: "Reorder ids do not match current sessions" }
  }

  for (let i = 0; i < orderedIds.length; i++) {
    const { error: e1 } = await supabase
      .from("sessions")
      .update({ position: -1000 - i })
      .eq("id", orderedIds[i])
    if (e1) return { error: e1.message }
  }
  for (let i = 0; i < orderedIds.length; i++) {
    const { error: e2 } = await supabase
      .from("sessions")
      .update({ position: i })
      .eq("id", orderedIds[i])
    if (e2) return { error: e2.message }
  }

  revalidatePath(`/programs/${programId}`)
  revalidatePath("/today")
  return {}
}
