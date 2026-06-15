"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  SortableList,
  DragHandle,
  useOptimisticOrder
} from "@/components/ui/sortable-list"
import SessionExerciseEditor from "./session-exercise-editor"
import { reorderSessionExercises } from "@/lib/actions/session-exercises"
import type { SessionExerciseWithDetails } from "@/lib/types/db"

export default function SortableExerciseList({
  sessionId,
  programId,
  exercises
}: {
  sessionId: string
  programId: string
  exercises: SessionExerciseWithDetails[]
}) {
  const router = useRouter()
  const { items, reorderByIds } = useOptimisticOrder(exercises)
  const [pending, start] = useTransition()

  function persist(orderedIds: string[]) {
    reorderByIds(orderedIds)
    start(async () => {
      const res = await reorderSessionExercises({
        sessionId,
        programId,
        orderedIds
      })
      if (res.error) alert(res.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <SortableList items={items} onReorder={persist} disabled={pending}>
        {(se, handle) => (
          <div className="relative">
            <div className="absolute left-2 top-3 z-10">
              <DragHandle {...handle} />
            </div>
            <div className="pl-10">
              <SessionExerciseEditor
                se={se}
                sessionId={sessionId}
                programId={programId}
              />
            </div>
          </div>
        )}
      </SortableList>
    </div>
  )
}
