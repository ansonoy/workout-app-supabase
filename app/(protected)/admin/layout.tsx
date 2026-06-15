import Link from "next/link"
import { requireAdmin } from "@/lib/data/profile"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/95 p-4 px-5 text-white shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
            Admin
          </span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="opacity-80 hover:opacity-100">
              Dashboard
            </Link>
            <Link
              href="/admin/exercises"
              className="opacity-80 hover:opacity-100"
            >
              Exercises
            </Link>
          </nav>
        </div>
        <Link href="/" className="text-xs opacity-70 hover:opacity-100">
          ← Leave admin
        </Link>
      </div>
      {children}
    </div>
  )
}
