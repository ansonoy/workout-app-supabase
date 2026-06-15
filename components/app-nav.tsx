import { Suspense } from "react"
import { getCurrentProfile, isAdminRole } from "@/lib/data/profile"
import AppNavLinks from "./app-nav-links"

async function AppNavInner() {
  const profile = await getCurrentProfile()
  return <AppNavLinks isAdmin={isAdminRole(profile?.role)} />
}

export default function AppNav() {
  return (
    <Suspense fallback={<div className="mb-6 h-10" />}>
      <AppNavInner />
    </Suspense>
  )
}
