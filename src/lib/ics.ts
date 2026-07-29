import type { DateEvent } from './types'
import { normalizeUrl } from './linkPreview'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format as UTC ICS timestamp: 20260731T180000Z */
export function toIcsUtc(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    const now = new Date()
    return (
      `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
      `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
    )
  }
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function foldLine(line: string): string {
  const bytes = line
  if (bytes.length <= 75) return bytes
  const parts: string[] = []
  let remaining = bytes
  parts.push(remaining.slice(0, 75))
  remaining = remaining.slice(75)
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`)
    remaining = remaining.slice(74)
  }
  return parts.join('\r\n')
}

function sanitizeUid(id: string): string {
  const cleaned = id.replace(/[^A-Za-z0-9-]/g, '')
  return cleaned || `dateday-${Date.now()}`
}

function eventToVevent(event: DateEvent): string {
  const startMs = new Date(event.date).getTime()
  const startIso = Number.isNaN(startMs) ? new Date().toISOString() : new Date(startMs).toISOString()
  const endIso = new Date(new Date(startIso).getTime() + 2 * 60 * 60 * 1000).toISOString()
  const stamp = toIcsUtc(event.updatedAt || event.createdAt || new Date().toISOString())
  const start = toIcsUtc(startIso)
  const end = toIcsUtc(endIso)
  const absoluteLink = event.link?.trim() ? normalizeUrl(event.link) : null
  const descParts = [event.notes?.trim(), absoluteLink || undefined].filter(Boolean) as string[]

  const lines = [
    'BEGIN:VEVENT',
    `UID:${sanitizeUid(event.id)}@dateday.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText((event.title || 'Rande').slice(0, 200))}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
  ]
  if (event.location?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(event.location.trim().slice(0, 200))}`)
  }
  if (descParts.length) {
    lines.push(`DESCRIPTION:${escapeIcsText(descParts.join('\n').slice(0, 1000))}`)
  }
  if (absoluteLink) {
    lines.push(`URL:${absoluteLink}`)
  }
  lines.push('END:VEVENT')
  return lines.map(foldLine).join('\r\n')
}

/** Build a VCALENDAR string for Apple Calendar / any ICS client. */
export function buildCalendarIcs(events: DateEvent[], calendarName = 'DateDay'): string {
  const sorted = [...events]
    .filter((e) => e.title?.trim() || e.date)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  const vevents = sorted.map(eventToVevent).join('\r\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DateDay//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ]
  if (vevents) lines.push(vevents)
  lines.push('END:VCALENDAR')
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

/** Trigger a local .ics file download / open (works on iPhone Safari). */
export function downloadCalendarIcs(events: DateEvent[], filename = 'DateDay.ics') {
  if (events.length === 0) return
  const ics = buildCalendarIcs(events)
  // data: URL is more reliable on iOS than blob: for Calendar import
  const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`

  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Open a single event in Apple Calendar (one-shot add). */
export function openEventInAppleCalendar(event: DateEvent) {
  const safe = (event.title || 'rande').replace(/[^\w\-]+/g, '_').slice(0, 40)
  downloadCalendarIcs([event], `DateDay-${safe}.ics`)
}

/** Convert https URL to webcal:// for Apple Calendar subscribe. */
export function toWebcalUrl(httpsUrl: string): string {
  return httpsUrl.replace(/^https:/i, 'webcal:')
}
