import { SERVICE_OPTIONS } from '@/components/landing/landing.data'

export type BookingField = 'name' | 'phone' | 'address' | 'service' | 'date' | 'message'
export type BookingForm = Record<BookingField, string>
export type BookingErrors = Partial<Record<BookingField, string>>

export const EMPTY_BOOKING: BookingForm = { name: '', phone: '', address: '', service: '', date: '', message: '' }

// PH mobile (09xx / +639xx) or landline — digits only after stripping spaces, dashes, parens
const PHONE_RE = /^(\+?63|0)\d{9,10}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Shared by the form (instant feedback) and the server action (the real check) */
export function validateBooking(form: BookingForm) {
  const errors: BookingErrors = {}
  if (!form.name.trim())    errors.name    = 'Please enter your name.'
  if (!PHONE_RE.test(form.phone.replace(/[\s\-()]/g, '')))
                            errors.phone   = 'Please enter a valid PH number, e.g. 0917 123 4567.'
  if (!form.address.trim()) errors.address = 'Please enter the service address.'
  if (!SERVICE_OPTIONS.includes(form.service))
                            errors.service = 'Please choose a service.'
  if (form.date && !DATE_RE.test(form.date))
                            errors.date    = 'Please pick a valid date.'
  if (form.name.length > 120 || form.address.length > 300 || form.message.length > 2000)
                            errors.message = 'That’s a bit long — please shorten your details.'
  return errors
}
