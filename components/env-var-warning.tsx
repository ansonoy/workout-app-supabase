export function EnvVarWarning() {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
        Supabase env vars required
      </span>
      <div className="flex gap-2">
        <span className="cursor-not-allowed rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-slate-400 ring-1 ring-slate-200 backdrop-blur-sm">
          Sign in
        </span>
        <span className="cursor-not-allowed rounded-full bg-linear-to-r from-rose-300 to-orange-300 px-4 py-2 text-sm font-semibold text-white opacity-70">
          Sign up
        </span>
      </div>
    </div>
  )
}
