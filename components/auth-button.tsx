import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { LogoutButton } from "./logout-button"

export async function AuthButton() {
  const supabase = await createClient()

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  return user ? (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-slate-600 sm:inline">
        Hey, <span className="font-semibold text-slate-900">{user.email}</span>!
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        href="/auth/login"
        className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs ring-1 ring-slate-200 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
      >
        Sign in
      </Link>
      <Link
        href="/auth/sign-up"
        className="rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5 hover:from-rose-600 hover:to-orange-600 hover:shadow-lg hover:shadow-rose-500/40"
      >
        Sign up
      </Link>
    </div>
  )
}
