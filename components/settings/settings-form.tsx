"use client"

import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Profile } from "@/lib/types/db"
import { updateMyProfile, type ProfileActionState } from "@/lib/actions/profile"

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState<
    ProfileActionState,
    FormData
  >(updateMyProfile, {} as ProfileActionState)

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/70 backdrop-blur-sm"
    >
      <div className="grid gap-2">
        <Label htmlFor="display_name" className="text-slate-700">
          Display name
        </Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={profile.display_name ?? ""}
          placeholder="What should we call you?"
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-slate-700">Weight unit</Label>
        <div className="flex gap-2">
          {(["kg", "lb"] as const).map((u) => (
            <label
              key={u}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 has-[:checked]:bg-linear-to-r has-[:checked]:from-rose-500 has-[:checked]:to-orange-500 has-[:checked]:text-white has-[:checked]:shadow-md has-[:checked]:shadow-rose-500/30 has-[:checked]:ring-transparent"
            >
              <input
                type="radio"
                name="unit_preference"
                value={u}
                defaultChecked={profile.unit_preference === u}
                className="sr-only"
              />
              {u.toUpperCase()}
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          This affects how weights are labeled in the app. Existing log values
          aren&apos;t converted.
        </p>
      </div>

      {state.error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  )
}
