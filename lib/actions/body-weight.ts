"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/data/profile"

const AddSchema = z.object({
  weight: z.coerce.number().positive().max(1000),
  unit: z.enum(["kg", "lb"]),
  recorded_at: z.string().min(1),
  notes: z.string().trim().max(500).optional().or(z.literal(""))
})

export type BodyWeightActionState = {
  error?: string
  ok?: boolean
}

export async function addBodyWeight(
  _prev: BodyWeightActionState,
  formData: FormData
): Promise<BodyWeightActionState> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const parsed = AddSchema.safeParse({
    weight: formData.get("weight"),
    unit: formData.get("unit") ?? profile.unit_preference,
    recorded_at: formData.get("recorded_at") ?? "",
    notes: formData.get("notes") ?? ""
  })
  if (!parsed.success) return { error: "Invalid input" }

  // Accept "YYYY-MM-DD" (date input) or full ISO. Coerce date-only to local noon
  // so timezone math doesn't bump it to the previous/next day.
  let recordedIso = parsed.data.recorded_at
  if (/^\d{4}-\d{2}-\d{2}$/.test(recordedIso)) {
    const [y, m, d] = recordedIso.split("-").map((n) => parseInt(n, 10))
    recordedIso = new Date(y, m - 1, d, 12, 0, 0).toISOString()
  }

  const supabase = await createClient()
  const { error } = await supabase.from("body_weight_logs").insert({
    user_id: profile.id,
    weight: parsed.data.weight,
    unit: parsed.data.unit,
    recorded_at: recordedIso,
    notes: parsed.data.notes || null
  })
  if (error) return { error: error.message }

  revalidatePath("/bodyweight")
  return { ok: true }
}

export async function deleteBodyWeight(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("body_weight_logs")
    .delete()
    .eq("id", id)
  if (error) throw error
  revalidatePath("/bodyweight")
}
