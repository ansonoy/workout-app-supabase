import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        href="/admin/exercises"
        className="rounded-2xl bg-white/80 p-6 shadow-xs ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Exercise library
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage the global exercise catalog.
        </p>
      </Link>
    </div>
  )
}
