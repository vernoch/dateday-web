import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { ensureAnonAuth, getFirebase, isFirebaseConfigured } from './firebase'
import { generateCoupleCode, normalizeCode, uid } from './ids'
import { localStore } from './localStore'
import type { DateEvent, Idea } from './types'

const COUPLE_KEY = 'dateday.coupleCode'
const MODE_KEY = 'dateday.mode' // 'local' | 'cloud'

export type AppMode = 'local' | 'cloud'

export function getSavedCoupleCode(): string | null {
  return localStorage.getItem(COUPLE_KEY)
}

export function getAppMode(): AppMode {
  if (!isFirebaseConfigured) return 'local'
  const saved = localStorage.getItem(MODE_KEY) as AppMode | null
  if (saved === 'local') {
    setMode('cloud')
    return 'cloud'
  }
  return saved ?? 'cloud'
}

function normalizeEvent(raw: Partial<DateEvent> & { id: string }): DateEvent {
  const now = new Date().toISOString()
  return {
    id: raw.id,
    title: raw.title ?? '',
    date: raw.date ?? now,
    location: raw.location ?? '',
    notes: raw.notes ?? '',
    link: raw.link ?? '',
    imageUrl: raw.imageUrl,
    isCompleted: raw.isCompleted ?? false,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  }
}

function normalizeIdea(raw: Partial<Idea> & { id: string }): Idea {
  const now = new Date().toISOString()
  return {
    id: raw.id,
    title: raw.title ?? '',
    notes: raw.notes ?? '',
    link: raw.link ?? '',
    category: raw.category ?? 'Ostatní',
    status: raw.status ?? 'Wishlist',
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  }
}

function setCoupleCode(code: string | null) {
  if (code) localStorage.setItem(COUPLE_KEY, code)
  else localStorage.removeItem(COUPLE_KEY)
}

function setMode(mode: AppMode) {
  localStorage.setItem(MODE_KEY, mode)
}

export async function createCouple(): Promise<{ code: string; mode: AppMode }> {
  if (!isFirebaseConfigured) {
    const code = generateCoupleCode()
    setCoupleCode(code)
    setMode('local')
    return { code, mode: 'local' }
  }

  await ensureAnonAuth()
  const { db } = getFirebase()
  const code = generateCoupleCode()
  await setDoc(doc(db, 'couples', code), {
    createdAt: new Date().toISOString(),
  })
  setCoupleCode(code)
  setMode('cloud')
  return { code, mode: 'cloud' }
}

export async function joinCouple(raw: string): Promise<{ code: string; mode: AppMode }> {
  const code = normalizeCode(raw)
  if (code.length < 4) throw new Error('Kód je příliš krátký.')

  if (!isFirebaseConfigured) {
    // Local join = just share the same browser code label (no cross-device sync)
    setCoupleCode(code)
    setMode('local')
    return { code, mode: 'local' }
  }

  await ensureAnonAuth()
  const { db } = getFirebase()
  const snap = await getDoc(doc(db, 'couples', code))
  if (!snap.exists()) throw new Error('Pár s tímto kódem neexistuje.')
  setCoupleCode(code)
  setMode('cloud')
  return { code, mode: 'cloud' }
}

export function leaveCouple() {
  setCoupleCode(null)
  localStorage.removeItem(MODE_KEY)
}

export async function repairCloudSync(raw: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Cloud sync není dostupný.')
  }

  const code = normalizeCode(raw)
  if (code.length < 4) throw new Error('Kód je příliš krátký.')

  await ensureAnonAuth()
  const { db } = getFirebase()
  const snap = await getDoc(doc(db, 'couples', code))
  if (!snap.exists()) throw new Error('Pár s tímto kódem neexistuje.')

  setCoupleCode(code)
  setMode('cloud')
}

export function subscribeCoupleData(
  code: string,
  mode: AppMode,
  onData: (events: DateEvent[], ideas: Idea[]) => void,
  onError: (message: string) => void,
): Unsubscribe | (() => void) {
  if (mode === 'local' || !isFirebaseConfigured) {
    onData(localStore.getEvents(), localStore.getIdeas())
    const handler = () => onData(localStore.getEvents(), localStore.getIdeas())
    window.addEventListener('dateday-local-change', handler)
    return () => window.removeEventListener('dateday-local-change', handler)
  }

  const { db } = getFirebase()
  let events: DateEvent[] = []
  let ideas: Idea[] = []
  let ready = { e: false, i: false }
  let unsubE: Unsubscribe | null = null
  let unsubI: Unsubscribe | null = null
  let cancelled = false

  const push = () => {
    if (ready.e && ready.i) onData(events, ideas)
  }

  void ensureAnonAuth()
    .then(() => {
      if (cancelled) return

      unsubE = onSnapshot(
        collection(db, 'couples', code, 'events'),
        (snap) => {
          events = snap.docs.map((d) =>
            normalizeEvent({ id: d.id, ...(d.data() as Partial<DateEvent>) }),
          )
          ready.e = true
          push()
        },
        (err) => onError(err.message),
      )

      unsubI = onSnapshot(
        collection(db, 'couples', code, 'ideas'),
        (snap) => {
          ideas = snap.docs.map((d) =>
            normalizeIdea({ id: d.id, ...(d.data() as Partial<Idea>) }),
          )
          ready.i = true
          push()
        },
        (err) => onError(err.message),
      )
    })
    .catch((err) => {
      onError(err instanceof Error ? err.message : 'Přihlášení k cloudu selhalo.')
    })

  return () => {
    cancelled = true
    unsubE?.()
    unsubI?.()
  }
}

function bumpLocal() {
  window.dispatchEvent(new Event('dateday-local-change'))
}

export async function upsertEvent(code: string, mode: AppMode, event: DateEvent) {
  if (mode === 'local' || !isFirebaseConfigured) {
    const list = localStore.getEvents()
    const idx = list.findIndex((e) => e.id === event.id)
    if (idx >= 0) list[idx] = event
    else list.push(event)
    localStore.setEvents(list)
    bumpLocal()
    return
  }
  await ensureAnonAuth()
  const { db } = getFirebase()
  const { id, ...rest } = event
  await setDoc(doc(db, 'couples', code, 'events', id), rest, { merge: true })
}

export async function removeEvent(code: string, mode: AppMode, id: string) {
  if (mode === 'local' || !isFirebaseConfigured) {
    localStore.setEvents(localStore.getEvents().filter((e) => e.id !== id))
    bumpLocal()
    return
  }
  await ensureAnonAuth()
  const { db } = getFirebase()
  await deleteDoc(doc(db, 'couples', code, 'events', id))
}

export async function upsertIdea(code: string, mode: AppMode, idea: Idea) {
  if (mode === 'local' || !isFirebaseConfigured) {
    const list = localStore.getIdeas()
    const idx = list.findIndex((e) => e.id === idea.id)
    if (idx >= 0) list[idx] = idea
    else list.push(idea)
    localStore.setIdeas(list)
    bumpLocal()
    return
  }
  await ensureAnonAuth()
  const { db } = getFirebase()
  const { id, ...rest } = idea
  await setDoc(doc(db, 'couples', code, 'ideas', id), rest, { merge: true })
}

export async function removeIdea(code: string, mode: AppMode, id: string) {
  if (mode === 'local' || !isFirebaseConfigured) {
    localStore.setIdeas(localStore.getIdeas().filter((e) => e.id !== id))
    bumpLocal()
    return
  }
  await ensureAnonAuth()
  const { db } = getFirebase()
  await deleteDoc(doc(db, 'couples', code, 'ideas', id))
}

export async function uploadEventImage(code: string, file: File): Promise<string> {
  if (!isFirebaseConfigured) {
    // data URL fallback for local
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Nepodařilo se načíst fotku.'))
      reader.readAsDataURL(file)
    })
  }
  await ensureAnonAuth()
  const { storage } = getFirebase()
  const path = `couples/${code}/events/${uid()}-${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}

export function newEventDraft(partial?: Partial<DateEvent>): DateEvent {
  const now = new Date().toISOString()
  return {
    id: uid(),
    title: '',
    date: new Date().toISOString(),
    location: '',
    notes: '',
    link: '',
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function newIdeaDraft(partial?: Partial<Idea>): Idea {
  const now = new Date().toISOString()
  return {
    id: uid(),
    title: '',
    notes: '',
    link: '',
    category: 'Ostatní',
    status: 'Wishlist',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}
