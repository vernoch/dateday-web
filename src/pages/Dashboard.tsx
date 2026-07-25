import { useMemo, useState } from 'react'
import { format, isAfter, startOfDay } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { useCouple } from '../context/CoupleContext'
import { Modal } from '../components/Modal'
import { EventForm } from '../components/EventForm'
import { newEventDraft } from '../lib/coupleApi'
import { CATEGORY_EMOJI, IDEA_CATEGORIES } from '../lib/types'

export function Dashboard() {
  const { events, ideas, code } = useCouple()
  const [showAdd, setShowAdd] = useState(false)

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date())
    return [...events]
      .filter((e) => !e.isCompleted && (isAfter(new Date(e.date), today) || startOfDay(new Date(e.date)).getTime() === today.getTime()))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
  }, [events])

  const next = upcoming[0]
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Ahoj' : 'Dobrý večer'

  return (
    <div className="px-5 pt-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-love">{greet}</p>
          <h1 className="text-3xl font-bold tracking-tight">DateDay</h1>
          <p className="mt-1 text-sm text-muted">
            {code ? `Pár · ${code}` : 'Propojte se v Nastavení'}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-love to-love-dark text-white shadow-lg shadow-love/30"
          aria-label="Přidat rande"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Příští rande
      </p>
      {next ? (
        <div className="card relative mb-6 overflow-hidden">
          {next.imageUrl ? (
            <img src={next.imageUrl} alt="" className="h-48 w-full object-cover" />
          ) : (
            <div className="flex h-48 items-end bg-gradient-to-br from-love to-love-dark p-5">
              <span className="text-5xl">💜</span>
            </div>
          )}
          <div className="space-y-1 p-5">
            <h2 className="text-xl font-semibold">{next.title}</h2>
            <p className="text-sm text-muted">
              {format(new Date(next.date), "EEEE d. MMMM · HH:mm", { locale: cs })}
            </p>
            {next.location && <p className="text-sm text-love">{next.location}</p>}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="card mb-6 flex w-full flex-col items-start gap-2 p-6 text-left"
        >
          <span className="text-3xl">✨</span>
          <span className="font-semibold">Zatím žádné rande</span>
          <span className="text-sm text-muted">Klepni a naplánujte něco hezkého</span>
        </button>
      )}

      {upcoming.length > 1 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Nadcházející
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {upcoming.slice(1, 9).map((e) => (
              <div key={e.id} className="card min-w-[160px] shrink-0 p-4">
                <p className="line-clamp-2 font-semibold">{e.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {format(new Date(e.date), 'd. M. HH:mm')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Kategorie nápadů
      </p>
      <div className="grid grid-cols-2 gap-3">
        {IDEA_CATEGORIES.map((cat) => {
          const count = ideas.filter((i) => i.category === cat).length
          return (
            <div key={cat} className="card p-4">
              <div className="text-2xl">{CATEGORY_EMOJI[cat]}</div>
              <p className="mt-2 font-semibold">{cat}</p>
              <p className="text-xs text-muted">{count} nápadů</p>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <Modal title="Nové rande" onClose={() => setShowAdd(false)}>
          <EventForm initial={newEventDraft()} onDone={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  )
}
