import { cn } from '@/lib/utils'

interface SectionTitleProps {
  id: string
  children: React.ReactNode
  /** Brand-blue headings are used for the "feature" sections, black for the rest */
  tone?: 'bright' | 'black'
  align?: 'center' | 'left'
  className?: string
}

export function SectionTitle({ id, children, tone = 'black', align = 'center', className }: SectionTitleProps) {
  return (
    <h2
      id={id}
      data-split
      className={cn(
        'text-[2rem] leading-tight font-semibold sm:text-[2.5rem]',
        tone === 'bright' ? 'text-dac-bright' : 'text-black',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </h2>
  )
}
