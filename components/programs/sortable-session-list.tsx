"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  SortableList,
  DragHandle,
  useOptimisticOrder
} from "@/components/ui/sortable-list"
import { deleteSession, reorderSessions } from "@/lib/actions/sessions"

type Item = { id: string; name: string }

export default function SortableSessionList({
  programId,
  sessions
}: {
  programId: string
  sessions: Item[]
}) {
  const router = useRouter()
  const { items, setItems, reorderByIds } = useOptimisticOrder(sessions)
  const [pending, start] = useTransition()

  function persist(orderedIds: string[]) {
    reorderByIds(orderedIds)
    start(async () => {
      const res = await reorderSessions(programId, orderedIds)
      if (res.error) {
        alert(res.error)
      }
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm("Delete this session?")) return
    setItems((prev) => prev.filter((s) => s.id !== id))
    start(async () => {
      await deleteSession(id, programId)
      router.refresh()
    })
  }

  return (
    <ol className="flex flex-col gap-3">
      <SortableList items={items} onReorder={persist} disabled={pending}>
        {(item, handle) => {
          const i = items.findIndex((x) => x.id === item.id)
          return (
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 p-3 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-sm">
              <div className="flex min-w-0 items-center gap-3">
                <DragHandle {...handle} />
                <span className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-rose-400 to-orange-400 text-sm font-bold text-white shadow-sm">
                  {String.fromCharCode(65 + (i % 26))}
                </span>
                <Link
                  href={`/programs/${programId}/sessions/${item.id}`}
                  className="truncate font-semibold text-slate-900 hover:text-rose-600"
                >
                  {item.name}
                </Link>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(item.id)}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          )
        }}
      </SortableList>
    </ol>
  )
}
