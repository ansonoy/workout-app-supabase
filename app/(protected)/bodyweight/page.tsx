import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/data/profile"
import { listBodyWeightLogs } from "@/lib/data/body-weight"
import AddBodyWeightForm from "@/components/bodyweight/add-body-weight-form"
import BodyWeightList from "@/components/bodyweight/body-weight-list"
import BodyWeightChart from "@/components/bodyweight/body-weight-chart"

export default async function BodyWeightPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/auth/login")

  const logs = await listBodyWeightLogs()
  const unit = profile.unit_preference

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Body weight</h1>
        <p className="text-sm text-slate-600">
          Track your weight over time alongside your lifts.
        </p>
      </header>

      <AddBodyWeightForm defaultUnit={unit} />

      <BodyWeightChart logs={logs} unit={unit} />

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          History
        </h2>
        <BodyWeightList logs={logs} />
      </div>
    </div>
  )
}
