"use client"

import { WEEKDAY_LABELS, type IsoWeekday } from "@/lib/types/db"

const WEEKDAYS: IsoWeekday[] = [1, 2, 3, 4, 5, 6, 7]

export default function WeekdayPicker({
  defaultValue = []
}: {
  defaultValue?: IsoWeekday[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {WEEKDAYS.map((d) => {
        const checked = defaultValue.includes(d)
        return (
          <label
            key={d}
            className="flex cursor-pointer items-center justify-center rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 has-[:checked]:bg-linear-to-r has-[:checked]:from-rose-500 has-[:checked]:to-orange-500 has-[:checked]:text-white has-[:checked]:shadow-md has-[:checked]:shadow-rose-500/30 has-[:checked]:ring-transparent"
          >
            <input
              type="checkbox"
              name="training_weekdays"
              value={d}
              defaultChecked={checked}
              className="sr-only"
            />
            {WEEKDAY_LABELS[d]}
          </label>
        )
      })}
    </div>
  )
}
