import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { cs } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useCouple } from '../context/CoupleContext'
import { Modal } from '../components/Modal'
import { EventForm } from '../components/EventForm'
import { LinkPreview } from '../components/LinkPreview'
import { newEventDraft } from '../lib/coupleApi'

export function CalendarPage() {
  const { events, saveEvent, deleteEvent } = useCouple()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [month])

  const dayEvents = events
    .filter((e) => isSameDay(new Date(e.date), selected))
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  const editEvent = events.find((e) => e.id === editId)

  return (
    <div className="px-5 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kalendář</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-love text-white"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="card mb-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => setMonth(addMonths(month, -1))} className="rounded-full p-2 hover:bg-black/5">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-semibold capitalize">
            {format(month, 'LLLL yyyy', { locale: cs })}
          </p>
          <button onClick={() => setMonth(addMonths(month, 1))} className="rounded-full p-2 hover:bg-black/5">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-muted">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const has = events.some((e) => isSameDay(new Date(e.date), day))
            const selectedDay = isSameDay(day, selected)
            const inMonth = isSameMonth(day, month)
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={`relative flex h-10 items-center justify-center rounded-full text-sm ${
                  selectedDay
                    ? 'bg-love text-white'
                    : inMonth
                      ? 'text-ink'
                      : 'text-muted/40'
                }`}
              >
                {format(day, 'd')}
                {has && !selectedDay && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-love" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mb-2 text-sm font-semibold capitalize">
        {format(selected, 'EEEE d. MMMM', { locale: cs })}
      </p>
      <div className="space-y-3">
        {dayEvents.length === 0 && (
          <p className="text-sm text-muted">Na tento den zatím nic není.</p>
        )}
        {dayEvents.map((e) => (
          <div key={e.id} className="card p-4">
            <button className="w-full text-left" onClick={() => setEditId(e.id)}>
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-muted">{format(new Date(e.date), 'HH:mm')}</p>
              {e.location && <p className="text-sm text-love">{e.location}</p>}
            </button>
            {e.link?.trim() && <LinkPreview url={e.link} className="mt-3" />}
            <div className="mt-3 flex gap-2">
              <button
                className="btn-secondary flex-1 text-sm"
                onClick={async () => {
                  await saveEvent({ ...e, isCompleted: !e.isCompleted })
                }}
              >
                {e.isCompleted ? 'Znovu otevřít' : 'Hotovo'}
              </button>
              <button
                className="btn-secondary text-sm text-red-600"
                onClick={async () => {
                  if (confirm('Smazat rande?')) await deleteEvent(e.id)
                }}
              >
                Smazat
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title="Nové rande" onClose={() => setShowAdd(false)}>
          <EventForm
            initial={newEventDraft({ date: selected.toISOString() })}
            onDone={() => setShowAdd(false)}
          />
        </Modal>
      )}
      {editEvent && (
        <Modal title="Upravit rande" onClose={() => setEditId(null)}>
          <EventForm initial={editEvent} onDone={() => setEditId(null)} />
        </Modal>
      )}
    </div>
  )
}
