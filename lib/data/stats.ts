import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { LoggedSet } from "@/lib/types/db"

export type ExerciseHistoryPoint = {
  performed_at: string
  topWeight: number
  topReps: number | null
  bestE1rm: number
  totalVolume: number
}

/** Epley 1RM estimate. */
function e1rm(weight: number, reps: number): number {
  if (reps <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export async function getExerciseHistory(
  exerciseId: string,
  limit = 60
): Promise<ExerciseHistoryPoint[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("logged_sets")
    .select(
      `id, set_number, reps, weight, workout_log:workout_logs!inner(id, performed_at, skipped)`
    )
    .eq("exercise_id", exerciseId)
    .not("weight", "is", null)
    .gt("weight", 0)
    .order("workout_log(performed_at)", { ascending: false })
    .limit(500)
  if (error) throw error

  type Row = LoggedSet & {
    workout_log: { id: string; performed_at: string; skipped: boolean } | null
  }
  const rows = ((data ?? []) as unknown as Row[]).filter(
    (r) => r.workout_log && !r.workout_log.skipped
  )

  const byLog = new Map<string, Row[]>()
  for (const r of rows) {
    const k = r.workout_log!.id
    if (!byLog.has(k)) byLog.set(k, [])
    byLog.get(k)!.push(r)
  }

  const points: ExerciseHistoryPoint[] = []
  for (const sets of byLog.values()) {
    let topWeight = 0
    let topReps: number | null = null
    let bestE1rm = 0
    let totalVolume = 0
    for (const s of sets) {
      const w = s.weight ?? 0
      const r = s.reps ?? 0
      if (w > topWeight) {
        topWeight = w
        topReps = s.reps
      }
      const est = e1rm(w, r)
      if (est > bestE1rm) bestE1rm = est
      if (w > 0 && r > 0) totalVolume += w * r
    }
    points.push({
      performed_at: sets[0].workout_log!.performed_at,
      topWeight,
      topReps,
      bestE1rm: Math.round(bestE1rm * 10) / 10,
      totalVolume: Math.round(totalVolume)
    })
  }

  return points
    .sort(
      (a, b) =>
        new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
    )
    .slice(-limit)
}

export type PersonalRecords = {
  /** All-time best weight at any rep count. */
  bestWeight: number
  /** All-time best estimated 1RM. */
  bestE1rm: number
  /** Best weight at each rep count seen so far, BEFORE the given log id. */
  bestWeightPerReps: Map<number, number>
}

export type PRByReps = {
  reps: number
  weight: number
  performed_at: string
  workout_log_id: string
}

/**
 * For each common rep count, return the best ever weight lifted at exactly
 * that rep count, plus the log it came from. Sorted by reps ascending.
 */
export async function getTopWeightByReps(
  exerciseId: string,
  repCounts: number[] = [1, 3, 5, 8, 10, 12]
): Promise<PRByReps[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("logged_sets")
    .select(
      `reps, weight, workout_log:workout_logs!inner(id, performed_at, skipped)`
    )
    .eq("exercise_id", exerciseId)
    .in("reps", repCounts)
    .not("weight", "is", null)
    .gt("weight", 0)
  if (error) throw error

  type Row = {
    reps: number | null
    weight: number | null
    workout_log: { id: string; performed_at: string; skipped: boolean } | null
  }
  const rows = ((data ?? []) as unknown as Row[]).filter(
    (r) => r.workout_log && !r.workout_log.skipped
  )

  const best = new Map<number, PRByReps>()
  for (const r of rows) {
    const reps = r.reps ?? 0
    const weight = r.weight ?? 0
    if (reps <= 0 || weight <= 0) continue
    const cur = best.get(reps)
    if (!cur || weight > cur.weight) {
      best.set(reps, {
        reps,
        weight,
        performed_at: r.workout_log!.performed_at,
        workout_log_id: r.workout_log!.id
      })
    }
  }

  return repCounts
    .map((r) => best.get(r))
    .filter((x): x is PRByReps => !!x)
    .sort((a, b) => a.reps - b.reps)
}

/** Compute PRs from all non-skipped logs strictly before the given log timestamp. */
export async function getPersonalRecordsBefore(
  exerciseId: string,
  beforePerformedAt: string
): Promise<PersonalRecords> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("logged_sets")
    .select(
      `reps, weight, workout_log:workout_logs!inner(performed_at, skipped)`
    )
    .eq("exercise_id", exerciseId)
    .not("weight", "is", null)
    .gt("weight", 0)
  if (error) throw error

  type Row = {
    reps: number | null
    weight: number | null
    workout_log: { performed_at: string; skipped: boolean } | null
  }
  const rows = ((data ?? []) as unknown as Row[]).filter(
    (r) =>
      r.workout_log &&
      !r.workout_log.skipped &&
      r.workout_log.performed_at < beforePerformedAt
  )

  let bestWeight = 0
  let bestE1rm = 0
  const bestWeightPerReps = new Map<number, number>()
  for (const r of rows) {
    const w = r.weight ?? 0
    const reps = r.reps ?? 0
    if (w > bestWeight) bestWeight = w
    const est = e1rm(w, reps)
    if (est > bestE1rm) bestE1rm = est
    if (reps > 0) {
      const prev = bestWeightPerReps.get(reps) ?? 0
      if (w > prev) bestWeightPerReps.set(reps, w)
    }
  }
  return { bestWeight, bestE1rm, bestWeightPerReps }
}

export type LogPRs = {
  exerciseToRecord: Map<
    string,
    { isWeightPR: boolean; isRepPR: boolean; isE1rmPR: boolean }
  >
}

/** Compare the sets in this workout against the user's prior bests. */
export async function detectPRsForLog(logId: string): Promise<LogPRs> {
  const supabase = await createClient()
  const { data: log, error: logErr } = await supabase
    .from("workout_logs")
    .select("id, performed_at, skipped")
    .eq("id", logId)
    .maybeSingle()
  if (logErr) throw logErr
  if (!log || log.skipped) return { exerciseToRecord: new Map() }

  const { data: sets, error } = await supabase
    .from("logged_sets")
    .select("exercise_id, reps, weight")
    .eq("workout_log_id", logId)
  if (error) throw error

  const exerciseToRecord = new Map<
    string,
    { isWeightPR: boolean; isRepPR: boolean; isE1rmPR: boolean }
  >()
  const byExercise = new Map<
    string,
    { reps: number | null; weight: number | null }[]
  >()
  for (const s of (sets ?? []) as {
    exercise_id: string
    reps: number | null
    weight: number | null
  }[]) {
    if (!byExercise.has(s.exercise_id)) byExercise.set(s.exercise_id, [])
    byExercise.get(s.exercise_id)!.push(s)
  }

  for (const [exerciseId, theseSets] of byExercise) {
    const prior = await getPersonalRecordsBefore(exerciseId, log.performed_at)
    let isWeightPR = false
    let isRepPR = false
    let isE1rmPR = false
    for (const s of theseSets) {
      const w = s.weight ?? 0
      const r = s.reps ?? 0
      if (w <= 0 || r <= 0) continue
      if (w > prior.bestWeight) isWeightPR = true
      const est = e1rm(w, r)
      if (est > prior.bestE1rm) isE1rmPR = true
      const priorAtReps = prior.bestWeightPerReps.get(r) ?? 0
      if (w > priorAtReps && w <= prior.bestWeight) isRepPR = true
    }
    if (isWeightPR || isRepPR || isE1rmPR) {
      exerciseToRecord.set(exerciseId, { isWeightPR, isRepPR, isE1rmPR })
    }
  }

  return { exerciseToRecord }
}
