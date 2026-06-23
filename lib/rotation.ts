import type { IsoWeekday, Session } from "@/lib/types/db"

/** JS Date.getDay() returns 0=Sun..6=Sat. Convert to ISO 1=Mon..7=Sun. */
export function isoWeekday(d: Date): IsoWeekday {
  const js = d.getDay()
  return (js === 0 ? 7 : js) as IsoWeekday
}

/** Parse "YYYY-MM-DD" as a local date at midnight. */
export function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Today as local-date midnight (strips time). */
export function todayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Year/month/day of `at` as seen in the given IANA timezone (e.g. "America/New_York"). */
function datePartsInTz(
  tz: string,
  at: Date
): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(at)
  const map: Record<string, string> = {}
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value
  return { y: Number(map.year), m: Number(map.month), d: Number(map.day) }
}

/**
 * Today as a date-only midnight Date matching the calendar day of the given
 * timezone. Falls back to the server's local day when tz is missing/invalid.
 * The returned Date is built from the tz's calendar Y/M/D, so its weekday and
 * date-only comparisons are correct regardless of where the server runs.
 */
export function todayInTz(tz?: string | null): Date {
  if (!tz) return todayLocal()
  try {
    const { y, m, d } = datePartsInTz(tz, new Date())
    return new Date(y, m - 1, d)
  } catch {
    return todayLocal()
  }
}

/** Offset (ms) of the IANA timezone relative to UTC at the given instant. */
function tzOffsetMs(tz: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(at)
  const map: Record<string, number> = {}
  for (const p of parts) if (p.type !== "literal") map[p.type] = Number(p.value)
  const asUtc = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour % 24,
    map.minute,
    map.second
  )
  return asUtc - at.getTime()
}

/**
 * UTC instants bounding "today" in the given timezone: [startIso, endIso).
 * Falls back to the server's local day when tz is missing/invalid.
 */
export function zonedTodayRangeUtc(tz?: string | null): {
  startIso: string
  endIso: string
} {
  const now = new Date()
  const serverFallback = () => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { startIso: start.toISOString(), endIso: end.toISOString() }
  }
  if (!tz) return serverFallback()
  try {
    const { y, m, d } = datePartsInTz(tz, now)
    const offset = tzOffsetMs(tz, now)
    const startMs = Date.UTC(y, m - 1, d, 0, 0, 0) - offset
    const dayMs = 24 * 60 * 60 * 1000
    return {
      startIso: new Date(startMs).toISOString(),
      endIso: new Date(startMs + dayMs).toISOString()
    }
  } catch {
    return serverFallback()
  }
}

/** Count training-day occurrences in [start, end] inclusive. */
export function countTrainingDaysBetween(
  start: Date,
  end: Date,
  trainingWeekdays: IsoWeekday[]
): number {
  if (end < start) return 0
  const set = new Set(trainingWeekdays)
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    if (set.has(isoWeekday(cur))) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export type TodaysScheduledSession =
  | { kind: "before_start"; startDate: string }
  | { kind: "rest_day"; nextTrainingDate: string | null }
  | { kind: "no_sessions" }
  | { kind: "scheduled"; session: Session; rotationIndex: number }

/**
 * Given a program's rotation config + today, return today's scheduled session.
 *
 * Rotation pointer = number of completed (non-skipped) workouts for this program.
 * Today's session = sessions[pointer % N] when today is a training day.
 * This way skipping doesn't advance the rotation.
 *
 * Pure: no DB calls. Caller passes in the program's sessions ordered by position
 * and the completed-workout count.
 */
export function computeTodaysSession(args: {
  startDate: string
  trainingWeekdays: IsoWeekday[]
  sessions: Session[]
  completedWorkouts: number
  today?: Date
}): TodaysScheduledSession {
  const today = args.today ?? todayLocal()
  const start = parseDateOnly(args.startDate)

  if (today < start) return { kind: "before_start", startDate: args.startDate }
  if (args.sessions.length === 0) return { kind: "no_sessions" }
  if (args.trainingWeekdays.length === 0)
    return { kind: "rest_day", nextTrainingDate: null }

  const todayWeekday = isoWeekday(today)
  if (!args.trainingWeekdays.includes(todayWeekday)) {
    return {
      kind: "rest_day",
      nextTrainingDate: findNextTrainingDate(today, args.trainingWeekdays)
    }
  }

  const ordered = [...args.sessions].sort((a, b) => a.position - b.position)
  const idx =
    ((args.completedWorkouts % ordered.length) + ordered.length) %
    ordered.length
  return { kind: "scheduled", session: ordered[idx], rotationIndex: idx }
}

function findNextTrainingDate(
  from: Date,
  trainingWeekdays: IsoWeekday[]
): string | null {
  if (trainingWeekdays.length === 0) return null
  const set = new Set(trainingWeekdays)
  const cur = new Date(from)
  cur.setDate(cur.getDate() + 1)
  for (let i = 0; i < 14; i++) {
    if (set.has(isoWeekday(cur))) {
      return `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(
        cur.getDate()
      ).padStart(2, "0")}`
    }
    cur.setDate(cur.getDate() + 1)
  }
  return null
}
