"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile, isAdminRole } from "@/lib/data/profile"
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/lib/types/db"

const ExerciseSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  primary_muscle: z.enum(MUSCLE_GROUPS as [string, ...string[]]),
  secondary_muscles: z
    .array(z.enum(MUSCLE_GROUPS as [string, ...string[]]))
    .default([]),
  equipment: z.enum(EQUIPMENT_TYPES as [string, ...string[]]),
  media_url: z.string().trim().url().optional().or(z.literal(""))
})

export type ExerciseActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

function parseFormData(fd: FormData) {
  return ExerciseSchema.safeParse({
    name: fd.get("name") ?? "",
    description: fd.get("description") ?? "",
    primary_muscle: fd.get("primary_muscle") ?? "",
    secondary_muscles: fd.getAll("secondary_muscles") as string[],
    equipment: fd.get("equipment") ?? "",
    media_url: fd.get("media_url") ?? ""
  })
}

function normalize(input: z.infer<typeof ExerciseSchema>) {
  return {
    name: input.name,
    description: input.description || null,
    primary_muscle: input.primary_muscle,
    secondary_muscles: input.secondary_muscles,
    equipment: input.equipment,
    media_url: input.media_url || null
  }
}

export async function createCustomExercise(
  _prev: ExerciseActionState,
  formData: FormData
): Promise<ExerciseActionState> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return {
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("exercises")
    .insert({ ...normalize(parsed.data), owner_id: profile.id })
  if (error) return { error: error.message }

  revalidatePath("/exercises")
  redirect("/exercises?scope=mine")
}

export async function createGlobalExercise(
  _prev: ExerciseActionState,
  formData: FormData
): Promise<ExerciseActionState> {
  const profile = await getCurrentProfile()
  if (!profile || !isAdminRole(profile.role)) return { error: "Forbidden" }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return {
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("exercises")
    .insert({ ...normalize(parsed.data), owner_id: null })
  if (error) return { error: error.message }

  revalidatePath("/admin/exercises")
  revalidatePath("/exercises")
  redirect("/admin/exercises")
}

export async function updateExercise(
  id: string,
  _prev: ExerciseActionState,
  formData: FormData
): Promise<ExerciseActionState> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return {
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("exercises")
    .update(normalize(parsed.data))
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/exercises")
  revalidatePath(`/exercises/${id}`)
  revalidatePath("/admin/exercises")
  redirect(`/exercises/${id}`)
}

export async function deleteExercise(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("exercises").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/exercises")
  revalidatePath("/admin/exercises")
}
