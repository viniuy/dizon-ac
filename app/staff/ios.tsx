// iOS-style building blocks for the staff area: inset grouped lists, hairline
// separators inset from the left, and a segmented control with a sliding thumb.
import { cn } from '@/lib/utils'

/** The device's own UI font, so it reads like a native screen: SF Pro on Apple devices, Segoe UI on Windows */
export const IOS_TYPE =
  '[font-family:-apple-system,BlinkMacSystemFont,"SF_Pro_Text","Segoe_UI_Variable_Text","Segoe_UI",Roboto,"Helvetica_Neue",sans-serif] tracking-[-0.01em]'

export const HAIRLINE = 'border-[rgb(60_60_67/0.13)]'
export const SURFACE = 'rounded-2xl bg-white shadow-[0_1px_2px_rgb(15_42_79/0.04),0_10px_28px_-14px_rgb(15_42_79/0.16)] ring-1 ring-black/[0.04]'

/** The curve iOS uses for sheets and Slide Over: fast out, long soft settle */
export const SPRING = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

/** Frosted "material" used by iOS for bars, sheets, popovers and Slide Over */
export const GLASS =
  'bg-white/62 backdrop-blur-2xl backdrop-saturate-[1.8] ring-1 ring-black/[0.06] shadow-[0_0_0_0.5px_rgb(255_255_255/0.6)_inset,0_24px_60px_-18px_rgb(15_42_79/0.35),0_2px_6px_rgb(15_42_79/0.06)]'

/** Entrance for each child of a container, one after another: rises a few pixels and fades in (the 9th child onwards share the last delay) */
export const STAGGER = [
  '[&>*]:animate-in [&>*]:fade-in-0 [&>*]:slide-in-from-bottom-1 [&>*]:fill-mode-both [&>*]:duration-500 [&>*]:ease-[cubic-bezier(0.32,0.72,0,1)]',
  '[&>*:nth-child(2)]:delay-40 [&>*:nth-child(3)]:delay-80 [&>*:nth-child(4)]:delay-120',
  '[&>*:nth-child(5)]:delay-160 [&>*:nth-child(6)]:delay-200 [&>*:nth-child(7)]:delay-240',
  '[&>*:nth-child(8)]:delay-280 [&>*:nth-child(n+9)]:delay-320',
].join(' ')

/** Tappable list row: faint on hover, the grey iOS highlight while pressed */
export const ROW_PRESS = 'transition-colors duration-150 hover:bg-[rgb(118_118_128/0.05)] active:bg-[rgb(118_118_128/0.14)] active:duration-0'

/** Buttons and tiles give a little under the finger */
export const PRESS = 'transition-transform duration-200 active:scale-[0.97]'

/** Opening content (an expanded row, a revealed form) slides down into place */
export const REVEAL = 'animate-in fade-in-0 slide-in-from-top-1 duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'

/**
 * Dialog as an iOS sheet: rises from the bottom edge on phones, springs up from
 * slightly smaller on larger screens. Add to a shadcn DialogContent.
 */
export const SHEET = [
  'gap-0 border-0 bg-[#f2f2f7] p-0 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45)] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-[22px] data-open:zoom-in-90',
  'max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:pb-[env(safe-area-inset-bottom)]',
  'max-sm:data-open:zoom-in-100 max-sm:data-open:slide-in-from-bottom max-sm:data-closed:zoom-out-100 max-sm:data-closed:slide-out-to-bottom',
].join(' ')

/** Glass dropdown for shadcn Select and Popover content */
export const MENU = 'rounded-[14px] border-0 bg-white/80 backdrop-blur-2xl backdrop-saturate-[1.8] shadow-[0_18px_50px_-12px_rgb(15_42_79/0.35)] ring-black/[0.06] duration-200'

/** Primary pill button with a soft blue glow (add to a shadcn Button) */
export const PILL = 'h-11 rounded-full px-5 text-[15px] font-semibold shadow-[0_4px_14px_-4px_rgb(31_111_209/0.55)] transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.97]'

/** iOS-style text field: soft grey fill, no border, white with a blue ring when focused */
export const FIELD =
  'h-11 rounded-xl border-0 bg-[rgb(118_118_128/0.08)] px-3.5 text-[15px] shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/35 aria-invalid:ring-2 aria-invalid:ring-destructive/40'

/** Large title page header, with an optional caption above and trailing content on the right */
export function LargeTitle({ eyebrow, title, subtitle, children }: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="min-w-0 flex-1 basis-64">
        {eyebrow && <p className="text-[13px] font-semibold text-primary">{eyebrow}</p>}
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em] sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

/** Small grey caps above a group, like iOS Settings */
export function GroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-[12px] font-medium tracking-[0.04em] text-muted-foreground uppercase', className)}>{children}</h2>
}

/** An inset grouped section: caps label (with an optional action on the right), white rounded body, grey footnote */
export function Group({ title, action, footer, className, bodyClassName, children }: {
  title?: React.ReactNode
  action?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <section className={className}>
      {(title || action) && (
        <div className="mb-1.5 flex min-h-6 items-end justify-between gap-3 px-4">
          {title && <GroupLabel>{title}</GroupLabel>}
          {action}
        </div>
      )}
      <div className={cn('overflow-hidden', SURFACE, bodyClassName)}>{children}</div>
      {footer && <p className="mt-1.5 px-4 text-xs leading-relaxed text-muted-foreground">{footer}</p>}
    </section>
  )
}

/** A row in a group; the separator starts where the text does */
export function GroupRow({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('ml-4 border-t py-2.5 pr-4 first:border-t-0', HAIRLINE, className)}>{children}</div>
}

/** Blue text button, the iOS way of saying "Edit" or "Change" */
export function TextButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn('text-[15px] font-medium text-primary transition-[opacity,transform] duration-200 hover:opacity-70 active:scale-[0.96] active:opacity-50 disabled:opacity-40', className)}
      {...props}
    />
  )
}

/** Segmented control: grey track, white thumb that slides to the chosen option */
export function Segmented<T extends string | number>({ label, options, value, onChange }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  const index = Math.max(0, options.findIndex(o => o.value === value))
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative grid rounded-[10px] bg-[rgb(118_118_128/0.12)] p-0.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 rounded-[8px] bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] transition-transform duration-300 ease-[cubic-bezier(.3,.7,.2,1)]"
        style={{ width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className="relative z-10 h-7 rounded-[8px] text-[13px] font-medium text-foreground/65 transition-[color,transform] duration-200 active:scale-[0.95] hover:text-foreground aria-checked:font-semibold aria-checked:text-foreground"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
