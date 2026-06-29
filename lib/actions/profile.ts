"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/data/profile"

const ProfileSchema = z.object({
  display_name: z.string().trim().max(80).optional().or(z.literal("")),
  unit_preference: z.enum(["kg", "lb"])
})

export type ProfileActionState = {
  error?: string
  ok?: boolean
}

export async function updateMyProfile(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const profile = await getCurrentProfile()
  if (!profile) return { error: "Not signed in" }

  const parsed = ProfileSchema.safeParse({
    display_name: formData.get("display_name") ?? "",
    unit_preference: formData.get("unit_preference") ?? "lb"
  })
  if (!parsed.success) return { error: "Invalid input" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name || null,
      unit_preference: parsed.data.unit_preference
    })
    .eq("id", profile.id)
  if (error) return { error: error.message }

  revalidatePath("/settings")
  revalidatePath("/today")
  revalidatePath("/history")
  return { ok: true }
}
