import { format, parseISO } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { DateInvitation } from './types'

export function combineDateAndTime(dateYmd: string, timeHm: string): string {
  const [h, m] = timeHm.split(':').map(Number)
  const d = parseISO(`${dateYmd}T00:00:00`)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export function formatInviteDate(dateYmd: string): string {
  return format(parseISO(`${dateYmd}T12:00:00`), 'EEEE d. MMMM yyyy', { locale: cs })
}

export function invitationToEventTitle(inv: Pick<DateInvitation, 'plan' | 'food'>): string {
  return `${inv.plan} · ${inv.food}`
}

export function invitationToEventNotes(inv: DateInvitation): string {
  return `Pozvánka přijata — ${inv.plan}, jídlo: ${inv.food}`
}
