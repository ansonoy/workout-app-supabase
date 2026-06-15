"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/today", label: "Today" },
  { href: "/programs", label: "Programs" },
  { href: "/exercises", label: "Exercises" },
  { href: "/history", label: "History" },
  { href: "/bodyweight", label: "Body weight" },
  { href: "/settings", label: "Settings" }
]

export default function AppNavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const items = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS

  return (
    <nav className="mb-6 inline-flex flex-wrap gap-1 self-start rounded-full bg-white/70 p-1 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              active
                ? "bg-linear-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/30"
                : "text-slate-700 hover:bg-white"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
