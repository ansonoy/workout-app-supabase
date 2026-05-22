import ThemedShell from "@/components/themed-shell"

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ThemedShell contentClassName="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pb-12 sm:px-8">
      <div className="w-full max-w-sm">{children}</div>
    </ThemedShell>
  )
}
