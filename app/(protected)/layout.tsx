import { AuthButton } from "@/components/auth-button"
import { EnvVarWarning } from "@/components/env-var-warning"
import { hasEnvVars } from "@/lib/utils"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ThemedShell from "@/components/themed-shell"
import AppNav from "@/components/app-nav"

async function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/auth/login")
  }

  return <>{children}</>
}

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ThemedShell
      headerRight={
        !hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense>
            <AuthButton />
          </Suspense>
        )
      }
    >
      <Suspense>
        <AuthGate>
          <AppNav />
          {children}
        </AuthGate>
      </Suspense>
    </ThemedShell>
  )
}
