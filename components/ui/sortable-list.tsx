"use client"

import { useEffect, useRef, useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export type SortableItem = { id: string }

/** Generic vertical sortable list with a drag handle inside each row. */
export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  children,
  disabled
}: {
  items: T[]
  onReorder: (orderedIds: string[]) => void
  children: (item: T, handle: SortableHandleProps) => React.ReactNode
  disabled?: boolean
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex)
    onReorder(next.map((i) => i.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        {items.map((item) => (
          <SortableRow key={item.id} id={item.id}>
            {(handleProps) => children(item, handleProps)}
          </SortableRow>
        ))}
      </SortableContext>
    </DndContext>
  )
}

export type SortableHandleProps = {
  attributes: React.HTMLAttributes<HTMLElement>
  listeners: React.HTMLAttributes<HTMLElement>
  isDragging: boolean
}

function SortableRow({
  id,
  children
}: {
  id: string
  children: (handle: SortableHandleProps) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.85 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        attributes: attributes as unknown as React.HTMLAttributes<HTMLElement>,
        listeners:
          (listeners as unknown as React.HTMLAttributes<HTMLElement>) ?? {},
        isDragging
      })}
    </div>
  )
}

/** Drag handle button — wire `attributes` and `listeners` from SortableList. */
export function DragHandle({
  attributes,
  listeners,
  isDragging,
  className = ""
}: SortableHandleProps & { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
      className={
        "grid h-8 w-8 cursor-grab touch-none place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing " +
        (isDragging ? "bg-slate-100 text-slate-700 " : "") +
        className
      }
    >
      {/* Six-dot drag glyph */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </button>
  )
}

/** Custom hook that wraps state + an optimistic reorder for use in sortable lists. */
export function useOptimisticOrder<T extends SortableItem>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial)

  // Re-sync to the incoming list when the server's source of truth changes
  // (e.g. after a revalidatePath() following an add/delete). Compare by id
  // signature so unrelated re-renders don't clobber optimistic local edits.
  const signature = initial.map((i) => i.id).join("|")
  const lastSignature = useRef(signature)
  useEffect(() => {
    if (lastSignature.current !== signature) {
      lastSignature.current = signature
      setItems(initial)
    }
  }, [signature, initial])

  function reorderByIds(orderedIds: string[]) {
    setItems((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]))
      return orderedIds.map((id) => map.get(id)!).filter(Boolean) as T[]
    })
  }

  return { items, setItems, reorderByIds }
}
