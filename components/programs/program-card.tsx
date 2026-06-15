import Link from "next/link"
import { WEEKDAY_LABELS, type Program } from "@/lib/types/db"

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      href={`/programs/${program.id}`}
      className="group flex flex-col gap-3 rounded-2xl bg-white/80 p-5 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 group-hover:text-rose-600">
          {program.name}
        </h3>
        {program.is_active && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Active
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        {program.training_weekdays.length === 0 ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
            No training days set
          </span>
        ) : (
          program.training_weekdays.map((d) => (
            <span
              key={d}
              className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700"
            >
              {WEEKDAY_LABELS[d]}
            </span>
          ))
        )}
      </div>
      {program.description && (
        <p className="line-clamp-2 text-sm text-slate-600">
          {program.description}
        </p>
      )}
    </Link>
  )
}
