import Link from "next/link"
import { Suspense } from "react"
import FooterYear from "@/components/footer-year"
import {
  FaChartLine,
  FaDumbbell,
  FaFire,
  FaRocket,
  FaHeart,
  FaArrowRight,
  FaTint
} from "react-icons/fa"
import { MdFitnessCenter } from "react-icons/md"
import { BsStars } from "react-icons/bs"
import { IconType } from "react-icons"

// TODO: change this once we pick a real name
const APP_NAME = "FitQuest"

const features: {
  icon: IconType
  title: string
  description: string
  accent: string
}[] = [
  {
    icon: FaChartLine,
    title: "Track your progress",
    description:
      "Log every rep, set, and PR. Watch your gains stack up over time.",
    accent: "from-rose-200 to-orange-200"
  },
  {
    icon: FaDumbbell,
    title: "Build custom programs",
    description:
      "Mix and match exercises into routines that fit your goals and schedule.",
    accent: "from-sky-200 to-indigo-200"
  },
  {
    icon: FaFire,
    title: "Stay motivated",
    description:
      "Streaks, milestones, and tiny wins to keep you coming back for more.",
    accent: "from-emerald-200 to-teal-200"
  }
]

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-linear-to-b from-orange-50 via-rose-50 to-sky-50 text-slate-800">
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

        <Link
          href="/auth/login"
          className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs ring-1 ring-slate-200 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:px-5 sm:py-2.5 sm:text-base"
        >
          Log in
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 pt-8 pb-20 sm:px-8 sm:pt-16">
        <section className="flex flex-col items-center text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-rose-600 shadow-xs ring-1 ring-rose-100 backdrop-blur-sm sm:text-sm animate-float">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            Your fitness journey, simplified
          </span>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Sweat smarter with{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-full bg-amber-200/70 sm:h-4"
              />
            </span>{" "}
            <FaRocket className="inline-block animate-wiggle" />
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
            Track every workout, design programs you actually enjoy, and watch
            your progress climb. No spreadsheets. No fuss. Just gains.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/auth/sign-up"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-rose-500 to-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/40 sm:w-auto"
            >
              Get started — it&apos;s free
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center rounded-full bg-white/80 px-7 py-3.5 text-base font-semibold text-slate-800 shadow-xs ring-1 ring-slate-200 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
            >
              I already have an account
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 grid w-full grid-cols-1 gap-5 sm:mt-24 sm:grid-cols-3 sm:gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              style={{ animationDelay: `${i * 120}ms` }}
              className="group relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl animate-float-in"
            >
              <div
                aria-hidden
                className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-linear-to-br ${feature.accent} opacity-70 blur-2xl transition group-hover:scale-125`}
              />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs ring-1 ring-slate-200 transition-transform group-hover:-rotate-6 group-hover:scale-110">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Footer CTA */}
        <section className="mt-16 w-full sm:mt-24">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 p-8 text-center shadow-xl sm:p-12">
            <div
              aria-hidden
              className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-rose-500/30 blur-3xl"
            />
            <h2 className="relative flex items-center justify-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              Ready to break a sweat? <FaTint />
            </h2>
            <p className="relative mx-auto mt-2 max-w-md text-sm text-slate-300 sm:text-base">
              Join {APP_NAME} and turn every workout into a small win worth
              celebrating.
            </p>
            <Link
              href="/auth/sign-up"
              className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:text-base"
            >
              Start tracking today
              <BsStars />
            </Link>
          </div>
        </section>
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
