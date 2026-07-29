import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createCouple,
  getAppMode,
  getSavedCoupleCode,
  joinCouple,
  leaveCouple,
  publishCalendarFeed,
  removeEvent,
  removeIdea,
  repairCloudSync,
  subscribeCoupleData,
  upsertEvent,
  upsertIdea,
  uploadEventImage,
  type AppMode,
} from '../lib/coupleApi'
import { isFirebaseConfigured } from '../lib/firebase'
import type { DateEvent, Idea } from '../lib/types'

interface CoupleContextValue {
  code: string | null
  mode: AppMode
  cloudReady: boolean
  events: DateEvent[]
  ideas: Idea[]
  loading: boolean
  error: string | null
  status: string
  create: () => Promise<string>
  join: (code: string) => Promise<void>
  leave: () => void
  repairSync: () => Promise<void>
  saveEvent: (event: DateEvent) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  saveIdea: (idea: Idea) => Promise<void>
  deleteIdea: (id: string) => Promise<void>
  uploadImage: (file: File) => Promise<string>
  refreshCalendarFeed: () => Promise<string | null>
}

const CoupleContext = createContext<CoupleContextValue | null>(null)

export function CoupleProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(() => getSavedCoupleCode())
  const [mode, setMode] = useState<AppMode>(() => getAppMode())
  const [events, setEvents] = useState<DateEvent[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(Boolean(getSavedCoupleCode()))
  const [error, setError] = useState<string | null>(null)
  const feedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFeedSig = useRef<string>('')

  useEffect(() => {
    if (!isFirebaseConfigured || !code) return
    const resolved = getAppMode()
    if (resolved !== mode) setMode(resolved)
  }, [code, mode])

  const scheduleCalendarPublish = useCallback(
    (coupleCode: string, nextEvents: DateEvent[]) => {
      if (!isFirebaseConfigured || mode !== 'cloud') return
      const sig = nextEvents
        .map((e) => `${e.id}:${e.updatedAt}:${e.title}:${e.date}`)
        .sort()
        .join('|')
      if (sig === lastFeedSig.current) return
      if (feedTimer.current) clearTimeout(feedTimer.current)
      feedTimer.current = setTimeout(() => {
        lastFeedSig.current = sig
        void publishCalendarFeed(coupleCode, nextEvents).catch(() => {
          // Feed publish is best-effort; don't block the UI.
        })
      }, 800)
    },
    [mode],
  )

  useEffect(() => {
    if (!code) {
      setEvents([])
      setIdeas([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = subscribeCoupleData(
      code,
      mode,
      (e, i) => {
        setEvents(e)
        setIdeas(i)
        setLoading(false)
        setError(null)
        scheduleCalendarPublish(code, e)
      },
      (message) => {
        setError(message)
        setLoading(false)
      },
    )
    return () => {
      unsub()
      if (feedTimer.current) clearTimeout(feedTimer.current)
    }
  }, [code, mode, scheduleCalendarPublish])

  const create = useCallback(async () => {
    setError(null)
    const result = await createCouple()
    setCode(result.code)
    setMode(result.mode)
    return result.code
  }, [])

  const join = useCallback(async (raw: string) => {
    setError(null)
    const result = await joinCouple(raw)
    setCode(result.code)
    setMode(result.mode)
  }, [])

  const repairSync = useCallback(async () => {
    if (!code) throw new Error('Nejdřív vytvoř nebo připoj pár.')
    setError(null)
    await repairCloudSync(code)
    setMode('cloud')
  }, [code])

  const leave = useCallback(() => {
    leaveCouple()
    setCode(null)
    setEvents([])
    setIdeas([])
    lastFeedSig.current = ''
  }, [])

  const requireCode = () => {
    if (!code) throw new Error('Nejdřív vytvoř nebo připoj pár.')
    return code
  }

  const refreshCalendarFeed = useCallback(async () => {
    if (!code || mode !== 'cloud' || !isFirebaseConfigured) return null
    lastFeedSig.current = ''
    return publishCalendarFeed(code, events)
  }, [code, mode, events])

  const value = useMemo<CoupleContextValue>(
    () => ({
      code,
      mode,
      cloudReady: isFirebaseConfigured,
      events,
      ideas,
      loading,
      error,
      status:
        !code
          ? 'Nejsi propojený/á'
          : mode === 'cloud'
            ? 'Cloud sync aktivní'
            : 'Lokální režim (bez cloudu — nastav Firebase pro sdílení na dálku)',
      create,
      join,
      leave,
      repairSync,
      saveEvent: async (event) => {
        const c = requireCode()
        const next = { ...event, updatedAt: new Date().toISOString() }
        await upsertEvent(c, mode, next)
      },
      deleteEvent: async (id) => removeEvent(requireCode(), mode, id),
      saveIdea: async (idea) => {
        await upsertIdea(requireCode(), mode, { ...idea, updatedAt: new Date().toISOString() })
      },
      deleteIdea: async (id) => removeIdea(requireCode(), mode, id),
      uploadImage: async (file) => uploadEventImage(requireCode(), file),
      refreshCalendarFeed,
    }),
    [code, mode, events, ideas, loading, error, create, join, leave, repairSync, refreshCalendarFeed],
  )

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
}

export function useCouple() {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple musí být uvnitř CoupleProvider')
  return ctx
}
