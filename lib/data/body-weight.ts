import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { BodyWeightLog } from "@/lib/types/db"

export async function listBodyWeightLogs(
  limit = 200
): Promise<BodyWeightLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("body_weight_logs")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as BodyWeightLog[]
}

export async function getLatestBodyWeight(): Promise<BodyWeightLog | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("body_weight_logs")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as BodyWeightLog | null
}
