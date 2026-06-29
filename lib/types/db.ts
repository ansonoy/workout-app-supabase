export type UserRole = "user" | "admin" | "super_admin"

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "traps"
  | "lats"
  | "full_body"
  | "other"

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "traps",
  "lats",
  "full_body",
  "other"
]

export type EquipmentType =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "resistance_band"
  | "smith_machine"
  | "other"

export const EQUIPMENT_TYPES: EquipmentType[] = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "cable",
  "bodyweight",
  "resistance_band",
  "smith_machine",
  "other"
]

export type WeightUnit = "kg" | "lb"

export type Profile = {
  id: string
  display_name: string | null
  role: UserRole
  unit_preference: WeightUnit
  created_at: string
  updated_at: string
}

export type Exercise = {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  primary_muscle: MuscleGroup
  secondary_muscles: MuscleGroup[]
  equipment: EquipmentType
  media_url: string | null
  increment: number
  created_at: string
  updated_at: string
}

export function prettyMuscle(m: MuscleGroup): string {
  return m.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function prettyEquipment(e: EquipmentType): string {
  return e.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ISO weekday: 1 = Mon, ..., 7 = Sun
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const WEEKDAY_LABELS: Record<IsoWeekday, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun"
}

export const WEEKDAY_LONG: Record<IsoWeekday, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday"
}

export type Program = {
  id: string
  user_id: string
  name: string
  description: string | null
  training_weekdays: IsoWeekday[]
  start_date: string // YYYY-MM-DD
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Session = {
  id: string
  program_id: string
  name: string
  position: number
  notes: string | null
  created_at: string
}

export type SessionExercise = {
  id: string
  session_id: string
  exercise_id: string
  position: number
  rest_seconds: number | null
  notes: string | null
}

export type SessionExerciseSet = {
  id: string
  session_exercise_id: string
  set_number: number
  target_reps: number | null
  target_weight: number | null
  target_rpe: number | null
  tempo: string | null
  notes: string | null
}

export type SessionExerciseWithDetails = SessionExercise & {
  exercise: Exercise
  sets: SessionExerciseSet[]
}

export type SessionWithExercises = Session & {
  session_exercises: SessionExerciseWithDetails[]
}

export type ProgramWithSessions = Program & {
  sessions: Session[]
}

export type WorkoutLog = {
  id: string
  user_id: string
  program_id: string | null
  session_id: string | null
  performed_at: string
  duration_seconds: number | null
  notes: string | null
  skipped: boolean
  created_at: string
}

export type LoggedSet = {
  id: string
  workout_log_id: string
  exercise_id: string
  prescribed_set_id: string | null
  set_number: number
  reps: number | null
  weight: number | null
  rpe: number | null
  rest_seconds: number | null
  notes: string | null
}

export type LoggedSetWithExercise = LoggedSet & {
  exercise: Exercise
}

export type WorkoutLogWithDetails = WorkoutLog & {
  session: Session | null
  logged_sets: LoggedSetWithExercise[]
}

export type BodyWeightLog = {
  id: string
  user_id: string
  weight: number
  unit: WeightUnit
  recorded_at: string
  notes: string | null
  created_at: string
}
