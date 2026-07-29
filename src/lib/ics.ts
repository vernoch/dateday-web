import type { DateEvent } from './types'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format as UTC ICS timestamp: 20260731T180000Z */
export function toIcsUtc(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return toIcsUtc(new Date().toISOString())
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
  if (line.length <= 75) return line
  const parts: string[] = []
  let remaining = line
  parts.push(remaining.slice(0, 75))
  remaining = remaining.slice(75)
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`)
    remaining = remaining.slice(74)
  }
  return parts.join('\r\n')
}

function eventToVevent(event: DateEvent): string {
  const start = toIcsUtc(event.date)
  const endDate = new Date(event.date)
  if (!Number.isNaN(endDate.getTime())) endDate.setHours(endDate.getHours() + 2)
  const end = toIcsUtc(endDate.toISOString())
  const stamp = toIcsUtc(event.updatedAt || event.createdAt || new Date().toISOString())
  const descParts = [event.notes?.trim(), event.link?.trim()].filter(Boolean)
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.id}@dateday`,
    `DTSTAMP:${stamp}`,
    `LAST-MODIFIED:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title || 'Rande')}`,
  ]
  if (event.location?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(event.location.trim())}`)
  }
  if (descParts.length) {
    lines.push(`DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`)
  }
  if (event.link?.trim()) {
    lines.push(`URL:${event.link.trim()}`)
  }
  if (event.isCompleted) {
    lines.push('STATUS:COMPLETED')
  }
  lines.push('END:VEVENT')
  return lines.map(foldLine).join('\r\n')
}

/** Build a VCALENDAR string for Apple Calendar / any ICS client. */
export function buildCalendarIcs(events: DateEvent[], calendarName = 'DateDay'): string {
  const sorted = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date))
  const body = sorted.map(eventToVevent).join('\r\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DateDay//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `NAME:${escapeIcsText(calendarName)}`,
    body,
    'END:VCALENDAR',
  ]
  return `${lines.filter(Boolean).join('\r\n')}\r\n`
}

/** Trigger a local .ics file download / open (works on iPhone Safari). */
export function downloadCalendarIcs(events: DateEvent[], filename = 'DateDay.ics') {
  const ics = buildCalendarIcs(events)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  // Prefer opening the calendar file (iOS Safari → Calendar). Fallback = download.
  const opened = window.open(url, '_blank')
  if (!opened) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Convert https URL to webcal:// for Apple Calendar subscribe. */
export function toWebcalUrl(httpsUrl: string): string {
  return httpsUrl.replace(/^https:/i, 'webcal:')
}
