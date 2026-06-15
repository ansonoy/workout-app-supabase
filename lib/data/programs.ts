import "server-only"
import { createClient } from "@/lib/supabase/server"
import type {
  Program,
  ProgramWithSessions,
  SessionWithExercises
} from "@/lib/types/db"

export async function listMyPrograms(): Promise<Program[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Program[]
}

export async function getProgram(id: string): Promise<Program | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data as Program | null
}

export async function getProgramWithSessions(
  id: string
): Promise<ProgramWithSessions | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("programs")
    .select("*, sessions(*)")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const program = data as ProgramWithSessions
  program.sessions = [...(program.sessions ?? [])].sort(
    (a, b) => a.position - b.position
  )
  return program
}

export async function getActiveProgramWithSessions(): Promise<ProgramWithSessions | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("programs")
    .select("*, sessions(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const program = data as ProgramWithSessions
  program.sessions = [...(program.sessions ?? [])].sort(
    (a, b) => a.position - b.position
  )
  return program
}

export async function getSessionWithExercises(
  sessionId: string
): Promise<SessionWithExercises | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
        *,
        session_exercises(
          *,
          exercise:exercises(*),
          sets:session_exercise_sets(*)
        )
      `
    )
    .eq("id", sessionId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const session = data as SessionWithExercises
  session.session_exercises = [...(session.session_exercises ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((se) => ({
      ...se,
      sets: [...(se.sets ?? [])].sort((a, b) => a.set_number - b.set_number)
    }))
  return session
}
