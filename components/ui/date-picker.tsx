"use client"

import * as React from "react"
import { RiCalendarLine, RiCloseCircleFill } from "@remixicon/react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Dates travel as plain "YYYY-MM-DD" strings; these convert at the calendar's edge in local time
const toDate = (s: string) => (s ? new Date(`${s}T00:00:00`) : undefined)
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const label = (s: string) =>
  new Intl.DateTimeFormat("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(toDate(s))

export interface DatePickerProps {
  /** Controlled value, "YYYY-MM-DD" or "" */
  value?: string
  /** Uncontrolled starting value */
  defaultValue?: string
  onChange?: (value: string) => void
  /** Submits the value with a surrounding <form> under this name */
  name?: string
  id?: string
  /** Earliest pickable date, "YYYY-MM-DD" */
  min?: string
  placeholder?: string
  /** Shows a clear button once a date is picked */
  clearable?: boolean
  disabled?: boolean
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  /** Styles for the trigger, so it can match the form it sits in */
  className?: string
  /** Styles for the popover panel */
  contentClassName?: string
  align?: "start" | "center" | "end"
}

/** shadcn date picker: a field-like button that opens a calendar in a popover */
export function DatePicker({
  value, defaultValue = "", onChange, name, id, min, placeholder = "Pick a date", clearable,
  disabled, className, contentClassName, align = "start", ...aria
}: DatePickerProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const current = value ?? inner

  const set = (v: string) => {
    if (value === undefined) setInner(v)
    onChange?.(v)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            data-invalid={aria["aria-invalid"] || undefined}
            aria-describedby={aria["aria-describedby"]}
            className={cn(
              "flex w-full items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50 data-invalid:border-red-500 data-invalid:ring-2 data-invalid:ring-destructive/40",
              !current && "text-muted-foreground",
              clearable && current && "pr-9",
              className,
            )}
          >
            {/* Own flex row, so a field style passed in (e.g. "block") can't stack the icon above the text */}
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <RiCalendarLine className="size-4 shrink-0 opacity-60" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{current ? label(current) : placeholder}</span>
            </span>
          </button>
        </PopoverTrigger>
        {clearable && current && !disabled && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => set("")}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            <RiCloseCircleFill className="size-[18px]" aria-hidden />
          </button>
        )}
      </div>
      {name && <input type="hidden" name={name} value={current} />}
      <PopoverContent align={align} className={cn("w-auto p-0", contentClassName)}>
        <Calendar
          mode="single"
          selected={toDate(current)}
          defaultMonth={toDate(current) ?? toDate(min ?? "")}
          disabled={min ? { before: toDate(min)! } : undefined}
          onSelect={d => {
            set(d ? toISO(d) : "")
            setOpen(false)
          }}
          className="[--cell-size:--spacing(9)]"
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
