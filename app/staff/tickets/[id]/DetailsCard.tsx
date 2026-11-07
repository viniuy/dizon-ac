'use client'

import { useActionState, useState } from 'react'
import { RiCheckLine, RiLoader4Line, RiMapPin2Line } from '@remixicon/react'
import { saveDetails, type DetailsState } from '@/app/actions/tickets'
import { SERVICE_OPTIONS } from '@/components/landing/landing.data'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { dayLabel } from '@/lib/calendar'
import type { BookingField } from '@/lib/booking'
import type { Ticket } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { Group, GroupRow, HAIRLINE, MENU, REVEAL, TextButton } from '../../ios'

type Details = Pick<
  Ticket,
  'id' | 'contact_name' | 'contact_number' | 'address' | 'map_url' | 'service_type' | 'unit_details' | 'problem_description' | 'preferred_date'
>

/** Customer details, with an Edit mode for staff to correct them */
export function DetailsCard({ ticket: t }: { ticket: Details }) {
  const [editing, setEditing] = useState(false)
  const [state, action, pending] = useActionState(async (prev: DetailsState, formData: FormData) => {
    const result = await saveDetails(t.id, prev, formData)
    if (result.ok) setEditing(false)
    return result
  }, {})

  const tel = `tel:${t.contact_number.replace(/[\s\-()]/g, '')}`
  const err = (f: BookingField) => state.fieldErrors?.[f]
  // Keep a non-standard service (e.g. from an old chat ticket) selectable
  const services = SERVICE_OPTIONS.includes(t.service_type) ? SERVICE_OPTIONS : [t.service_type, ...SERVICE_OPTIONS]

  return (
    <Group title="Customer" action={!editing && <TextButton onClick={() => setEditing(true)}>Edit</TextButton>}>

      {editing ? (
        <form action={action} className={cn('space-y-4 p-4', REVEAL)}>
          <Field id="name" label="Name" error={err('name')}>
            <Input id="name" name="name" defaultValue={t.contact_name} autoComplete="off" aria-invalid={!!err('name')} />
          </Field>
          <Field id="phone" label="Phone" error={err('phone')}>
            <PhoneInput id="phone" name="phone" defaultValue={t.contact_number} autoComplete="off" aria-invalid={!!err('phone')} />
          </Field>
          <Field id="address" label="Address" error={err('address')}>
            <Textarea id="address" name="address" rows={2} defaultValue={t.address} aria-invalid={!!err('address')} />
          </Field>
          <Field id="service" label="Service" error={err('service')}>
            <Select name="service" defaultValue={t.service_type}>
              <SelectTrigger id="service" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent className={MENU}>
                {services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field id="date" label="Preferred date" error={err('date')}>
            <DatePicker
              id="date"
              name="date"
              defaultValue={t.preferred_date ?? ''}
              clearable
              placeholder="No preference"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              contentClassName={MENU}
            />
          </Field>
          <Field id="message" label="Concern" error={err('message')}>
            <Textarea id="message" name="message" rows={3} defaultValue={t.unit_details ?? ''} placeholder="Brand, type, HP, and what's wrong with it" />
          </Field>

          {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" className="rounded-full text-primary hover:bg-primary/10 hover:text-primary" disabled={pending} onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" className="rounded-full px-4 font-semibold" disabled={pending}>
              {pending ? <RiLoader4Line className="animate-spin" aria-hidden /> : <RiCheckLine />} Save changes
            </Button>
          </div>
        </form>
      ) : (
        <>
          {/* The name is in the page header, so the sidebar starts with how to reach them */}
          <dl className="text-[15px]">
            <Row label="Phone">
              <a href={tel} className="text-primary tabular-nums">{t.contact_number}</a>
            </Row>
            <Row label="Address">
              {t.address}
              <a
                href={t.map_url ?? `https://maps.google.com/?q=${encodeURIComponent(t.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 flex w-fit items-center gap-1 text-[13px] text-primary"
              >
                <RiMapPin2Line className="size-3.5" aria-hidden /> Directions
              </a>
            </Row>
            <Row label="Concern">
              <span>{t.service_type}</span>
              {(t.unit_details || t.problem_description) && (
                <span className="mt-1 block text-[13px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {[t.unit_details, t.problem_description].filter(Boolean).join('\n\n')}
                </span>
              )}
            </Row>
            {t.preferred_date && <Row label="Preferred date">{dayLabel(t.preferred_date)}</Row>}
          </dl>
          {state.ok && <p role="status" className={cn('border-t px-4 py-2.5 text-[13px] text-emerald-700', HAIRLINE)}>{state.ok}</p>}
        </>
      )}
    </Group>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <GroupRow>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </GroupRow>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
