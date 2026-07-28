import { useState } from 'react'
import { useCouple } from '../context/CoupleContext'
import { IDEA_CATEGORIES, IDEA_STATUSES, type Idea } from '../lib/types'
import { LinkPreview } from './LinkPreview'
import { normalizeUrl } from '../lib/linkPreview'
import { newIdeaDraft } from '../lib/coupleApi'

export function IdeaForm({
  initial,
  onDone,
}: {
  initial: Idea
  onDone: () => void
}) {
  const { saveIdea } = useCouple()
  const [form, setForm] = useState(() => newIdeaDraft(initial))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    try {
      await saveIdea(form)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uložení selhalo.')
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
