import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createCouple,
  getAppMode,
  getSavedCoupleCode,
  joinCouple,
  leaveCouple,
  removeEvent,
  removeIdea,
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
  saveEvent: (event: DateEvent) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  saveIdea: (idea: Idea) => Promise<void>
  deleteIdea: (id: string) => Promise<void>
  uploadImage: (file: File) => Promise<string>
}

const CoupleContext = createContext<CoupleContextValue | null>(null)

export function CoupleProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(() => getSavedCoupleCode())
  const [mode, setMode] = useState<AppMode>(() => getAppMode())
  const [events, setEvents] = useState<DateEvent[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(Boolean(getSavedCoupleCode()))
  const [error, setError] = useState<string | null>(null)

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
      },
      (message) => {
        setError(message)
        setLoading(false)
      },
    )
    return () => unsub()
  }, [code, mode])

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

  const leave = useCallback(() => {
    leaveCouple()
    setCode(null)
    setEvents([])
    setIdeas([])
  }, [])

  const requireCode = () => {
    if (!code) throw new Error('Nejdřív vytvoř nebo připoj pár.')
    return code
  }

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
      saveEvent: async (event) => {
        await upsertEvent(requireCode(), mode, { ...event, updatedAt: new Date().toISOString() })
      },
      deleteEvent: async (id) => removeEvent(requireCode(), mode, id),
      saveIdea: async (idea) => {
        await upsertIdea(requireCode(), mode, { ...idea, updatedAt: new Date().toISOString() })
      },
      deleteIdea: async (id) => removeIdea(requireCode(), mode, id),
      uploadImage: async (file) => uploadEventImage(requireCode(), file),
    }),
    [code, mode, events, ideas, loading, error, create, join, leave],
  )

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
}

export function useCouple() {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple musí být uvnitř CoupleProvider')
  return ctx
}
