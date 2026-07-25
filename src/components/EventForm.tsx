import { useState } from 'react'
import { format } from 'date-fns'
import type { DateEvent } from '../lib/types'
import { useCouple } from '../context/CoupleContext'

export function EventForm({
  initial,
  onDone,
}: {
  initial: DateEvent
  onDone: () => void
}) {
  const { saveEvent, uploadImage } = useCouple()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Zadej název rande.')
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

  async function onFile(file?: File | null) {
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadImage(file)
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fotky selhal.')
    } finally {
      setBusy(false)
    }
  }

  const localValue = format(new Date(form.date), "yyyy-MM-dd'T'HH:mm")

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
      <textarea
        className="field min-h-24"
        placeholder="Poznámka"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-love-soft/40 px-4 py-3 text-sm">
        <span>{form.imageUrl ? 'Změnit fotku' : 'Přidat fotku'}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>
      {form.imageUrl && (
        <img src={form.imageUrl} alt="" className="h-36 w-full rounded-2xl object-cover" />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn-primary w-full" type="submit">
        {busy ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
