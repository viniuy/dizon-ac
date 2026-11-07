'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  RiChat3Line, RiFacebookCircleFill, RiLoader4Line, RiPhoneLine, RiUserHeartLine, type RemixiconComponentType,
} from '@remixicon/react'
import { createTicket, lookupCustomer, type CreateState, type CustomerMatch } from '@/app/actions/tickets'
import { SERVICE_OPTIONS } from '@/components/landing/landing.data'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayPH } from '@/lib/calendar'
import { MANUAL_SOURCES, SOURCE_LABEL, type TicketSource } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { FIELD, Group, MENU, PILL, REVEAL, STAGGER, TextButton } from '../../ios'

const SOURCE_ICON: Partial<Record<TicketSource, RemixiconComponentType>> = {
  facebook: RiFacebookCircleFill,
  call: RiPhoneLine,
  chat: RiChat3Line,
}

export function NewTicketForm() {
  const [source, setSource] = useState<TicketSource>('facebook')
  const [state, action, pending] = useActionState<CreateState, FormData>(createTicket, {})
  const err = (f: keyof NonNullable<CreateState['fieldErrors']>) => state.fieldErrors?.[f]

  // Returning-customer lookup as soon as a full number is entered
  const [match, setMatch] = useState<CustomerMatch>(null)
  const [looking, startLookup] = useTransition()
  const checkedFor = useRef('')
  const nameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLTextAreaElement>(null)
  const checkPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(-10)
    if (digits.length < 10) return setMatch(null)
    if (digits === checkedFor.current) return
    checkedFor.current = digits
    startLookup(async () => setMatch(await lookupCustomer(value)))
  }
  const applyMatch = () => {
    if (!match) return
    if (nameRef.current) nameRef.current.value = match.name
    if (addressRef.current) addressRef.current.value = match.address
  }

  return (
    <form action={action} className={cn('space-y-6', STAGGER)}>
      <input type="hidden" name="source" value={source} />

      <Group title="Came in from" bodyClassName="space-y-4 p-4">
        <div role="radiogroup" aria-label="Where the booking came from" className="grid grid-cols-3 gap-2">
          {MANUAL_SOURCES.map(s => {
            const Icon = SOURCE_ICON[s]!
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={source === s}
                onClick={() => setSource(s)}
                className="flex h-[68px] flex-col items-center justify-center gap-1 rounded-xl bg-[rgb(118_118_128/0.08)] text-[13px] font-medium text-foreground/75 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground active:scale-[0.95] aria-checked:bg-primary aria-checked:text-white aria-checked:shadow-[0_4px_14px_-4px_rgb(31_111_209/0.55)]"
              >
                <Icon className="size-[22px]" aria-hidden />
                {SOURCE_LABEL[s]}
              </button>
            )
          })}
        </div>
        {source === 'facebook' && (
          <div className={REVEAL}><Field id="link" label="Messenger or profile link" hint="Optional. Lets anyone open the conversation in one tap." error={err('link')}>
            <Input id="link" name="link" type="url" inputMode="url" placeholder="https://m.me/…" aria-invalid={!!err('link')} className={FIELD} />
          </Field></div>
        )}
      </Group>

      <Group title="Customer" bodyClassName="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Name" error={err('name')}>
            <Input ref={nameRef} id="name" name="name" autoComplete="off" placeholder="Juan dela Cruz" aria-invalid={!!err('name')} className={FIELD} />
          </Field>
          <Field id="phone" label="Mobile number" error={err('phone')}>
            <PhoneInput
              id="phone"
              name="phone"
              autoComplete="off"
              aria-invalid={!!err('phone')}
              className={FIELD}
              onChange={e => checkPhone(e.target.value)}
              onBlur={e => checkPhone(e.target.value)}
            />
          </Field>
        </div>

        {looking && (
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <RiLoader4Line className="size-4 animate-spin" aria-hidden /> Checking past bookings…
          </p>
        )}
        {match && !looking && (
          <div role="status" className={cn('flex flex-wrap items-center gap-3 rounded-xl bg-violet-50 p-3.5', REVEAL)}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-500 text-white">
              <RiUserHeartLine className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-[13px]">
              <p className="text-[15px] font-semibold text-violet-950">Returning customer: {match.name}</p>
              <p className="text-violet-950/75">
                {match.count} earlier booking{match.count === 1 ? '' : 's'}, last for {match.lastService} at {match.address}.{' '}
                <Link href={`/staff/tickets/${match.lastTicketId}`} target="_blank" className="font-medium text-primary hover:opacity-70">
                  View last ticket
                </Link>
              </p>
            </div>
            <TextButton onClick={applyMatch}>Use these details</TextButton>
          </div>
        )}

        <Field id="address" label="Service address" error={err('address')}>
          <Textarea
            ref={addressRef}
            id="address"
            name="address"
            rows={2}
            placeholder="House no., street, barangay, city"
            aria-invalid={!!err('address')}
            className={cn(FIELD, 'h-auto min-h-[4.5rem] py-2.5')}
          />
        </Field>
      </Group>

      <Group title="Job" bodyClassName="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="service" label="Service" error={err('service')}>
            <Select name="service">
              <SelectTrigger id="service" className={cn(FIELD, 'w-full data-[size=default]:h-11')} aria-invalid={!!err('service')}>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent className={MENU}>
                {SERVICE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field id="date" label="Preferred date" hint="Optional" error={err('date')}>
            <DatePicker id="date" name="date" min={todayPH()} clearable placeholder="No preference" aria-invalid={!!err('date') || undefined} className={FIELD} contentClassName={MENU} />
          </Field>
        </div>
        <Field id="message" label="Concern" hint="Optional" error={err('message')}>
          <Textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Brand, type, HP, and what's wrong with it"
            className={cn(FIELD, 'h-auto min-h-24 py-2.5')}
          />
        </Field>
      </Group>

      {state.error && <p role="alert" className="px-4 text-[13px] text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className={cn(PILL, 'w-full sm:w-auto sm:px-8')}>
          {pending && <RiLoader4Line className="animate-spin" aria-hidden />}
          Create ticket
        </Button>
      </div>
    </form>
  )
}

function Field({ id, label, hint, error, children }: {
  id: string; label: string; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-medium text-muted-foreground">
        {label} {hint && <span className="font-normal text-muted-foreground/75">· {hint}</span>}
      </Label>
      {children}
      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </div>
  )
}
