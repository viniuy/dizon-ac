'use client'

import { RiShieldCheckLine } from '@remixicon/react'
import { addDays, dayLabel } from '@/lib/calendar'
import { WARRANTY_OPTIONS, type WarrantyDays } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { REVEAL } from './ios'

/** Pick a warranty for a job: 7 days (cleaning), 90 days (repair) or none */
export function WarrantyChooser({ value, onChange, jobDate, disabled }: {
  value: WarrantyDays | 0
  onChange: (days: WarrantyDays | 0) => void
  /** The job's date ("YYYY-MM-DD"); coverage counts from here */
  jobDate: string
  disabled?: boolean
}) {
  return (
    <div>
      <div role="radiogroup" aria-label="Warranty" className="grid grid-cols-3 gap-2">
        {WARRANTY_OPTIONS.map(o => {
          const on = value === o.days
          return (
            <button
              key={o.days}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(o.days)}
              className={cn(
                'flex flex-col items-center rounded-xl px-2 py-2.5 transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.97] disabled:opacity-40',
                on
                  ? 'bg-primary text-white shadow-[0_4px_14px_-4px_rgb(31_111_209/0.55)]'
                  : 'bg-[rgb(118_118_128/0.08)] text-primary hover:bg-[rgb(0_122_255/0.1)]',
              )}
            >
              <span className="text-[15px] font-semibold">{o.label}</span>
              <span className={cn('text-[12px]', on ? 'text-white/80' : 'text-muted-foreground')}>{o.hint}</span>
            </button>
          )
        })}
      </div>
      {value > 0 && (
        <p key={value} className={cn('mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground', REVEAL)}>
          <RiShieldCheckLine className="size-4 shrink-0 text-emerald-600" aria-hidden />
          Covered until <span className="font-medium text-foreground">{dayLabel(addDays(jobDate, value), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </p>
      )}
    </div>
  )
}
