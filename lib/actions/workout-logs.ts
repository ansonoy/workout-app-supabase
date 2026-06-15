"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/data/profile"

const LoggedSetSchema = z.object({
  exercise_id: z.string().uuid(),
  prescribed_set_id: z.string().uuid().nullable(),
  set_number: z.number().int().min(1),
  reps: z.number().int().min(0).nullable(),
  weight: z.number().min(0).nullable(),
  rpe: z.number().min(0).max(10).nullable(),
  rest_seconds: z.number().int().min(0).nullable(),
  notes: z.string().max(500).nullable()
})

const SaveLogSchema = z.object({
  program_id: z.string().uuid(),
  session_id: z.string().uuid(),
  duration_seconds: z.number().int().min(0).nullable(),
  notes: z.string().max(2000).nullable(),
  sets: z.array(LoggedSetSchema).max(200)
})

export type SaveWorkoutLogInput = z.input<typeof SaveLogSchema>

export async function saveWorkoutLog(
  input: SaveWorkoutLogInput
): Promise<{ error?: string; id?: string }> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const parsed = SaveLogSchema.safeParse(input)
  if (!parsed.success) return { error: "Invalid payload" }

  const supabase = await createClient()
  const { data: log, error } = await supabase
    .from("workout_logs")
    .insert({
      user_id: profile.id,
      program_id: parsed.data.program_id,
      session_id: parsed.data.session_id,
      duration_seconds: parsed.data.duration_seconds,
      notes: parsed.data.notes,
      skipped: false
    })
    .select("id")
    .single()
  if (error || !log) return { error: error?.message ?? "Failed to create log" }

  if (parsed.data.sets.length > 0) {
    const rows = parsed.data.sets.map((s) => ({
      workout_log_id: log.id,
      ...s
    }))
    const { error: setsErr } = await supabase.from("logged_sets").insert(rows)
    if (setsErr) {
      // Best effort: leave the empty log so the user can retry; surface error.
      return { error: setsErr.message }
    }
  }

  revalidatePath("/today")
  revalidatePath("/history")
  return { id: log.id }
}

export async function skipTodaysSession(args: {
  programId: string
  sessionId: string
}): Promise<{ error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const supabase = await createClient()
  const { error } = await supabase.from("workout_logs").insert({
    user_id: profile.id,
    program_id: args.programId,
    session_id: args.sessionId,
    skipped: true
  })
  if (error) return { error: error.message }

  revalidatePath("/today")
  revalidatePath("/history")
  return {}
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("workout_logs").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/today")
  revalidatePath("/history")
  redirect("/history")
}
