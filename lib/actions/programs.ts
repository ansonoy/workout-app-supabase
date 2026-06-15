"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/data/profile"

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const

const ProgramSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  training_weekdays: z
    .array(z.coerce.number().int().min(1).max(7))
    .refine((a) => new Set(a).size === a.length, "Duplicate weekday")
    .default([]),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Use YYYY-MM-DD")
})

export type ProgramActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

function parse(fd: FormData) {
  return ProgramSchema.safeParse({
    name: fd.get("name") ?? "",
    description: fd.get("description") ?? "",
    training_weekdays: (fd.getAll("training_weekdays") as string[]).filter(
      Boolean
    ),
    start_date: fd.get("start_date") ?? ""
  })
}

function normalize(input: z.infer<typeof ProgramSchema>) {
  const sorted = [...input.training_weekdays].sort((a, b) => a - b)
  return {
    name: input.name,
    description: input.description || null,
    training_weekdays: sorted,
    start_date: input.start_date
  }
}

export async function createProgram(
  _prev: ProgramActionState,
  formData: FormData
): Promise<ProgramActionState> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const parsed = parse(formData)
  if (!parsed.success) {
    return {
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("programs")
    .insert({ ...normalize(parsed.data), user_id: profile.id, is_active: true })
    .select("id")
    .single()
  if (error) return { error: error.message }

  revalidatePath("/programs")
  revalidatePath("/today")
  redirect(`/programs/${data!.id}`)
  void WEEKDAYS
}

export async function updateProgram(
  id: string,
  _prev: ProgramActionState,
  formData: FormData
): Promise<ProgramActionState> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const parsed = parse(formData)
  if (!parsed.success) {
    return {
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("programs")
    .update(normalize(parsed.data))
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/programs")
  revalidatePath(`/programs/${id}`)
  revalidatePath("/today")
  redirect(`/programs/${id}`)
}

export async function deleteProgram(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("programs").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/programs")
  revalidatePath("/today")
}

/** Activate one program; deactivates all others for this user. */
export async function activateProgram(id: string): Promise<void> {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error("Not signed in")

  const supabase = await createClient()
  const { error: deactivateErr } = await supabase
    .from("programs")
    .update({ is_active: false })
    .eq("user_id", profile.id)
    .neq("id", id)
  if (deactivateErr) throw deactivateErr

  const { error } = await supabase
    .from("programs")
    .update({ is_active: true })
    .eq("id", id)
  if (error) throw error

  revalidatePath("/programs")
  revalidatePath(`/programs/${id}`)
  revalidatePath("/today")
}
