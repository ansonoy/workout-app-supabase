import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Profile, UserRole } from "@/lib/types/db"

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) return null
  if (data) return data as Profile

  // Auto-heal: signed-in user with no profile row (e.g. handle_new_user
  // trigger never ran). Create one so server actions don't misreport this
  // as "Not signed in".
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select("*")
    .single()

  if (insertError) return null
  return created as Profile
})

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === "admin" || role === "super_admin"
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (!profile || !isAdminRole(profile.role)) redirect("/")
  return profile
}
