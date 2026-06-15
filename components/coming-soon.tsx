import Link from "next/link"

export default function ComingSoon({
  title,
  blurb
}: {
  title: string
  blurb: string
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white/80 p-10 text-center shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm">
      <div className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
        Coming soon
      </div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600">{blurb}</p>
      <Link
        href="/exercises"
        className="mt-2 rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5"
      >
        Browse exercises
      </Link>
    </div>
  )
}
