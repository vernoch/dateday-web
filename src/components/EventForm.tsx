import { useState } from 'react'
import { format } from 'date-fns'
import type { DateEvent } from '../lib/types'
import { useCouple } from '../context/CoupleContext'
import { LinkPreview } from './LinkPreview'
import { normalizeUrl } from '../lib/linkPreview'
import { newEventDraft } from '../lib/coupleApi'

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
}: {
  initial: DateEvent
  onDone: () => void
}) {
  const { saveEvent } = useCouple()
  const [form, setForm] = useState(() => newEventDraft(initial))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Zadej název rande.')
      return
    }
    if ((form.link ?? '').trim() && !normalizeUrl(form.link)) {
      setError('Odkaz není platná URL.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await saveEvent(form)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uložení selhalo.')
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
        onChange={(e) => setForm({ ...form, link: e.target.value })}
      />
      {(form.link ?? '').trim() && <LinkPreview url={form.link} />}
      <textarea
        className="field min-h-24"
        placeholder="Poznámka"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn-primary w-full" type="submit">
        {busy ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
