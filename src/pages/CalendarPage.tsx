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
import { enUS } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
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
    <div className="px-5 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[34px] font-bold tracking-tight">Kalendář</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-love shadow-md shadow-black/10"
          aria-label="Přidat rande"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mb-2 flex items-center justify-between px-1">
        <button
          onClick={() => setMonth(addMonths(month, -1))}
          className="rounded-full p-2 text-love"
          aria-label="Předchozí měsíc"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <p className="text-[18px] font-bold">
          {format(month, 'MMMM yyyy', { locale: enUS })}
        </p>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="rounded-full p-2 text-love"
          aria-label="Další měsíc"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[13px] font-medium text-muted">
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const has = events.some((e) => isSameDay(new Date(e.date), day))
          const selectedDay = isSameDay(day, selected)
          const inMonth = isSameMonth(day, month)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelected(day)}
              className={`relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-full text-[16px] font-medium ${
                selectedDay
                  ? 'bg-love text-white'
                  : inMonth
                    ? 'text-ink'
                    : 'text-muted/35'
              }`}
            >
              {format(day, 'd')}
              {has && !selectedDay && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-love" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-5 border-t border-black/[0.06] pt-5">
        <h2 className="mb-4 text-[20px] font-bold">
          {format(selected, 'd MMMM', { locale: enUS })}
        </h2>

        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted">
            <CalendarDays className="mb-2 h-8 w-8 opacity-40" strokeWidth={1.5} />
            <p className="text-[15px]">Žádné rande</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((e) => (
              <div key={e.id} className="rounded-[1.25rem] bg-chip p-4">
                <button className="w-full text-left" onClick={() => setEditId(e.id)}>
                  <p className="text-[17px] font-bold">{e.title}</p>
                  <p className="mt-0.5 text-[14px] text-muted">
                    {format(new Date(e.date), 'HH:mm')}
                  </p>
                  {e.location && <p className="mt-0.5 text-[14px] text-love">{e.location}</p>}
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
        )}
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
          <EventForm initial={editEvent} allowDelete onDone={() => setEditId(null)} />
        </Modal>
      )}
    </div>
  )
}
