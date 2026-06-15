import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Exercise, MuscleGroup, EquipmentType } from "@/lib/types/db"

export type ExerciseScope = "all" | "global" | "mine"

export type ListExercisesArgs = {
  search?: string
  muscle?: MuscleGroup
  equipment?: EquipmentType
  scope?: ExerciseScope
}

export async function listExercises(
  args: ListExercisesArgs = {}
): Promise<Exercise[]> {
  const supabase = await createClient()
  let q = supabase.from("exercises").select("*").order("name")

  if (args.search?.trim()) q = q.ilike("name", `%${args.search.trim()}%`)
  if (args.muscle) q = q.eq("primary_muscle", args.muscle)
  if (args.equipment) q = q.eq("equipment", args.equipment)

  if (args.scope === "global") q = q.is("owner_id", null)
  if (args.scope === "mine") {
    const { data: claims } = await supabase.auth.getClaims()
    const uid = claims?.claims?.sub
    if (!uid) return []
    q = q.eq("owner_id", uid)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Exercise[]
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data as Exercise | null
}
