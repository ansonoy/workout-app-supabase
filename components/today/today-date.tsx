"use client"

import { useEffect, useState } from "react"

export default function TodayDate() {
  const [label, setLabel] = useState("")

  useEffect(() => {
    setLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric"
      })
    )
  }, [])

  return <span suppressHydrationWarning>{label || "\u00A0"}</span>
}
