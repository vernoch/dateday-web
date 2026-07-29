import { useMemo, useState } from 'react'
import { format, isAfter, startOfDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { CalendarDays, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCouple } from '../context/CoupleContext'
import { Modal } from '../components/Modal'
import { EventForm } from '../components/EventForm'
import { newEventDraft } from '../lib/coupleApi'
import { IDEA_CATEGORIES } from '../lib/types'
import { CATEGORY_STYLE, napaduLabel } from '../lib/categoryStyles'

export function Dashboard() {
  const navigate = useNavigate()
  const { events, ideas } = useCouple()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date())
    return [...events]
      .filter(
        (e) =>
          !e.isCompleted &&
          (isAfter(new Date(e.date), today) ||
            startOfDay(new Date(e.date)).getTime() === today.getTime()),
      )
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
  }, [events])

  const next = upcoming[0]
  const editEvent = events.find((e) => e.id === editId)
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Ahoj' : 'Dobrý večer'

  return (
    <div className="px-5 pt-6">
      <div className="mb-7 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] text-muted">{greet}</p>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight">DateDay</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-love-soft text-love"
          aria-label="Přidat rande"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      <h2 className="mb-3 text-[22px] font-bold tracking-tight">Příští rande</h2>
      {next ? (
        <button
          type="button"
          onClick={() => setEditId(next.id)}
          className="hero-gradient relative mb-8 flex h-52 w-full flex-col justify-end overflow-hidden rounded-[1.75rem] p-5 text-left shadow-lg shadow-indigo-900/20"
        >
          {next.imageUrl && (
            <img
              src={next.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative z-10">
            <h3 className="text-[28px] font-bold leading-tight text-white">{next.title}</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-white/90">
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
              {format(new Date(next.date), 'd MMMM yyyy', { locale: enUS })}
            </p>
          </div>
        </button>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="hero-gradient mb-8 flex h-52 w-full flex-col items-start justify-end rounded-[1.75rem] p-5 text-left shadow-lg shadow-indigo-900/20"
        >
          <span className="text-[22px] font-bold text-white">Zatím žádné rande</span>
          <span className="mt-1 text-[15px] text-white/80">Klepni a naplánujte něco hezkého</span>
        </button>
      )}

      <h2 className="mb-3 text-[22px] font-bold tracking-tight">Kategorie nápadů</h2>
      <div className="grid grid-cols-2 gap-3 pb-4">
        {IDEA_CATEGORIES.map((cat) => {
          const count = ideas.filter((i) => i.category === cat).length
          const style = CATEGORY_STYLE[cat]
          const Icon = style.Icon
          return (
            <button
              key={cat}
              type="button"
              onClick={() => navigate(`/ideas?category=${encodeURIComponent(cat)}`)}
              className="flex min-h-[132px] flex-col items-start rounded-[1.35rem] p-4 text-left transition active:scale-[0.98]"
              style={{ backgroundColor: style.bg }}
            >
              <Icon className="h-6 w-6" style={{ color: style.fg }} strokeWidth={2.2} />
              <p className="mt-auto pt-6 text-[17px] font-bold">{cat}</p>
              <p className="text-[13px] text-muted">{napaduLabel(count)}</p>
            </button>
          )
        })}
      </div>

      {showAdd && (
        <Modal title="Nové rande" onClose={() => setShowAdd(false)}>
          <EventForm initial={newEventDraft()} onDone={() => setShowAdd(false)} />
        </Modal>
      )}
      {editEvent && (
        <Modal title="Upravit rande" onClose={() => setEditId(null)}>
          <EventForm initial={editEvent} allowDelete onDone={() => setEditId(null)} />
        </Modal>
      )}
    </div>
  )
}
