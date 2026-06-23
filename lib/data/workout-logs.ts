import "server-only"
import { createClient } from "@/lib/supabase/server"
import { zonedTodayRangeUtc } from "@/lib/rotation"
import type {
  WorkoutLog,
  WorkoutLogWithDetails,
  LoggedSet
} from "@/lib/types/db"

export async function countCompletedWorkouts(
  programId: string
): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("workout_logs")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId)
    .eq("skipped", false)
  if (error) throw error
  return count ?? 0
}

/** Has the user already logged (or skipped) anything today for this program? */
export async function getTodaysLogIfAny(
  programId: string,
  tz?: string | null
): Promise<WorkoutLog | null> {
  const supabase = await createClient()
  const { startIso, endIso } = zonedTodayRangeUtc(tz)

  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("program_id", programId)
    .gte("performed_at", startIso)
    .lt("performed_at", endIso)
    .order("performed_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as WorkoutLog | null
}

/** Most recent non-skipped log for a given session, used to prefill numbers. */
export async function getLastLoggedSetsForSession(
  sessionId: string
): Promise<Map<string, LoggedSet>> {
  const supabase = await createClient()
  const { data: log, error } = await supabase
    .from("workout_logs")
    .select("id")
    .eq("session_id", sessionId)
    .eq("skipped", false)
    .order("performed_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!log) return new Map()

  const { data: sets, error: setsErr } = await supabase
    .from("logged_sets")
    .select("*")
    .eq("workout_log_id", log.id)
  if (setsErr) throw setsErr

  const map = new Map<string, LoggedSet>()
  for (const s of (sets ?? []) as LoggedSet[]) {
    map.set(`${s.exercise_id}:${s.set_number}`, s)
  }
  return map
}

export async function listMyWorkoutLogs(limit = 50): Promise<WorkoutLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .order("performed_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as WorkoutLog[]
}

/** List workout_logs between two ISO timestamps (inclusive start, exclusive end). */
export async function listLogsBetween(
  startIso: string,
  endIso: string
): Promise<WorkoutLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .gte("performed_at", startIso)
    .lt("performed_at", endIso)
    .order("performed_at", { ascending: true })
  if (error) throw error
  return (data ?? []) as WorkoutLog[]
}

export async function getWorkoutLogWithDetails(
  id: string
): Promise<WorkoutLogWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_logs")
    .select(
      `
        *,
        session:sessions(*),
        logged_sets(*, exercise:exercises(*))
      `
    )
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const log = data as WorkoutLogWithDetails
  log.logged_sets = [...(log.logged_sets ?? [])].sort((a, b) => {
    if (a.exercise_id !== b.exercise_id) {
      return a.exercise.name.localeCompare(b.exercise.name)
    }
    return a.set_number - b.set_number
  })
  return log
}
