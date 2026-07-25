import type { DateEvent, Idea } from './types'

const EVENTS_KEY = 'dateday.local.events'
const IDEAS_KEY = 'dateday.local.ideas'

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const localStore = {
  getEvents(): DateEvent[] {
    return read<DateEvent>(EVENTS_KEY)
  },
  setEvents(events: DateEvent[]) {
    write(EVENTS_KEY, events)
  },
  getIdeas(): Idea[] {
    return read<Idea>(IDEAS_KEY)
  },
  setIdeas(ideas: Idea[]) {
    write(IDEAS_KEY, ideas)
  },
}
