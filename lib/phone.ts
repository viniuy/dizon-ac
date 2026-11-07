import type { ChangeEvent } from 'react'

/**
 * Digits only, grouped the way PH numbers are read out:
 * mobile 0917 123 4567, Metro Manila landline 02 8280 2293.
 * A pasted +63 number becomes the local 09… form.
 */
export function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('63') && d.length > 2) d = `0${d.slice(2)}`
  const parts = d.startsWith('02')
    ? [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10)]
    : [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)]
  return parts.filter(Boolean).join(' ')
}

/** onChange helper: reformats the field in place and keeps the caret next to the same digit */
export function handlePhoneInput(e: ChangeEvent<HTMLInputElement>) {
  const el = e.target
  const raw = el.value
  const formatted = formatPhone(raw)
  if (formatted === raw) return

  let digitsBefore = raw.slice(0, el.selectionStart ?? raw.length).replace(/\D/g, '').length
  if (raw.replace(/\D/g, '').startsWith('63') && formatted.startsWith('0')) digitsBefore = Math.max(0, digitsBefore - 1)
  let caret = 0
  for (let seen = 0; caret < formatted.length && seen < digitsBefore; caret++) {
    if (/\d/.test(formatted[caret])) seen++
  }

  el.value = formatted
  el.setSelectionRange(caret, caret)
}

/** Shared attributes: number pad on phones, digits only */
export const PHONE_INPUT_PROPS = {
  type: 'tel',
  inputMode: 'numeric',
  autoComplete: 'tel-national',
  placeholder: '0917 123 4567',
} as const
