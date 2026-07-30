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
import {
  isInvitationSender,
  respondInvitation,
  sendInvitation as sendInvitationApi,
  subscribeInvitation,
} from '../lib/inviteApi'
import type { DateEvent, DateInvitation, Idea, InviteDraft } from '../lib/types'

interface CoupleContextValue {
  code: string | null
  mode: AppMode
  cloudReady: boolean
  events: DateEvent[]
  ideas: Idea[]
  invitation: DateInvitation | null
  incomingInvitation: DateInvitation | null
  outgoingPendingInvitation: DateInvitation | null
  outgoingInvitationResult: DateInvitation | null
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
  sendInvitation: (draft: InviteDraft) => Promise<void>
  acceptInvitation: (invitation: DateInvitation) => Promise<void>
  declineInvitation: (invitation: DateInvitation) => Promise<void>
  dismissInvitationNotice: () => void
}

const CoupleContext = createContext<CoupleContextValue | null>(null)

export function CoupleProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(() => getSavedCoupleCode())
  const [mode, setMode] = useState<AppMode>(() => getAppMode())
  const [events, setEvents] = useState<DateEvent[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [invitation, setInvitation] = useState<DateInvitation | null>(null)
  const [inviteDismissed, setInviteDismissed] = useState(false)
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
        void publishCalendarFeed(coupleCode, nextEvents).catch(() => {})
      }, 800)
    },
    [mode],
  )

  useEffect(() => {
    if (!code) {
      setEvents([])
      setIdeas([])
      setInvitation(null)
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

  useEffect(() => {
    if (!code) {
      setInvitation(null)
      return
    }
    const unsub = subscribeInvitation(
      code,
      mode,
      (inv) => {
        setInvitation(inv)
        if (inv?.status === 'pending' && !isInvitationSender(inv)) {
          setInviteDismissed(false)
        }
      },
      (message) => setError(message),
    )
    return unsub
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
    setInvitation(null)
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

  const sendInvitation = useCallback(
    async (draft: InviteDraft) => {
      const c = requireCode()
      if (mode !== 'cloud') throw new Error('Pozvánka funguje jen s cloud párem.')
      setError(null)
      await sendInvitationApi(c, draft)
      setInviteDismissed(false)
    },
    [code, mode],
  )

  const acceptInvitation = useCallback(
    async (inv: DateInvitation) => {
      const c = requireCode()
      await respondInvitation(c, mode, inv, 'accepted')
      lastFeedSig.current = ''
      void publishCalendarFeed(c, events).catch(() => {})
    },
    [code, mode, events],
  )

  const declineInvitation = useCallback(
    async (inv: DateInvitation) => {
      await respondInvitation(requireCode(), mode, inv, 'declined')
    },
    [code, mode],
  )

  const dismissInvitationNotice = useCallback(() => {
    setInviteDismissed(true)
  }, [])

  const incomingInvitation = useMemo(() => {
    if (!invitation || invitation.status !== 'pending') return null
    if (isInvitationSender(invitation)) return null
    if (inviteDismissed) return null
    return invitation
  }, [invitation, inviteDismissed])

  const outgoingPendingInvitation = useMemo(() => {
    if (!invitation || invitation.status !== 'pending') return null
    if (!isInvitationSender(invitation)) return null
    return invitation
  }, [invitation])

  const outgoingInvitationResult = useMemo(() => {
    if (!invitation || invitation.status === 'pending') return null
    if (!isInvitationSender(invitation)) return null
    if (inviteDismissed) return null
    return invitation
  }, [invitation, inviteDismissed])

  const value = useMemo<CoupleContextValue>(
    () => ({
      code,
      mode,
      cloudReady: isFirebaseConfigured,
      events,
      ideas,
      invitation,
      incomingInvitation,
      outgoingPendingInvitation,
      outgoingInvitationResult,
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
        if (mode === 'cloud' && isFirebaseConfigured) {
          const nextEvents = events.some((e) => e.id === next.id)
            ? events.map((e) => (e.id === next.id ? next : e))
            : [...events, next]
          lastFeedSig.current = ''
          void publishCalendarFeed(c, nextEvents).catch(() => {})
        }
      },
      deleteEvent: async (id) => {
        const c = requireCode()
        await removeEvent(c, mode, id)
        if (mode === 'cloud' && isFirebaseConfigured) {
          const nextEvents = events.filter((e) => e.id !== id)
          lastFeedSig.current = ''
          void publishCalendarFeed(c, nextEvents).catch(() => {})
        }
      },
      saveIdea: async (idea) => {
        await upsertIdea(requireCode(), mode, { ...idea, updatedAt: new Date().toISOString() })
      },
      deleteIdea: async (id) => removeIdea(requireCode(), mode, id),
      uploadImage: async (file) => uploadEventImage(requireCode(), file),
      refreshCalendarFeed,
      sendInvitation,
      acceptInvitation,
      declineInvitation,
      dismissInvitationNotice,
    }),
    [
      code,
      mode,
      events,
      ideas,
      invitation,
      incomingInvitation,
      outgoingPendingInvitation,
      outgoingInvitationResult,
      loading,
      error,
      create,
      join,
      leave,
      repairSync,
      refreshCalendarFeed,
      sendInvitation,
      acceptInvitation,
      declineInvitation,
      dismissInvitationNotice,
    ],
  )

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
}

export function useCouple() {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple musí být uvnitř CoupleProvider')
  return ctx
}
