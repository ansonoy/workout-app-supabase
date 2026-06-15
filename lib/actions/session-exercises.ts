"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export type SessionExerciseActionState = {
  error?: string
}

export async function addExerciseToSession(args: {
  sessionId: string
  programId: string
  exerciseId: string
  defaultSets?: number
}): Promise<void> {
  const supabase = await createClient()

  const { data: existing, error: fetchErr } = await supabase
    .from("session_exercises")
    .select("position")
    .eq("session_id", args.sessionId)
    .order("position", { ascending: false })
    .limit(1)
  if (fetchErr) throw fetchErr
  const nextPos = (existing?.[0]?.position ?? -1) + 1

  const { data: se, error } = await supabase
    .from("session_exercises")
    .insert({
      session_id: args.sessionId,
      exercise_id: args.exerciseId,
      position: nextPos
    })
    .select("id")
    .single()
  if (error) throw error

  const defaultSetCount = args.defaultSets ?? 3
  const setRows = Array.from({ length: defaultSetCount }, (_, i) => ({
    session_exercise_id: se!.id,
    set_number: i + 1,
    target_reps: 10
  }))
  const { error: setsErr } = await supabase
    .from("session_exercise_sets")
    .insert(setRows)
  if (setsErr) throw setsErr

  revalidatePath(`/programs/${args.programId}/sessions/${args.sessionId}`)
}

export async function removeSessionExercise(args: {
  sessionExerciseId: string
  sessionId: string
  programId: string
}): Promise<void> {
  const supabase = await createClient()

  const { data: all, error: fetchErr } = await supabase
    .from("session_exercises")
    .select("id, position")
    .eq("session_id", args.sessionId)
    .order("position")
  if (fetchErr) throw fetchErr

  const { error: delErr } = await supabase
    .from("session_exercises")
    .delete()
    .eq("id", args.sessionExerciseId)
  if (delErr) throw delErr

  const remaining = (all ?? []).filter((s) => s.id !== args.sessionExerciseId)
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].position !== i) {
      await supabase
        .from("session_exercises")
        .update({ position: i })
        .eq("id", remaining[i].id)
    }
  }

  revalidatePath(`/programs/${args.programId}/sessions/${args.sessionId}`)
}

export async function moveSessionExercise(args: {
  sessionExerciseId: string
  sessionId: string
  programId: string
  direction: "up" | "down"
}): Promise<void> {
  const supabase = await createClient()
  const { data: all, error } = await supabase
    .from("session_exercises")
    .select("id, position")
    .eq("session_id", args.sessionId)
    .order("position")
  if (error) throw error

  const ordered = all ?? []
  const idx = ordered.findIndex((s) => s.id === args.sessionExerciseId)
  const swapIdx = args.direction === "up" ? idx - 1 : idx + 1
  if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) return

  const a = ordered[idx]
  const b = ordered[swapIdx]
  const tmp = -1 - idx
  await supabase
    .from("session_exercises")
    .update({ position: tmp })
    .eq("id", a.id)
  await supabase
    .from("session_exercises")
    .update({ position: a.position })
    .eq("id", b.id)
  await supabase
    .from("session_exercises")
    .update({ position: b.position })
    .eq("id", a.id)

  revalidatePath(`/programs/${args.programId}/sessions/${args.sessionId}`)
}

/** Atomically write the new position for every session_exercise in a session. */
export async function reorderSessionExercises(args: {
  sessionId: string
  programId: string
  orderedIds: string[]
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: all, error } = await supabase
    .from("session_exercises")
    .select("id")
    .eq("session_id", args.sessionId)
  if (error) return { error: error.message }

  const existing = new Set((all ?? []).map((s) => s.id))
  if (
    args.orderedIds.length !== existing.size ||
    args.orderedIds.some((id) => !existing.has(id))
  ) {
    return { error: "Reorder ids do not match current exercises" }
  }

  for (let i = 0; i < args.orderedIds.length; i++) {
    const { error: e1 } = await supabase
      .from("session_exercises")
      .update({ position: -1000 - i })
      .eq("id", args.orderedIds[i])
    if (e1) return { error: e1.message }
  }
  for (let i = 0; i < args.orderedIds.length; i++) {
    const { error: e2 } = await supabase
      .from("session_exercises")
      .update({ position: i })
      .eq("id", args.orderedIds[i])
    if (e2) return { error: e2.message }
  }

  revalidatePath(`/programs/${args.programId}/sessions/${args.sessionId}`)
  return {}
}

const SetInputSchema = z.object({
  set_number: z.number().int().min(1),
  target_reps: z.number().int().min(0).nullable(),
  target_weight: z.number().min(0).nullable(),
  target_rpe: z.number().min(0).max(10).nullable(),
  tempo: z.string().max(20).nullable(),
  notes: z.string().max(500).nullable()
})
const SetsInputSchema = z.array(SetInputSchema).max(50)

export type SetInput = z.infer<typeof SetInputSchema>

export async function replaceSessionExerciseSets(args: {
  sessionExerciseId: string
  sessionId: string
  programId: string
  restSeconds: number | null
  sets: SetInput[]
}): Promise<{ error?: string }> {
  const parsed = SetsInputSchema.safeParse(args.sets)
  if (!parsed.success) return { error: "Invalid sets payload" }

  const supabase = await createClient()

  const { error: updErr } = await supabase
    .from("session_exercises")
    .update({ rest_seconds: args.restSeconds })
    .eq("id", args.sessionExerciseId)
  if (updErr) return { error: updErr.message }

  const { error: delErr } = await supabase
    .from("session_exercise_sets")
    .delete()
    .eq("session_exercise_id", args.sessionExerciseId)
  if (delErr) return { error: delErr.message }

  if (parsed.data.length > 0) {
    const rows = parsed.data.map((s, i) => ({
      session_exercise_id: args.sessionExerciseId,
      set_number: i + 1,
      target_reps: s.target_reps,
      target_weight: s.target_weight,
      target_rpe: s.target_rpe,
      tempo: s.tempo,
      notes: s.notes
    }))
    const { error: insErr } = await supabase
      .from("session_exercise_sets")
      .insert(rows)
    if (insErr) return { error: insErr.message }
  }

  revalidatePath(`/programs/${args.programId}/sessions/${args.sessionId}`)
  return {}
}
