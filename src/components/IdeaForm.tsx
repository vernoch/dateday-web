import { useState } from 'react'
import { format } from 'date-fns'
import { useCouple } from '../context/CoupleContext'
import { IDEA_CATEGORIES, IDEA_STATUSES, type Idea } from '../lib/types'
import { LinkPreview } from './LinkPreview'
import { fetchLinkPreview, normalizeUrl } from '../lib/linkPreview'
import { newEventDraft, newIdeaDraft } from '../lib/coupleApi'
import { getAutoAppleCalendar } from '../lib/appleCalendarPrefs'
import { openEventInAppleCalendar } from '../lib/ics'

export function IdeaForm({
  initial,
  onDone,
}: {
  initial: Idea
  onDone: () => void
}) {
  const { ideas, saveIdea, saveEvent, deleteIdea } = useCouple()
  const [form, setForm] = useState(() => newIdeaDraft(initial))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scheduling, setScheduling] = useState(false)
  const [dateValue, setDateValue] = useState(() =>
    format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Zadej název nápadu.')
      return
    }
    if ((form.link ?? '').trim() && !normalizeUrl(form.link)) {
      setError('Odkaz není platná URL.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await saveIdea(form)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uložení selhalo.')
    } finally {
      setBusy(false)
    }
  }

  async function onAddDate() {
    if (!form.title.trim()) {
      setError('Zadej název nápadu.')
      return
    }
    const link = (form.link ?? '').trim()
    if (link && !normalizeUrl(link)) {
      setError('Odkaz není platná URL.')
      return
    }
    const when = new Date(dateValue)
    if (Number.isNaN(when.getTime())) {
      setError('Vyber platný termín.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      let previewImageUrl: string | undefined
      if (link) {
        const preview = await fetchLinkPreview(link)
        previewImageUrl = preview?.imageUrl
      }

      const event = newEventDraft({
        title: form.title.trim(),
        date: when.toISOString(),
        notes: form.notes ?? '',
        link,
        previewImageUrl,
        location: '',
      })
      await saveEvent(event)

      if (ideas.some((i) => i.id === form.id)) {
        await deleteIdea(form.id)
      }

      if (getAutoAppleCalendar()) {
        openEventInAppleCalendar(event)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Přesun do rande selhal.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="field"
        placeholder="Název"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <select
        className="field"
        value={form.category}
        onChange={(e) =>
          setForm({ ...form, category: e.target.value as Idea['category'] })
        }
      >
        {IDEA_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className="field"
        value={form.status}
        onChange={(e) =>
          setForm({ ...form, status: e.target.value as Idea['status'] })
        }
      >
        {IDEA_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        className="field"
        placeholder="Odkaz (volitelně)"
        value={form.link ?? ''}
        onChange={(e) => setForm({ ...form, link: e.target.value })}
      />
      {(form.link ?? '').trim() && <LinkPreview url={form.link} variant="media" />}
      <textarea
        className="field min-h-24"
        placeholder="Poznámka"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn-primary w-full" type="submit">
        {busy && !scheduling ? 'Ukládám…' : 'Uložit'}
      </button>

      {!scheduling ? (
        <button
          type="button"
          disabled={busy}
          className="btn-secondary w-full"
          onClick={() => {
            setScheduling(true)
            setError(null)
          }}
        >
          Add date
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl bg-chip p-3">
          <p className="text-[14px] font-medium">Vyber termín rande</p>
          <input
            type="datetime-local"
            className="field"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
          />
          <button
            type="button"
            disabled={busy}
            className="btn-primary w-full"
            onClick={onAddDate}
          >
            {busy ? 'Přesouvám…' : 'Přesunout do rande'}
          </button>
          <button
            type="button"
            disabled={busy}
            className="btn-secondary w-full"
            onClick={() => setScheduling(false)}
          >
            Zrušit
          </button>
        </div>
      )}
    </form>
  )
}
