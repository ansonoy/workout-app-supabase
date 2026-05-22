import Link from "next/link"
import { Suspense, type ReactNode } from "react"
import { MdFitnessCenter } from "react-icons/md"
import { FaHeart } from "react-icons/fa"
import FooterYear from "@/components/footer-year"

// TODO: change this once we pick a real name
const APP_NAME = "FitQuest"

export default function ThemedShell({
  children,
  headerRight,
  contentClassName
}: {
  children: ReactNode
  headerRight?: ReactNode
  contentClassName?: string
}) {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col overflow-hidden bg-linear-to-b from-orange-50 via-rose-50 to-sky-50 text-slate-800">
      {/* Floating background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl animate-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl animate-blob animation-delay-2000"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl animate-blob animation-delay-4000"
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-rose-400 to-orange-400 text-white shadow-md transition-transform group-hover:rotate-6 group-hover:scale-110">
            <MdFitnessCenter size={20} />
          </span>
          <span className="text-slate-900">{APP_NAME}</span>
        </Link>

        {headerRight}
      </header>

      {/* Content */}
      <main
        className={
          contentClassName ??
          "relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pt-4 pb-12 sm:px-8"
        }
      >
        {children}
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-8 text-center text-xs text-slate-500 sm:px-8 sm:text-sm">
        Built with <FaHeart className="inline text-rose-400" /> — {APP_NAME} ©{" "}
        <Suspense fallback={"Loading year..."}>
          <FooterYear />
        </Suspense>
      </footer>
    </div>
  )
}
