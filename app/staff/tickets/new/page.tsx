import Link from 'next/link'
import { RiArrowLeftSLine } from '@remixicon/react'
import { LargeTitle, STAGGER } from '../../ios'
import { NewTicketForm } from './NewTicketForm'

export default function NewTicketPage() {
  return (
    <div className={`mx-auto max-w-2xl ${STAGGER}`}>
      <Link href="/staff/tickets" prefetch className="inline-flex items-center gap-0.5 text-[15px] text-primary transition-opacity hover:opacity-70">
        <RiArrowLeftSLine className="-ml-1 size-5" aria-hidden /> Tickets
      </Link>
      <div className="mt-2">
        <LargeTitle
          title="New ticket"
          subtitle="For bookings that came in on Facebook, over the phone or by chat. You can schedule it right after."
        />
      </div>
      <div className="mt-6">
        <NewTicketForm />
      </div>
    </div>
  )
}
