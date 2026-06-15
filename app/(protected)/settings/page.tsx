import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/data/profile"
import SettingsForm from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/auth/login")

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/today"
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        ← Back
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-600">Tweak how the app talks to you.</p>
      <SettingsForm profile={profile} />
    </div>
  )
}
