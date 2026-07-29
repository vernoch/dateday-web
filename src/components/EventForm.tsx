import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import type { DateEvent } from '../lib/types'
import { useCouple } from '../context/CoupleContext'
import { LinkPreview } from './LinkPreview'
import { fetchLinkPreview, normalizeUrl } from '../lib/linkPreview'
import { newEventDraft } from '../lib/coupleApi'
import { getAutoAppleCalendar } from '../lib/appleCalendarPrefs'
import { openEventInAppleCalendar } from '../lib/ics'

function toLocalInputValue(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return format(new Date(), "yyyy-MM-dd'T'HH:mm")
  }
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function EventForm({
  initial,
  onDone,
  allowDelete = false,
}: {
  initial: DateEvent
  onDone: () => void
  allowDelete?: boolean
}) {
  const { events, saveEvent, deleteEvent } = useCouple()
  const isNew = useMemo(() => !events.some((e) => e.id === initial.id), [events, initial.id])
  const [form, setForm] = useState(() => newEventDraft(initial))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Zadej název rande.')
      return
    }
    const link = (form.link ?? '').trim()
    if (link && !normalizeUrl(link)) {
      setError('Odkaz není platná URL.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      let previewImageUrl = form.previewImageUrl
      if (!link) {
        previewImageUrl = undefined
      } else if (!previewImageUrl || form.link !== initial.link) {
        const preview = await fetchLinkPreview(link)
        previewImageUrl = preview?.imageUrl
      }
      const toSave = { ...form, link, previewImageUrl }
      await saveEvent(toSave)
      if (isNew && getAutoAppleCalendar()) {
        openEventInAppleCalendar(toSave)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uložení selhalo.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!confirm('Smazat toto rande?')) return
    setBusy(true)
    setError(null)
    try {
      await deleteEvent(form.id)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Smazání selhalo.')
    } finally {
      setBusy(false)
    }
  }

  const localValue = toLocalInputValue(form.date)

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="field"
        placeholder="Název rande"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        type="datetime-local"
        className="field"
        value={localValue}
        onChange={(e) =>
          setForm({ ...form, date: new Date(e.target.value).toISOString() })
        }
      />
      <input
        className="field"
        placeholder="Místo (volitelně)"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <input
        className="field"
        placeholder="Odkaz (volitelně)"
        value={form.link ?? ''}
        onChange={(e) =>
          setForm({ ...form, link: e.target.value, previewImageUrl: undefined })
        }
      />
      {(form.link ?? '').trim() && <LinkPreview url={form.link} variant="media" />}
      <textarea
        className="field min-h-24"
        placeholder="Poznámka"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      {isNew && getAutoAppleCalendar() && (
        <p className="text-[13px] text-muted">
          Po uložení se rande nabídne do Apple Kalendáře.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn-primary w-full" type="submit">
        {busy ? 'Ukládám…' : 'Uložit'}
      </button>
      {allowDelete && (
        <button
          disabled={busy}
          type="button"
          onClick={onDelete}
          className="btn-secondary w-full text-red-600"
        >
          Smazat rande
        </button>
      )}
    </form>
  )
}
