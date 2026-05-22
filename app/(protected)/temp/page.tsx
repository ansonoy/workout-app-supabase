import { createClient } from "@/lib/supabase/server"
import { InfoIcon } from "lucide-react"
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps"

async function UserDetails() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  return JSON.stringify(data?.claims, null, 2)
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 px-5 text-sm text-slate-700 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
          <InfoIcon size="16" strokeWidth={2} className="text-rose-500" />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4 text-slate-900">
          Your user details
        </h2>
        <pre className="text-xs font-mono p-3 rounded-2xl bg-white/70 ring-1 ring-slate-200/70 backdrop-blur-sm max-h-32 overflow-auto text-slate-800">
          <UserDetails />
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4 text-slate-900">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  )
}
